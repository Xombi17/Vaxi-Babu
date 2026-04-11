"""
Vapi Voice Webhook Handler
---------------------------
Vapi calls this endpoint when the voice agent needs real data mid-conversation.
Example: user asks "what vaccine is due next?" → Vapi calls this webhook
with tool_call payload → we return the answer → Vapi speaks it to the user.

Webhook events handled:
  - tool-calls: voice agent needs a specific data lookup
  - assistant-request: Vapi needs initial context to start a session

Protection:
  - Rate limiting: prevents duplicate calls within a time window
  - Idempotency: prevents duplicate processing of same tool call
"""

import hashlib
import hmac
import time
from datetime import date
from typing import Any

import structlog
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
from sqlmodel import select

from app.core.config import get_settings
from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent
from app.models.household import Household
from app.models.conversation import Conversation
from app.services.ai_service import answer_voice_question

log = structlog.get_logger()
settings = get_settings()
router = APIRouter(prefix="/voice", tags=["Voice (Vapi)"])

# ─────────────────────────────────────────────────────────────────────────────
# Rate limiting and idempotency protection
# ─────────────────────────────────────────────────────────────────────────────

_processed_calls: dict[str, float] = {}
_rate_limit_cache: dict[str, float] = {}
RATE_LIMIT_WINDOW = 5.0  # seconds
IDEMPOTENCY_TTL = 300.0  # 5 minutes


def _get_call_key(call_id: str, tool_name: str) -> str:
    """Generate idempotency key for a tool call."""
    return f"{tool_name}:{call_id}"


def _is_duplicate_call(call_id: str, tool_name: str) -> bool:
    """Check if this call has already been processed."""
    key = _get_call_key(call_id, tool_name)
    now = time.time()

    if key in _processed_calls:
        age = now - _processed_calls[key]
        if age < IDEMPOTENCY_TTL:
            log.info("duplicate_call_rejected", call_id=call_id, tool=tool_name, age_seconds=age)
            return True
        del _processed_calls[key]

    _processed_calls[key] = now
    return False


def _check_rate_limit(identifier: str) -> bool:
    """Check if request is within rate limit. Returns True if allowed."""
    now = time.time()

    if identifier in _rate_limit_cache:
        last_request = _rate_limit_cache[identifier]
        if now - last_request < RATE_LIMIT_WINDOW:
            log.warning("rate_limit_exceeded", identifier=identifier)
            return False

    _rate_limit_cache[identifier] = now
    return True


def _cleanup_old_entries() -> None:
    """Clean up expired entries from caches."""
    now = time.time()
    expired_calls = [k for k, v in _processed_calls.items() if now - v > IDEMPOTENCY_TTL]
    for k in expired_calls:
        del _processed_calls[k]

    expired_limits = [k for k, v in _rate_limit_cache.items() if now - v > RATE_LIMIT_WINDOW]
    for k in expired_limits:
        del _rate_limit_cache[k]


