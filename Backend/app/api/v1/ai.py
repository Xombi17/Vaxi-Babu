"""
AI Explanation API
------------------
Wraps Groq calls for the frontend to request plain-language explanations.
All AI calls are server-side — API key never touches the browser.
"""


import structlog
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.models.health_event import HealthEvent
from app.services.ai_service import answer_voice_question, explain_health_event
from app.services.health_schedule.rules import _load_schedule

log = structlog.get_logger()
router = APIRouter(prefix="/ai", tags=["AI Explanations"])


class ExplainEventRequest(BaseModel):
    event_id: str
    language: str = "en"


class ExplainEventResponse(BaseModel):
    event_id: str
    event_name: str
    explanation: str


class VoiceQuestionRequest(BaseModel):
    question: str
    context: str      # Serialized timeline context from the frontend
    language: str = "en"


class VoiceQuestionResponse(BaseModel):
    answer: str


@router.post("/explain-event", response_model=ExplainEventResponse)
async def explain_event(
    body: ExplainEventRequest,
    session: AsyncSession = Depends(get_session),
) -> ExplainEventResponse:
    """
    Given a health event ID, return an AI-generated plain-language explanation.
    Looks up the schedule rule to get the structured 'why it matters' text.
    """
    event = await session.get(HealthEvent, body.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Health event not found")

    # Look up schedule metadata for richer explanation context
    schedule = _load_schedule()
    vaccine_meta = next(
        (v for v in schedule["vaccines"] if v["key"] == event.schedule_key), None
    )

    why_it_matters = vaccine_meta["why_it_matters"] if vaccine_meta else ""
    what_to_expect = vaccine_meta["what_to_expect"] if vaccine_meta else ""

    explanation = await explain_health_event(
        event_name=event.name,
        why_it_matters=why_it_matters,
        what_to_expect=what_to_expect,
        language=body.language,
    )

    return ExplainEventResponse(
        event_id=body.event_id,
        event_name=event.name,
        explanation=explanation,
    )


@router.post("/voice-answer", response_model=VoiceQuestionResponse)
async def voice_answer(body: VoiceQuestionRequest) -> VoiceQuestionResponse:
    """
    Answer a natural language question from a voice session.
    Context is provided by the caller (Vapi webhook or frontend directly).
    """
    answer = await answer_voice_question(
        question=body.question,
        context=body.context,
        language=body.language,
    )
    return VoiceQuestionResponse(answer=answer)
