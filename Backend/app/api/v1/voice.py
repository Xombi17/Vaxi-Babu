"""
Vapi Voice Webhook Handler
---------------------------
Vapi calls this endpoint when the voice agent needs real data mid-conversation.
Example: user asks "what vaccine is due next?" → Vapi calls this webhook
with tool_call payload → we return the answer → Vapi speaks it to the user.

Webhook events handled:
  - tool-calls: voice agent needs a specific data lookup
  - assistant-request: Vapi needs initial context to start a session
"""

import hashlib
import hmac
from typing import Any

import structlog
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.ai_service import answer_voice_question

log = structlog.get_logger()
settings = get_settings()
router = APIRouter(prefix="/voice", tags=["Voice (Vapi)"])


# ─────────────────────────────────────────────────────────────────────────────
# Vapi webhook payload models (simplified)
# ─────────────────────────────────────────────────────────────────────────────

class VapiToolCallResult(BaseModel):
    toolCallId: str
    result: str


class VapiWebhookResponse(BaseModel):
    results: list[VapiToolCallResult] | None = None
    messageResponse: dict[str, Any] | None = None


def _verify_vapi_signature(body: bytes, signature: str | None) -> bool:
    """Optionally verify Vapi webhook signature for security."""
    if not settings.vapi_webhook_secret:
        return True  # Skip verification if secret not configured (dev mode)
    if not signature:
        return False
    expected = hmac.new(
        settings.vapi_webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/webhook")
async def vapi_webhook(
    request: Request,
    x_vapi_signature: str | None = Header(default=None),
) -> dict[str, Any]:
    """
    Main Vapi webhook handler.
    Receives tool-call events and returns structured data for the voice agent.
    """
    body = await request.body()

    if not _verify_vapi_signature(body, x_vapi_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = await request.json()
    event_type = payload.get("message", {}).get("type", "")

    log.info("vapi_webhook_received", event_type=event_type)

    # ── Tool calls: voice agent needs data ────────────────────────────────
    if event_type == "tool-calls":
        tool_calls = payload.get("message", {}).get("toolCalls", [])
        results = []

        for call in tool_calls:
            tool_name = call.get("function", {}).get("name", "")
            tool_args = call.get("function", {}).get("arguments", {})
            call_id = call.get("id", "")

            result_text = await _handle_tool_call(tool_name, tool_args)

            results.append({
                "toolCallId": call_id,
                "result": result_text,
            })

        return {"results": results}

    # ── Assistant request: provide initial system context ─────────────────
    elif event_type == "assistant-request":
        return {
            "assistant": {
                "firstMessage": (
                    "Hello! I'm your WellSync health assistant. "
                    "You can ask me about your child's upcoming vaccinations or health checkups. "
                    "How can I help you today?"
                ),
                "model": {
                    "provider": "groq",
                    "model": settings.groq_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are a helpful family health assistant for WellSync AI. "
                                "Help parents understand their child's vaccination schedule. "
                                "Keep answers short, simple, and encouraging. "
                                "Never provide medical diagnoses."
                            )
                        }
                    ]
                }
            }
        }

    # ── Unknown event type — acknowledge and ignore ───────────────────────
    log.warning("vapi_unknown_event", event_type=event_type)
    return {"status": "received"}


async def _handle_tool_call(tool_name: str, args: dict[str, Any]) -> str:
    """Dispatch tool call to appropriate handler."""
    if tool_name == "answer_health_question":
        question = args.get("question", "")
        context = args.get("context", "")
        language = args.get("language", "en")
        return await answer_voice_question(question, context, language)

    # Unknown tool — safe fallback
    log.warning("vapi_unknown_tool", tool_name=tool_name)
    return "I'm sorry, I couldn't process that request. Please consult a healthcare worker."
