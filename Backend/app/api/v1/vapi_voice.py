"""
Fresh Vapi Voice Implementation
================================
Complete rewrite of Vapi voice handling to work like Gemini Live.
Direct database access, proper tool handling, no complex caching logic.

Key differences from old implementation:
1. Simple, direct tool execution
2. No JSON parsing tricks
3. Clear response format
4. Direct database queries
5. Proper error handling
"""

import json
import time
from datetime import date
from typing import Any

import structlog
from fastapi import APIRouter, HTTPException, Request
from sqlmodel import select

from app.core.config import get_settings
from app.core.database import get_session
from app.models.dependent import Dependent
from app.models.health_event import EventStatus, HealthEvent
from app.models.household import Household
from app.services.ai_service import answer_voice_question

log = structlog.get_logger()
settings = get_settings()
router = APIRouter(prefix="/voice", tags=["Voice (Vapi)"])


@router.post("/vapi/webhook")
async def vapi_webhook(request: Request) -> dict[str, Any]:
    """
    Main Vapi webhook handler.
    Handles both assistant-request and tool-calls events.
    """
    try:
        payload = await request.json()
    except Exception as e:
        log.error("webhook_json_parse_failed", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON")

    message = payload.get("message", {})
    event_type = message.get("type", "")
    call_id = message.get("callId", "unknown")

    log.info("vapi_webhook_received", event_type=event_type, call_id=call_id)

    # Handle assistant-request: Vapi asking for initial config
    if event_type == "assistant-request":
        return await _handle_assistant_request(payload, call_id)

    # Handle tool-calls: Vapi asking for tool execution
    if event_type == "tool-calls":
        return await _handle_tool_calls(payload, call_id)

    # Handle other events (status-update, transcript, etc.)
    log.info("vapi_event_received", event_type=event_type, call_id=call_id)
    return {"status": "received"}


async def _handle_assistant_request(payload: dict[str, Any], call_id: str) -> dict[str, Any]:
    """
    Vapi is requesting initial assistant configuration.
    Return system prompt, tools, and initial message.
    """
    message = payload.get("message", {})
    call = message.get("call", {})

    # Extract variables from multiple possible locations
    vars_dict = (
        message.get("variableValues")
        or message.get("assistantOverrides", {}).get("variableValues")
        or call.get("assistantOverrides", {}).get("variableValues")
        or payload.get("assistant", {}).get("variableValues")
        or {}
    )

    household_id = vars_dict.get("household_id", "")
    language = vars_dict.get("language", "en")
    language_name = vars_dict.get("language_name", "English")

    log.info(
        "assistant_request_received",
        call_id=call_id,
        household_id=household_id,
        language=language,
    )

    # Fetch household and dependents from database
    household_name = "User"
    child_names = []

    async for session in get_session():
        if household_id:
            household = await session.get(Household, household_id)
            if household:
                household_name = household.name

            # Get all dependents
            stmt = select(Dependent).where(Dependent.household_id == household_id)
            result = await session.execute(stmt)
            dependents = result.scalars().all()
            child_names = [d.name for d in dependents]

            log.info(
                "household_loaded",
                call_id=call_id,
                household_name=household_name,
                child_count=len(child_names),
            )
        break

    # Build system prompt
    system_prompt = _build_system_prompt(
        household_name=household_name,
        household_id=household_id,
        child_names=child_names,
        language=language,
    )

    # Build first message
    first_messages = {
        "en": f"Hello {household_name} family! I'm your WellSync health assistant. How can I help you today?",
        "hi": f"नमस्ते {household_name} परिवार! मैं आपका वेलसिंक स्वास्थ्य सहायक हूँ। आज मैं आपकी क्या मदद कर सकता हूँ?",
        "mr": f"नमस्कार {household_name} कुटुंब! मी तुमचा वेलसिंक आरोग्य सहाय्यक आहे. आज मी तुम्हाला कशी मदत करू शकतो?",
    }
    first_message = first_messages.get(language, first_messages["en"])

    # Return assistant configuration
    assistant_config = {
        "assistant": {
            "firstMessage": first_message,
            "model": {
                "provider": "openai",
                "model": "gpt-4o",
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt,
                    }
                ],
                "tools": _get_tools(),
            },
            "transcriber": {
                "provider": "deepgram",
                "model": "nova-2",
                "language": "en-US",
            },
        }
    }

    log.info("assistant_config_sent", call_id=call_id)
    return assistant_config