async def _ensure_cleanup() -> None:
    """Periodically clean up old cache entries."""
    if len(_processed_calls) > 1000 or len(_rate_limit_cache) > 1000:
        _cleanup_old_entries()


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
    Includes rate limiting and idempotency protection.
    """
    body = await request.body()

    # if not _verify_vapi_signature(body, x_vapi_signature):
    #     raise HTTPException(status_code=401, detail="Invalid webhook signature")

    payload = await request.json()
    event_type = payload.get("message", {}).get("type", "")

    call_id = payload.get("message", {}).get("callId", "unknown")
    if call_id != "unknown" and not _check_rate_limit(call_id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Please wait before making another request.")

    await _ensure_cleanup()

    log.info("vapi_webhook_received", event_type=event_type, call_id=call_id)

    # ── Tool calls: voice agent needs data ────────────────────────────────
    if event_type == "tool-calls":
        tool_calls = payload.get("message", {}).get("toolCalls", [])
        results = []

        for call in tool_calls:
            cid = call.get("id", "")
            tool_name = call.get("function", {}).get("name", "")
            tool_args = call.get("function", {}).get("arguments", {})

            if _is_duplicate_call(cid, tool_name):
                results.append({"toolCallId": cid, "result": "[Duplicate request - already processed]"})
                continue

            result_text = ""
            async for session in get_session():
                result_text = await _handle_tool_call(tool_name, tool_args, session)
                household_id = tool_args.get("household_id", "")
                question = tool_args.get("question", "")
                if household_id and question:
                    await _record_interaction(household_id, question, result_text, session)
                break 

            results.append({"toolCallId": cid, "result": result_text})

        return {"results": results}

    elif event_type == "assistant-request":
        # Robust variable extraction (Vapi payloads vary by event type)
        msg = payload.get("message", {})
        call = msg.get("call", {})
        
        # Search all possible locations for variableValues
        vars = msg.get("variableValues") or \
               msg.get("assistantOverrides", {}).get("variableValues") or \
               call.get("assistantOverrides", {}).get("variableValues") or \
               payload.get("assistant", {}).get("variableValues") or {}

        h_id = vars.get("household_id")
        
        # 🔥 DEBUG FALLBACK: If ID is missing, find the seed household (Verma Family)
        if not h_id:
            from app.models.household import Household
            stmt = select(Household).where(Household.username == "verma")
            res = await session.execute(stmt)
            fallback_h = res.scalar_one_or_none()
            if fallback_h:
                h_id = fallback_h.id
                log.info("voice_fallback_id_used", household=fallback_h.name)

        lang = vars.get("language", "en")
        
        print(f"DEBUG: Vapi Webhook [{event_type}]. household_id: {h_id}, lang: {lang}")
        
        first_messages = {
            "en": "Hello! I'm your WellSync health assistant.",
            "hi": "नमस्ते! मैं आपका वेलसिंक स्वास्थ्य सहायक हूँ।",
            "mr": "नमस्कार! मी तुमचा वेलसिंक आरोग्य सहाय्यक आहे।",
        }
        
        first_message = first_messages.get(lang, first_messages["en"])
        child_names = []
        household_name = "User"
        
        if h_id:
            async for session in get_session():
                household = await session.get(Household, h_id)
                if household:
                    household_name = household.name
                    first_message = f"Hello {household.name} family! I'm your health assistant."
                
                res = await session.execute(select(Dependent).where(Dependent.household_id == h_id))
                children = res.scalars().all()
                child_names = [c.name for c in children]
                print(f"DEBUG: Found {len(child_names)} children for household {h_id}: {child_names}")
                break

        target_lang_name = {
            "hi": "Hindi", "mr": "Marathi", "gu": "Gujarati", "bn": "Bengali", "ta": "Tamil", "te": "Telugu"
        }.get(lang, "English")

        return {
            "assistant": {
                "firstMessage": first_message,
                "transcriber": {
                    "provider": "deepgram",
                    "language": "en-US" if lang == "en" else lang
                },
                "model": {
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                f"You are the WellSync health assistant for the {household_name} family. "
                                f"STRICT RULE: The user prefers {target_lang_name}. You MUST respond ONLY in {target_lang_name}. "
                                f"DYNAMIC CONTEXT: This household has children named: {', '.join(child_names) if child_names else 'NO CHILDREN REGISTERED'}. "
                                "ANTI-DEMO RULE: Never mention names like Olivia, Jackson, Emma, or any names not found in the DYNAMIC CONTEXT. "
                                "If the user asks for their children's names, list them: " + (', '.join(child_names) if child_names else "Tell them you don't see any children in their account yet.") + ". "
                                "\n\nGoals:\n"
                                "- Help parents understand vaccination status by calling tools.\n"
                                "- Provide health education.\n"
                                "\n\nMedical Safety:\n"
                                "- NO diagnosis. If emergency (e.g. trouble breathing), instruct to seek immediate medical care.\n"
                                "- Never fabricate data.\n"
                                "\n\nStyle: Simple, short sentences. Confirm actions."
                            ),
                        }
                    ],
                    "tools": [
                        {
                            "type": "function",
                            "function": {
                                "name": "answer_health_question",
                                "description": "Get health status and answer questions about a family or specific child's health timeline.",
                                "parameters": {
                                    "type": "object",
                                    "properties": {
                                        "question": {"type": "string", "description": "The user's health related question."},
                                        "household_id": {"type": "string", "description": "The ID of the family household."},
                                        "dependent_id": {"type": "string", "description": "OPTIONAL: The specific child's ID. Leave empty if asking about the whole family or if child is unnamed."},
                                        "language": {"type": "string", "description": "The language code to use for the response (e.g. 'hi', 'en')."}
                                    },
                                    "required": ["question", "household_id"]
                                }
                            }
                        },
                        {
                            "type": "function",
                            "function": {
                                "name": "get_household_dependents",
                                "description": "List all members/children in the household.",
                                "parameters": {
                                    "type": "object",
                                    "properties": {
                                        "household_id": {"type": "string", "description": "The ID of the family household."}
                                    },
                                    "required": ["household_id"]
                                }
                            }
                        }
                    ]
                },
            }
        }

    # ── Unknown event type — acknowledge and ignore ───────────────────────
    log.warning("vapi_unknown_event", event_type=event_type)
    return {"status": "received"}


async def _handle_tool_call(
    tool_name: str,
    args: dict[str, Any],
    session,
) -> str:
    """Dispatch tool call to appropriate handler with DB context."""

    if tool_name == "answer_health_question":
        question = args.get("question", "")
        household_id = args.get("household_id", "")
        dependent_id = args.get("dependent_id", "")
        language = args.get("language", "en")

        if not dependent_id and household_id:
            result = await session.execute(select(Dependent).where(Dependent.household_id == household_id))
            dependents = result.scalars().all()
            if len(dependents) == 1:
                dependent_id = dependents[0].id
                log.info("defaulting_to_only_dependent", dependent_id=dependent_id)

        context = await _build_health_context(household_id, dependent_id, session)
        return await answer_voice_question(question, context, language)

    if tool_name == "get_household_dependents":
        household_id = args.get("household_id", "")
        return await _get_dependents_for_household(household_id, session)

    if tool_name == "get_timeline_summary":
        dependent_id = args.get("dependent_id", "")
        return await _get_timeline_summary(dependent_id, session)

    if tool_name == "get_next_vaccine":
        dependent_id = args.get("dependent_id", "")
        return await _get_next_vaccine(dependent_id, session)

    log.warning("vapi_unknown_tool", tool_name=tool_name)
    return "I'm sorry, I couldn't process that request. Please consult a healthcare worker."


async def _build_health_context(
    household_id: str,
    dependent_id: str,
    session,
) -> str:
    """Build a detailed context string from the household's actual health data."""
    context_parts = []

    household = await session.get(Household, household_id)
    if household:
        context_parts.append(f"Family: {household.name}")
        if household.village_town:
            context_parts.append(f"Location: {household.village_town}")
        if household.state:
            context_parts.append(f"State: {household.state}")

    if dependent_id:
        dependents = [await session.get(Dependent, dependent_id)]
    elif household_id:
        result = await session.execute(select(Dependent).where(Dependent.household_id == household_id))
        dependents = result.scalars().all()
    else:
        dependents = []

    for dependent in dependents:
        if not dependent:
            continue
            
        context_parts.append(f"\nSubject: {dependent.name}")
        dob = dependent.date_of_birth
        age_days = (date.today() - dob).days
        if age_days < 30:
            age_str = f"{age_days} days"
        elif age_days < 365:
            age_str = f"{age_days // 30} months"
        else:
            years = age_days // 365
            months = (age_days % 365) // 30
            if months > 0:
                age_str = f"{years} years {months} months"
            else:
                age_str = f"{years} years"
        context_parts.append(f"Age: {age_str}")

        result = await session.execute(
            select(HealthEvent)
            .where(HealthEvent.dependent_id == dependent.id)
            .where(HealthEvent.status != EventStatus.completed)
            .order_by(HealthEvent.due_date)
            .limit(5)
        )
        events = result.scalars().all()

        if events:
            context_parts.append(f"Upcoming for {dependent.name}:")
            for e in events:
                due_str = e.due_date.strftime("%d %b %Y") if isinstance(e.due_date, date) else str(e.due_date)[:10]
                context_parts.append(f"  - {e.name} ({e.status.value}, due: {due_str})")

        result = await session.execute(
            select(HealthEvent)
            .where(HealthEvent.dependent_id == dependent.id)
            .where(HealthEvent.status == EventStatus.completed)
        )
        comp_events = result.scalars().all()
        if comp_events:
            context_parts.append(f"Completed for {dependent.name}: {len(comp_events)} events")

    history = await _get_conversation_history(household_id, session)
    if history:
        context_parts.append("\n--- Recent Conversation History (Health Memory) ---")
        for h in history:
            context_parts.append(f"  - {h['role'].upper()}: {h['content']}")

    return "\n".join(context_parts)


