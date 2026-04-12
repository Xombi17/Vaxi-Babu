"""
Sarvam AI Service — Indian Languages (STT, TTS, Translation)
-----------------------------------------------------------
Provides:
- Translation: English → Hindi/Marathi (and other Indian languages)
- TTS: Text to Speech for Indian languages

STT: Use Deepgram "multi" mode via Vapi (not Sarvam) for real-time voice.
"""

import structlog

import httpx

from app.core.config import get_settings

log = structlog.get_logger()
settings = get_settings()

SARVAM_API_BASE = "https://api.sarvam.ai"

LANGUAGE_CODE_MAP = {
    "hi": "hi-IN",
    "mr": "mr-IN",
    "gu": "gu-IN",
    "bn": "bn-IN",
    "ta": "ta-IN",
    "te": "te-IN",
    "en": "en-IN",
}


async def translate_text(
    text: str,
    source_language: str = "en-IN",
    target_language: str = "hi-IN",
) -> str:
    """
    Translate text from source language to target language.
    Uses Sarvam Translate API.

    Args:
        text: Text to translate
        source_language: Source language code (e.g., "en-IN")
        target_language: Target language code (e.g., "hi-IN")

    Returns:
        Translated text
    """
    if not settings.sarvam_api_key:
        log.warning("sarvam_api_key_not_configured")
        return text

    if source_language == target_language:
        return text

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SARVAM_API_BASE}/text/translate",
                headers={
                    "api-subscription-key": settings.sarvam_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "input": text,
                    "source_language_code": source_language,
                    "target_language_code": target_language,
                },
            )
            response.raise_for_status()
            data = response.json()
            translated_text = data.get("translated_text", text)
            log.info("sarvam_translate_success", source=source_language, target=target_language)
            return translated_text

    except Exception as exc:
        log.warning("sarvam_translate_failed", error=str(exc), source=source_language, target=target_language)
        return text


async def text_to_speech(
    text: str,
    language: str = "hi-IN",
    voice_id: str = "bulbulv1",
) -> str | None:
    """
    Convert text to speech using Sarvam TTS.
    Returns base64 encoded audio (WAV format).

    Args:
        text: Text to convert to speech
        language: Language code (e.g., "hi-IN", "mr-IN")
        voice_id: Voice to use (default: bulbulv1)

    Returns:
        Base64 encoded audio string, or None if failed
    """
    if not settings.sarvam_api_key:
        log.warning("sarvam_api_key_not_configured")
        return None

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{SARVAM_API_BASE}/text-to-speech",
                headers={
                    "api-subscription-key": settings.sarvam_api_key,
                    "Content-Type": "application/json",
                },
                json={
                    "inputs": [text],
                    "target_language_code": language,
                    "voice_id": voice_id,
                },
            )
            response.raise_for_status()
            data = response.json()
            audio_base64 = data.get("audio", data.get("audio_base64"))
            log.info("sarvam_tts_success", language=language, voice_id=voice_id)
            return audio_base64

    except Exception as exc:
        log.warning("sarvam_tts_failed", error=str(exc), language=language)
        return None


async def translate_and_speak(
    english_text: str,
    target_language: str,
) -> str | None:
    """
    Translate English text to target language and convert to speech.
    Returns base64 encoded audio.

    Args:
        english_text: Text in English
        target_language: Target language code (e.g., "hi", "mr")

    Returns:
        Base64 encoded audio string, or None if failed
    """
    target_lang_code = LANGUAGE_CODE_MAP.get(target_language, "hi-IN")

    translated = await translate_text(
        text=english_text,
        source_language="en-IN",
        target_language=target_lang_code,
    )

    audio_base64 = await text_to_speech(
        text=translated,
        language=target_lang_code,
    )

    return audio_base64