async def _handle_tool_calls(payload: dict[str, Any], call_id: str) -> dict[str, Any]:
    """
    Vapi is calling tools. Execute them and return results.
    """
    message = payload.get("message", {})
    tool_calls = message.get("toolCalls", [])

    log.info("tool_calls_received", call_id=call_id, count=len(tool_calls))

    results = []

    for tool_call in tool_calls:
        tool_id = tool_call.get("id", "")
        function = tool_call.get("function", {})
        tool_name = function.get("name", "")
        tool_args = function.get("arguments", {})

        log.info(
            "tool_call_processing",
            call_id=call_id,
            tool_id=tool_id,
            tool_name=tool_name,
            args=tool_args,
        )

        # Execute tool
        result = await _execute_tool(tool_name, tool_args, call_id)

        results.append(
            {
                "toolCallId": tool_id,
                "result": result,
            }
        )

        log.info(
            "tool_call_completed",
            call_id=call_id,
            tool_id=tool_id,
            tool_name=tool_name,
            result_preview=result[:100] if result else "EMPTY",
        )

    return {"results": results}


async def _execute_tool(tool_name: str, args: dict[str, Any], call_id: str) -> str:
    """
    Execute a single tool and return result as string.
    """
    try:
        if tool_name == "get_household_dependents":
            return await _tool_get_household_dependents(args, call_id)

        if tool_name == "answer_health_question":
            return await _tool_answer_health_question(args, call_id)

        if tool_name == "get_next_vaccine":
            return await _tool_get_next_vaccine(args, call_id)

        if tool_name == "mark_health_event_completed":
            return await _tool_mark_event_completed(args, call_id)

        log.warning("unknown_tool", tool_name=tool_name, call_id=call_id)
        return json.dumps({"error": f"Unknown tool: {tool_name}"})

    except Exception as e:
        log.error("tool_execution_failed", tool_name=tool_name, error=str(e), call_id=call_id)
        return json.dumps({"error": f"Tool execution failed: {str(e)}"})


async def _tool_get_household_dependents(args: dict[str, Any], call_id: str) -> str:
    """
    Get list of dependents in household.
    """
    household_id = args.get("household_id", "")

    if not household_id:
        return json.dumps({"error": "household_id is required"})

    async for session in get_session():
        stmt = select(Dependent).where(Dependent.household_id == household_id)
        result = await session.execute(stmt)
        dependents = result.scalars().all()

        children = []
        today = date.today()

        for d in dependents:
            age_days = (today - d.date_of_birth).days
            age_months = age_days // 30 if age_days >= 30 else 0

            children.append(
                {
                    "name": d.name,
                    "age_months": age_months,
                    "dependent_id": d.id,
                }
            )

        log.info(
            "dependents_fetched",
            call_id=call_id,
            household_id=household_id,
            count=len(children),
        )

        return json.dumps({"dependents": children})

    return json.dumps({"dependents": []})


async def _tool_answer_health_question(args: dict[str, Any], call_id: str) -> str:
    """
    Answer a health question using AI service.
    """
    question = args.get("question", "")
    household_id = args.get("household_id", "")
    dependent_id = args.get("dependent_id", "")
    language = args.get("language", "en")

    if not question or not household_id:
        return json.dumps({"error": "question and household_id are required"})

    # Build context from database
    context = await _build_health_context(household_id, dependent_id)

    # Use AI service to answer
    answer = await answer_voice_question(question, context, language)

    log.info(
        "health_question_answered",
        call_id=call_id,
        household_id=household_id,
        dependent_id=dependent_id,
    )

    return answer


