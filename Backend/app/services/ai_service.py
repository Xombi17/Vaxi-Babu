"""
AI Service — Groq wrapper
--------------------------
All Groq LLM calls go through this service.
AI is used ONLY for:
  - Explaining health events in plain language
  - Answering voice questions about a dependent's health timeline
  - Simplifying medicine safety results for users

It must NEVER be used for:
  - Deciding whether a vaccine is needed
  - Medicine safety decisions
  - Medical diagnosis
"""

import structlog
from groq import AsyncGroq

from app.core.config import get_settings

log = structlog.get_logger()
settings = get_settings()

_client: AsyncGroq | None = None


def get_groq_client() -> AsyncGroq:
    global _client
    if _client is None:
        _client = AsyncGroq(api_key=settings.groq_api_key)
    return _client


# ─────────────────────────────────────────────────────────────────────────────
# System prompt shared across all health explanation calls
# ─────────────────────────────────────────────────────────────────────────────

_SYSTEM_PROMPT = """You are a helpful health assistant for WellSync AI.
Your job is to explain health events (vaccinations, checkups) in very simple language
for families in rural India. Many users have limited health literacy.

Rules you must always follow:
1. Use very simple language — explain as if to a first-time parent.
2. Keep answers short (2-4 sentences maximum unless asked otherwise).
3. Never diagnose a disease.
4. Never say a medicine or vaccine is definitely safe or unsafe.
5. Always encourage consulting a doctor or healthcare worker when in doubt.
6. If you don't know something, say so and suggest seeing a doctor.
7. Respond in the same language the user is writing in (Hindi or English).
"""


async def explain_health_event(
    event_name: str,
    why_it_matters: str,
    what_to_expect: str,
    language: str = "en",
) -> str:
    """
    Use Groq to produce a simplified, user-friendly explanation of a health event.
    Falls back to a static template if Groq fails.
    """
    try:
        client = get_groq_client()
        user_message = (
            f"Please explain this health event to a parent in simple language:\n\n"
            f"Event: {event_name}\n"
            f"Why it matters: {why_it_matters}\n"
            f"What to expect: {what_to_expect}\n\n"
            f"Respond in {'Hindi' if language == 'hi' else 'English'}."
        )
        chat = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=200,
            temperature=0.3,
        )
        return chat.choices[0].message.content.strip()

    except Exception as exc:
        log.warning("groq_explain_failed", error=str(exc), event_name=event_name)
        # Fallback: return structured static text
        return f"{event_name}: {why_it_matters} {what_to_expect}"


async def answer_voice_question(
    question: str,
    context: str,
    language: str = "en",
) -> str:
    """
    Answer a user's voice question using their health timeline context.
    Called by the Vapi webhook handler.
    """
    try:
        client = get_groq_client()
        user_message = (
            f"Context about this family's health schedule:\n{context}\n\n"
            f"User question: {question}\n\n"
            f"Respond in {'Hindi' if language == 'hi' else 'English'}. "
            f"Keep the response short and clear (under 60 words)."
        )
        chat = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=150,
            temperature=0.2,
        )
        return chat.choices[0].message.content.strip()

    except Exception as exc:
        log.warning("groq_voice_failed", error=str(exc))
        return "I'm sorry, I couldn't process that question right now. Please try again."


async def simplify_medicine_result(
    medicine_name: str,
    bucket: str,
    why_caution: str,
    language: str = "en",
) -> str:
    """
    Simplify a medicine safety result into plain language for the user.
    """
    try:
        client = get_groq_client()
        user_message = (
            f"A medicine safety checker found this result:\n"
            f"Medicine: {medicine_name}\n"
            f"Safety level: {bucket}\n"
            f"Reason: {why_caution}\n\n"
            f"Explain this to a patient in 2-3 very simple sentences. "
            f"Language: {'Hindi' if language == 'hi' else 'English'}."
        )
        chat = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=120,
            temperature=0.2,
        )
        return chat.choices[0].message.content.strip()

    except Exception as exc:
        log.warning("groq_medicine_simplify_failed", error=str(exc))
        return f"{medicine_name}: {why_caution}"