async def _record_interaction(household_id: str, question: str, answer: str, session) -> None:
    """Save a conversation turn to the database for future context."""
    try:
        user_turn = Conversation(household_id=household_id, role="user", content=question)
        assistant_turn = Conversation(household_id=household_id, role="assistant", content=answer)
        session.add(user_turn)
        session.add(assistant_turn)
        await session.commit()
        log.info("conversation_recorded", household_id=household_id)
    except Exception as e:
        log.error("conversation_record_failed", error=str(e))


async def _get_conversation_history(household_id: str, session, limit: int = 6) -> list[dict[str, str]]:
    """Fetch recent conversation turns for health memory context."""
    if not household_id:
        return []
        
    try:
        result = await session.execute(
            select(Conversation)
            .where(Conversation.household_id == household_id)
            .order_by(Conversation.created_at.desc())
            .limit(limit)
        )
        conversations = result.scalars().all()
        return [{"role": c.role, "content": c.content} for c in reversed(conversations)]
    except Exception as e:
        log.error("conversation_history_fetch_failed", error=str(e))
        return []


async def _get_dependents_for_household(household_id: str, session) -> str:
    """Return a list of dependents (children) for a household."""
    result = await session.execute(select(Dependent).where(Dependent.household_id == household_id))
    dependents = result.scalars().all()

    if not dependents:
        return "No children found in this household."

    lines = ["Children in this family:"]
    today = date.today()
    for d in dependents:
        age_days = (today - d.date_of_birth).days
        if age_days < 30:
            age_str = f"{age_days} days"
        elif age_days < 365:
            age_str = f"{age_days // 30} months"
        else:
            years = age_days // 365
            age_str = f"{years} years"
        lines.append(f"  - {d.name}, {age_str}, {d.type.value}")

    return "\n".join(lines)