async def _tool_get_next_vaccine(args: dict[str, Any], call_id: str) -> str:
    """
    Get next vaccine due for a child.
    """
    dependent_id = args.get("dependent_id", "")

    if not dependent_id:
        return json.dumps({"error": "dependent_id is required"})

    async for session in get_session():
        stmt = (
            select(HealthEvent)
            .where(HealthEvent.dependent_id == dependent_id)
            .where(HealthEvent.status != EventStatus.completed)
            .order_by(HealthEvent.due_date)
            .limit(1)
        )
        result = await session.execute(stmt)
        event = result.scalar_one_or_none()

        if not event:
            return json.dumps({"message": "All vaccinations are completed!"})

        due_str = event.due_date.strftime("%d %b %Y") if event.due_date else "Unknown"

        response = f"Next: {event.name} is {event.status.value} (due: {due_str})"

        if event.status == EventStatus.overdue:
            response += ". Please get this done as soon as possible."
        elif event.status == EventStatus.due:
            response += ". Please get this done this week."

        log.info(
            "next_vaccine_fetched",
            call_id=call_id,
            dependent_id=dependent_id,
            vaccine=event.name,
        )

        return response

    return json.dumps({"error": "Failed to fetch next vaccine"})


async def _tool_mark_event_completed(args: dict[str, Any], call_id: str) -> str:
    """
    Mark a health event as completed.
    """
    dependent_id = args.get("dependent_id", "")
    event_name = args.get("event_name", "")

    if not dependent_id or not event_name:
        return json.dumps({"error": "dependent_id and event_name are required"})

    async for session in get_session():
        stmt = (
            select(HealthEvent)
            .where(HealthEvent.dependent_id == dependent_id)
            .where(HealthEvent.status != EventStatus.completed)
        )
        result = await session.execute(stmt)
        pending_events = result.scalars().all()

        # Try exact match first
        target = None
        event_name_lower = event_name.lower()

        for e in pending_events:
            if e.name.lower() == event_name_lower:
                target = e
                break

        # Try fuzzy match
        if not target:
            for e in pending_events:
                if event_name_lower in e.name.lower() or e.name.lower() in event_name_lower:
                    target = e
                    break

        if not target:
            return json.dumps(
                {"error": f"Could not find pending event named '{event_name}'"}
            )

        target.status = EventStatus.completed
        target.completed_at = date.today()
        session.add(target)
        await session.commit()

        log.info(
            "event_marked_completed",
            call_id=call_id,
            dependent_id=dependent_id,
            event=target.name,
        )

        return json.dumps(
            {"success": True, "message": f"Marked {target.name} as completed!"}
        )

    return json.dumps({"error": "Failed to mark event as completed"})


async def _build_health_context(household_id: str, dependent_id: str = "") -> str:
    """
    Build health context from database for AI service.
    """
    context_parts = []

    async for session in get_session():
        # Get household
        household = await session.get(Household, household_id)
        if household:
            context_parts.append(f"Family: {household.name}")
            if household.village_town:
                context_parts.append(f"Location: {household.village_town}")

        # Get dependents
        if dependent_id:
            dependents = [await session.get(Dependent, dependent_id)]
        else:
            stmt = select(Dependent).where(Dependent.household_id == household_id)
            result = await session.execute(stmt)
            dependents = result.scalars().all()

        # Add dependent info
        for dep in dependents:
            if not dep:
                continue

            context_parts.append(f"\nChild: {dep.name}")

            # Calculate age
            age_days = (date.today() - dep.date_of_birth).days
            if age_days < 30:
                age_str = f"{age_days} days"
            elif age_days < 365:
                age_str = f"{age_days // 30} months"
            else:
                years = age_days // 365
                months = (age_days % 365) // 30
                age_str = f"{years} years {months} months" if months > 0 else f"{years} years"

            context_parts.append(f"Age: {age_str}")

            # Get upcoming events
            stmt = (
                select(HealthEvent)
                .where(HealthEvent.dependent_id == dep.id)
                .where(HealthEvent.status != EventStatus.completed)
                .order_by(HealthEvent.due_date)
                .limit(5)
            )
            result = await session.execute(stmt)
            events = result.scalars().all()

            if events:
                context_parts.append(f"Upcoming for {dep.name}:")
                for e in events:
                    due_str = e.due_date.strftime("%d %b") if e.due_date else "Unknown"
                    context_parts.append(f"  - {e.name} ({e.status.value}, due: {due_str})")

        break

    return "\n".join(context_parts)


