"""
OCR Service — GitHub Models Vision
-------------------------------------------------------------------------
Extracts text from medicine packaging images using GitHub Models Vision via OpenAI client.
"""

import base64
import io

import structlog
from PIL import Image

from app.core.config import get_settings
from app.services.ai_service import get_ai_client

log = structlog.get_logger()
settings = get_settings()

OCR_PROMPT = (
    "You are an OCR assistant. Extract ALL text visible in this image of medicine "
    "packaging, a medicine strip, or a printed prescription. "
    "Return ONLY the extracted text — no explanations, no summarization. "
    "Preserve the original formatting as much as possible."
)


def _image_to_base64_url(image_bytes: bytes, max_size: int = 1024) -> str:
    """Resize image if too large, then return base64 data url."""
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
    b64_str = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/jpeg;base64,{b64_str}"


async def extract_text_from_image(image_bytes: bytes) -> tuple[str, str]:
    """
    Main OCR entry point.
    Returns (extracted_text, model_used_label).
    Raises RuntimeError if OCR fails.
    """
    try:
        client = get_ai_client()
        image_url = _image_to_base64_url(image_bytes)

        chat = await client.chat.completions.create(
            model=settings.github_vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": OCR_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": image_url,
                            },
                        },
                    ],
                }
            ],
            max_tokens=600,
            temperature=0.1,
        )
        text = chat.choices[0].message.content.strip()
        log.info("ocr_success", model=settings.github_vision_model, chars=len(text))
        return text, settings.github_vision_model
    except Exception as exc:
        log.error("github_models_ocr_failed", error=str(exc))
        raise RuntimeError(f"OCR failed via GitHub Models: {exc}") from exc