async def _get_timeline_summary(dependent_id: str, session) -> str:
    """Return a summary of the child's health timeline."""
    result = await session.execute(
        select(HealthEvent).where(HealthEvent.dependent_id == dependent_id).order_by(HealthEvent.due_date)
    )
    events = result.scalars().all()

    if not events:
        return "No health events found. Please add the child first."

    overdue = [e for e in events if e.status == EventStatus.overdue]
    due = [e for e in events if e.status == EventStatus.due]
    upcoming = [e for e in events if e.status == EventStatus.upcoming]
    completed = [e for e in events if e.status == EventStatus.completed]

    summary = [
        f"Total vaccines: {len(events)}",
        f"Completed: {len(completed)}",
        f"Due now: {len(due)}",
        f"Overdue: {len(overdue)}",
        f"Upcoming: {len(upcoming)}",
    ]

    if overdue:
        summary.append(f"\n⚠️ OVERDUE: {', '.join([e.name for e in overdue])}")
    if due:
        summary.append(f"\n📅 Due this week: {', '.join([e.name for e in due])}")

    return " | ".join(summary)


async def _get_next_vaccine(dependent_id: str, session) -> str:
    """Return the most urgent upcoming vaccine/event."""
    result = await session.execute(
        select(HealthEvent)
        .where(HealthEvent.dependent_id == dependent_id)
        .where(HealthEvent.status != EventStatus.completed)
        .order_by(HealthEvent.due_date)
        .limit(1)
    )
    event = result.scalars().first()

    if not event:
        return "All vaccinations are completed! Great job!"

    due_str = event.due_date.strftime("%d %b %Y") if isinstance(event.due_date, date) else str(event.due_date)[:10]

    response = f"Next: {event.name} is {event.status.value} (due: {due_str})"

    if event.status == EventStatus.overdue:
        response += ". Please get this done as soon as possible."
    elif event.status == EventStatus.due:
        response += ". Please get this done this week."

    return response
