"""
Medicine Safety API
-------------------
Endpoint 1: POST /medicine/check-image — upload image, run OCR → classify → simplify
Endpoint 2: POST /medicine/check-name  — classify by medicine name directly
"""

import structlog
from fastapi import APIRouter, File, HTTPException, UploadFile

from app.schemas.medicine import MedicineSafetyRequest, MedicineSafetyResponse
from app.services.ai_service import simplify_medicine_result
from app.services.medicine_safety import classify_medicine
from app.services.ocr_service import extract_text_from_image

log = structlog.get_logger()
router = APIRouter(prefix="/medicine", tags=["Medicine Safety"])

_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


def _extract_medicine_name_from_ocr(raw_text: str) -> str:
    """
    Naive heuristic: return the longest word on the first 3 lines of OCR output.
    Replace with smarter NER in v2.
    """
    lines = [line.strip() for line in raw_text.strip().splitlines() if line.strip()][:3]
    words = " ".join(lines).split()
    if not words:
        return raw_text[:50]
    return max(words, key=len)


@router.post("/check-image", response_model=MedicineSafetyResponse)
async def check_medicine_from_image(
    file: UploadFile = File(...),
    concern: str | None = None,
    language: str = "en",
) -> MedicineSafetyResponse:
    """
    Upload a photo of medicine packaging or a prescription.
    Returns a safety classification with plain-language explanation.
    """
    if file.content_type not in ("image/jpeg", "image/png", "image/webp", "image/heic"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, or HEIC images are accepted.")

    image_bytes = await file.read()
    if len(image_bytes) > _MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large. Maximum 10 MB.")

    # Step 1: OCR
    try:
        raw_text, model_used = await extract_text_from_image(image_bytes)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=f"OCR failed: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract any text from the image.")

    # Step 2: Extract medicine name from OCR text
    medicine_name = _extract_medicine_name_from_ocr(raw_text)
    log.info("medicine_ocr_complete", medicine_guess=medicine_name, ocr_model=model_used)

    # Step 3: Classify
    bucket, concern_checked, why_caution, next_step, confidence = classify_medicine(medicine_name, concern)

    # Step 4: AI simplification (optional, non-blocking)
    try:
        simplified_why = await simplify_medicine_result(medicine_name, bucket, why_caution, language)
    except Exception:
        simplified_why = why_caution

    return MedicineSafetyResponse(
        detected_medicine=medicine_name,
        confidence=confidence,
        bucket=bucket,
        concern_checked=concern_checked,
        why_caution=simplified_why,
        next_step=next_step,
        raw_ocr_text=raw_text,
        ocr_model_used=model_used,
    )


@router.post("/check-name", response_model=MedicineSafetyResponse)
async def check_medicine_by_name(
    body: MedicineSafetyRequest,
    language: str = "en",
) -> MedicineSafetyResponse:
    """
    Check medicine safety by name (no image needed).
    Useful when the frontend already knows the medicine name.
    """
    bucket, concern_checked, why_caution, next_step, confidence = classify_medicine(body.medicine_name, body.concern)

    try:
        simplified_why = await simplify_medicine_result(body.medicine_name, bucket, why_caution, language)
    except Exception:
        simplified_why = why_caution

    return MedicineSafetyResponse(
        detected_medicine=body.medicine_name,
        confidence=confidence,
        bucket=bucket,
        concern_checked=concern_checked,
        why_caution=simplified_why,
        next_step=next_step,
    )
