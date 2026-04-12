"""
AI Service — GitHub Models wrapper
--------------------------
All AI calls go through this service.
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
from openai import AsyncOpenAI

from app.core.config import get_settings

log = structlog.get_logger()
settings = get_settings()

_client: AsyncOpenAI | None = None


def get_ai_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        _client = AsyncOpenAI(
            api_key=settings.github_token,
            base_url=settings.github_models_base_url,
        )
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
7. Respond in the language specified in the prompt or the same language the user is writing in.
"""


LANGUAGE_MAP = {
    "hi": "Hindi",
    "en": "English",
    "mr": "Marathi",
    "bn": "Bengali",
    "ta": "Tamil",
    "te": "Telugu",
    "gu": "Gujarati",
}


async def explain_health_event(
    event_name: str,
    why_it_matters: str,
    what_to_expect: str,
    language: str = "en",
) -> str:
    """
    Use AI to produce a simplified, user-friendly explanation of a health event.
    """
    try:
        client = get_ai_client()
        target_lang = LANGUAGE_MAP.get(language, "English")
        user_message = (
            f"Please explain this health event to a parent in simple language:\n\n"
            f"Event: {event_name}\n"
            f"Why it matters: {why_it_matters}\n"
            f"What to expect: {what_to_expect}\n\n"
            f"Respond in {target_lang}."
        )
        chat = await client.chat.completions.create(
            model=settings.github_chat_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=200,
            temperature=0.3,
        )
        return chat.choices[0].message.content.strip()

    except Exception as exc:
        log.warning("ai_explain_failed", error=str(exc), event_name=event_name)
        return f"{event_name}: {why_it_matters} {what_to_expect}"


async def answer_voice_question(
    question: str,
    context: str,
    language: str = "en",
) -> str:
    """
    Answer a user's voice question using their health timeline context.
    """
    try:
        client = get_ai_client()
        target_lang = LANGUAGE_MAP.get(language, "English")
        user_message = (
            f"Context about this family's health schedule:\n{context}\n\n"
            f"User question: {question}\n\n"
            f"Respond in {target_lang}. Keep the response short and clear (under 60 words).\n"
            f"RULES:\n"
            f"1. Never ask the user for a technical ID or UUID. Refer to children only by their names.\n"
            f"2. If asked about a specific child (like 'Saanvi') who is NOT listed in the Context above, clearly state 'You do not have a child named [Name] registered on your account' and list the actual children present in the context.\n"
            f"3. Do not assume names. Base your entire answer strictly on the provided Context."
        )
        chat = await client.chat.completions.create(
            model=settings.github_chat_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=150,
            temperature=0.2,
        )
        return chat.choices[0].message.content.strip()

    except Exception as exc:
        log.warning("ai_voice_failed", error=str(exc))
        return "I'm sorry, I couldn't process that question right now."


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
        client = get_ai_client()
        target_lang = LANGUAGE_MAP.get(language, "English")
        user_message = (
            f"A medicine safety checker found this result:\n"
            f"Medicine: {medicine_name}\n"
            f"Safety level: {bucket}\n"
            f"Reason: {why_caution}\n\n"
            f"Explain this to a patient in 2-3 very simple sentences. "
            f"Language: {target_lang}."
        )
        chat = await client.chat.completions.create(
            model=settings.github_chat_model,
            messages=[
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            max_tokens=150,
            temperature=0.2,
        )
        return chat.choices[0].message.content.strip()

    except Exception as exc:
        log.warning("ai_medicine_simplify_failed", error=str(exc))
        return f"{medicine_name}: {why_caution}"
    

async def detect_completion_intent(
    text: str,
    context: str,
) -> dict | None:
    """
    Look for a health event completion intent in user text.
    Returns { "event_name": "...", "dependent_name": "..." } or None.
    """
    try:
        client = get_ai_client()
        system_prompt = (
            "You are a structured intent extractor for health events. "
            "Your job is to detect if a user is reporting that a health event (vaccine, checkup) is COMPLETED or DONE. "
            "Context provided lists children and their pending events. "
            "ONLY extract if the user is clearly stating it is DONE or COMPLETED by them or the child. "
            "Return JSON in format: {'event_name': string, 'dependent_name': string} or null if no clear completion reported."
        )
        user_message = f"Context:\n{context}\n\nUser text: {text}"
        
        chat = await client.chat.completions.create(
            model=settings.github_chat_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            response_format={"type": "json_object"},
            max_tokens=100,
            temperature=0.0,
        )
        import json
        return json.loads(chat.choices[0].message.content)

    except Exception as exc:
        log.warning("intent_detection_failed", error=str(exc))
        return None
