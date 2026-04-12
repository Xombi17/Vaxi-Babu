import asyncio
import json
from typing import Any

import structlog

log = structlog.get_logger()


class GeminiLiveClient:
    """Client for Google Gemini 3.1 Flash Live API for Hindi/Marathi voice."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.client = None
        self.session = None

    async def connect(self) -> bool:
        """Establish connection to Gemini Live API."""
        try:
            from google import genai
            from google.genai import types

            self.client = genai.Client(api_key=self.api_key)
            self.session = self.client.models.connect_live(
                model="gemini-3.1-flash-live-preview",
                config=types.LiveConnectConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        language_code="hi-IN",
                    ),
                ),
            )
            log.info("gemini_live_connected")
            return True
        except Exception as e:
            log.error("gemini_live_connection_failed", error=str(e))
            return False

    async def send_audio(self, audio_bytes: bytes) -> None:
        """Send raw PCM audio to Gemini."""
        if self.session:
            from google.genai import types

            await self.session.send_realtime_input(audio=types.Blob(data=audio_bytes, mime_type="audio/pcm;rate=16000"))

    async def send_text(self, text: str) -> None:
        """Send text input to Gemini."""
        if self.session:
            from google.genai import types

            await self.session.send_realtime_input(text=types.Content(text=text))

    async def receive(self) -> bytes | None:
        """Receive audio response from Gemini."""
        if self.session:
            try:
                async for reply in self.session.receive():
                    if reply.data:
                        return bytes(reply.data)
            except Exception as e:
                log.error("gemini_live_receive_error", error=str(e))
        return None

    async def close(self) -> None:
        """Close the Gemini Live connection."""
        if self.session:
            await self.session.close()
            self.session = None
            log.info("gemini_live_disconnected")


def get_voice_provider(language: str) -> str:
    """Determine which voice provider to use based on language."""
    if language in ("hi", "mr", "gu", "bn", "ta", "te"):
        return "gemini"
    return "vapi"


async def get_gemini_client(api_key: str) -> GeminiLiveClient | None:
    """Get or create Gemini Live client."""
    if not api_key:
        return None
    client = GeminiLiveClient(api_key)
    if await client.connect():
        return client
    return None