def _build_system_prompt(
    household_name: str,
    household_id: str,
    child_names: list[str],
    language: str,
) -> str:
    """
    Build system prompt for Vapi assistant.
    """
    child_list = ", ".join(child_names) if child_names else "No children registered"

    return f"""You are the WellSync health assistant for the {household_name} family.

## Your Role
You help families track vaccinations, health events, and provide health guidance.
You have access to real health data for this household.

## Household Information
- Family: {household_name}
- Household ID: {household_id}
- Children: {child_list}

## Critical Rules
1. ALWAYS respond in {language.upper()} only.
2. NEVER fabricate or guess household_id or dependent_id.
3. NEVER read out or repeat any internal IDs (UUIDs, dependent_id values).
4. If a tool response contains IDs, ignore them in spoken output.
5. Use only child names when speaking to the user.

## Tool Usage
You have access to these tools:
- get_household_dependents: Get list of children in the household
- answer_health_question: Answer questions about health status
- get_next_vaccine: Get the next vaccine due for a child
- mark_health_event_completed: Record that a vaccine/health event was completed

## How to Use Tools
1. On the FIRST user message, call get_household_dependents to get the list of children.
2. For any health question, call answer_health_question with the household_id and dependent_id.
3. Always use the real dependent_id from the database, never guess.
4. If the user asks about a specific child by name, use the ID from get_household_dependents.

## Medical Safety
- NO diagnosis. For emergencies (trouble breathing, chest pain, seizures), tell the user to seek emergency care immediately.
- Never fabricate data. Rely strictly on the tools.
- Always encourage consulting a doctor when in doubt.

## Style
- Use short, clear sentences.
- Be calm, empathetic, and encouraging.
- Before calling a tool, say what you are doing (e.g., "I'm checking your household records now.").
- Confirm actions when recording health events.
"""


def _get_tools() -> list[dict[str, Any]]:
    """
    Return list of tools available to Vapi assistant.
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "get_household_dependents",
                "description": "Get list of all children/dependents in the household.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "household_id": {
                            "type": "string",
                            "description": "The household ID.",
                        }
                    },
                    "required": ["household_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "answer_health_question",
                "description": "Answer a health question about the family or a specific child.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "question": {
                            "type": "string",
                            "description": "The health question.",
                        },
                        "household_id": {
                            "type": "string",
                            "description": "The household ID.",
                        },
                        "dependent_id": {
                            "type": "string",
                            "description": "Optional: The child's ID.",
                        },
                        "language": {
                            "type": "string",
                            "description": "Language code (e.g., 'en', 'hi').",
                        },
                    },
                    "required": ["question", "household_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "get_next_vaccine",
                "description": "Get the next vaccine due for a child.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "dependent_id": {
                            "type": "string",
                            "description": "The child's ID.",
                        }
                    },
                    "required": ["dependent_id"],
                },
            },
        },
        {
            "type": "function",
            "function": {
                "name": "mark_health_event_completed",
                "description": "Record that a health event (vaccine, checkup) was completed.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "dependent_id": {
                            "type": "string",
                            "description": "The child's ID.",
                        },
                        "event_name": {
                            "type": "string",
                            "description": "The name of the event (e.g., 'BCG', 'Polio 1').",
                        },
                    },
                    "required": ["dependent_id", "event_name"],
                },
            },
        },
    ]
