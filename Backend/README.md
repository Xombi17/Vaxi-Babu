# WellSync AI — Backend

FastAPI backend for WellSync AI. Provides REST APIs for health timelines, medicine safety, voice webhooks, and offline sync.

## Quick Start (UV)

```bash
# Install UV (one-time)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
cd Backend
uv pip install -e ".[dev]"

# Copy and fill in env vars
cp .env.example .env

# Pull Ollama models (for medicine OCR)
ollama pull gemma4
ollama pull llama3.2-vision

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Running at: http://localhost:8000/docs (Swagger UI, dev only)

## Run Tests

```bash
pytest tests/ -v
```

## Project Structure

```
Backend/
├── app/
│   ├── main.py                      # FastAPI app entry point
│   ├── core/
│   │   ├── config.py                # Settings (pydantic-settings)
│   │   └── database.py              # Async DB engine (SQLModel + asyncpg)
│   ├── models/                      # SQLModel table definitions (DB schema)
│   ├── schemas/                     # Pydantic request/response schemas
│   ├── services/
│   │   ├── health_schedule/
│   │   │   ├── rules.py             # Pure-Python NIS schedule loader
│   │   │   └── engine.py            # DB-aware schedule generator
│   │   ├── ai_service.py            # Groq LLM wrapper
│   │   ├── ocr_service.py           # Gemma4/Llama3.2V/GCV OCR
│   │   └── medicine_safety.py       # Deterministic safety classifier
│   └── api/v1/                      # All API route handlers
│       ├── router.py                # Aggregates all routers
│       ├── households.py
│       ├── dependents.py
│       ├── timeline.py
│       ├── reminders.py
│       ├── medicine.py
│       ├── ai.py
│       ├── voice.py                 # Vapi webhook
│       └── sync.py                  # Offline batch sync
├── data/
│   └── india_nis_schedule.json      # India NIS vaccination data
├── tests/
│   ├── test_health_schedule.py
│   └── test_medicine_safety.py
├── .env.example
└── pyproject.toml
```

## Environment Variables

See `.env.example` for full list. Minimum required:
- `DATABASE_URL` — Neon Postgres async connection string
- `GROQ_API_KEY` — Groq API key for LLM explanations
- Ollama running locally with `gemma4` and `llama3.2-vision` models

## Key Design Decisions

- **No auth in MVP** — Add Clerk JWT validation or custom JWT when frontend is connected
- **Deterministic schedule first** — NIS rules are in `data/india_nis_schedule.json`, never in the LLM
- **AI for explanation only** — Groq is called exclusively for user-facing text simplification
- **OCR cascades** — Gemma4 → Llama3.2-Vision → Google Cloud Vision
- **Idempotent schedule generation** — safe to call `generate_and_save_schedule` multiple times
