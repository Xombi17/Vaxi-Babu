from typing import Literal

from pydantic import BaseModel, Field


class MedicineSafetyRequest(BaseModel):
    """Used when medicine name is known directly (without image upload)."""
    medicine_name: str = Field(min_length=1, max_length=300)
    concern: str | None = Field(
        default=None,
        description="Optional specific concern, e.g. 'pregnancy', 'breastfeeding', 'child under 5'"
    )


SafetyBucket = Literal[
    "common_use",
    "use_with_caution",
    "insufficient_info",
    "consult_doctor_urgently",
]


class MedicineSafetyResponse(BaseModel):
    detected_medicine: str
    confidence: float = Field(ge=0.0, le=1.0)
    bucket: SafetyBucket
    concern_checked: str
    why_caution: str
    next_step: str
    disclaimer: str = (
        "This is not medical advice. Always consult a doctor or pharmacist "
        "before using any medicine, especially during pregnancy or for children."
    )
    # OCR metadata (only present when image was uploaded)
    raw_ocr_text: str | None = None
    ocr_model_used: str | None = None
