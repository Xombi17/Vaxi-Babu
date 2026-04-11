"""
OCR Service — Gemma 4 via Ollama (primary) → Llama 3.2 Vision (fallback)
-------------------------------------------------------------------------
Extracts text from medicine packaging images using local vision models.
Falls back to Google Cloud Vision API if both local models fail.
"""

import base64
import io

import httpx
import structlog
from PIL import Image

from app.core.config import get_settings

log = structlog.get_logger()
settings = get_settings()

OCR_PROMPT = (
    "You are an OCR assistant. Extract ALL text visible in this image of medicine "
    "packaging, a medicine strip, or a printed prescription. "
    "Return ONLY the extracted text — no explanations, no summarization. "
    "Preserve the original formatting as much as possible."
)


def _image_to_base64(image_bytes: bytes, max_size: int = 1024) -> str:
    """Resize image if too large, then return base64 string."""
    img = Image.open(io.BytesIO(image_bytes))

    # Convert to RGB (in case of RGBA / palette images)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Resize to max_size on longest edge to save tokens
    ratio = min(max_size / img.width, max_size / img.height)
    if ratio < 1.0:
        new_size = (int(img.width * ratio), int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=85)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


async def _ollama_ocr(image_b64: str, model: str) -> str | None:
    """Call Ollama local model for OCR. Returns extracted text or None on failure."""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": OCR_PROMPT,
                    "images": [image_b64],
                    "stream": False,
                },
            )
            response.raise_for_status()
            data = response.json()
            text = data.get("response", "").strip()
            if not text:
                return None
            return text

    except Exception as exc:
        log.warning("ollama_ocr_failed", model=model, error=str(exc))
        return None


async def _google_vision_ocr(image_bytes: bytes) -> str | None:
    """Fallback: Google Cloud Vision API for OCR."""
    if not settings.google_cloud_vision_api_key:
        return None
    try:
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://vision.googleapis.com/v1/images:annotate"
                f"?key={settings.google_cloud_vision_api_key}",
                json={
                    "requests": [{
                        "image": {"content": image_b64},
                        "features": [{"type": "DOCUMENT_TEXT_DETECTION"}],
                    }]
                },
            )
            response.raise_for_status()
            data = response.json()
            full_text = (
                data.get("responses", [{}])[0]
                .get("fullTextAnnotation", {})
                .get("text", "")
                .strip()
            )
            return full_text or None

    except Exception as exc:
        log.warning("google_vision_ocr_failed", error=str(exc))
        return None


async def extract_text_from_image(image_bytes: bytes) -> tuple[str, str]:
    """
    Main OCR entry point.
    Returns (extracted_text, model_used_label).
    Raises RuntimeError if all methods fail.
    """
    image_b64 = _image_to_base64(image_bytes)

    # 1. Try primary model (Gemma 4)
    text = await _ollama_ocr(image_b64, settings.ollama_primary_model)
    if text:
        log.info("ocr_success", model=settings.ollama_primary_model, chars=len(text))
        return text, settings.ollama_primary_model

    # 2. Try fallback model (Llama 3.2 Vision)
    log.info("ocr_primary_failed_trying_fallback", fallback=settings.ollama_fallback_model)
    text = await _ollama_ocr(image_b64, settings.ollama_fallback_model)
    if text:
        log.info("ocr_success", model=settings.ollama_fallback_model, chars=len(text))
        return text, settings.ollama_fallback_model

    # 3. Try Google Cloud Vision
    log.info("ocr_ollama_failed_trying_google_vision")
    text = await _google_vision_ocr(image_bytes)
    if text:
        log.info("ocr_success", model="google_cloud_vision", chars=len(text))
        return text, "google_cloud_vision"

    raise RuntimeError(
        "All OCR methods failed. Ensure Ollama is running with gemma4 and llama3.2-vision, "
        "or configure GOOGLE_CLOUD_VISION_API_KEY."
    )
