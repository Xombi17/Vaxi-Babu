# AGENTS.md — Vaxi Babu

## Must Read First

Before any work, read `PRD.md` — it's the single source of truth. All agents must acknowledge it.

## Repository Structure

```
Vaxi BabuAI/
├── Backend/          # FastAPI + Python 3.11+ (OWNED: primary dev)
├── Frontend/        # Next.js 16 (in progress)
├── .agents/         # Agent-specific context and memory
├── .planning/       # Planning docs and research
├── PRD.md          # Product requirements
└── README.md      # Setup docs
```

## Developer Commands

### Backend (FastAPI)

```bash
cd Backend
uv sync              # install deps
uv sync --extra dev # install + dev deps (pytest, ruff)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
ruff check .        # lint
ruff check . --fix # lint + format
pytest tests/       # run tests (29/29 passing)
```

### Frontend (Next.js 16)

```bash
cd Frontend
npm install
npm run dev
npm run build        # production build
```

### Environment

```bash
cp .env.example .env
# Required: DATABASE_URL (Neon Postgres), GITHUB_TOKEN (GitHub Models PAT)
# Note: Use GITHUB_TOKEN instead of GROQ_API_KEY
```

## Key Constraints

- **Deterministic-first**: Never use LLM for health scheduling or medicine safety logic. LLM only for explanation/simplification.
- **No Prisma**: Backend uses SQLModel (not Prisma). Frontend uses Prisma (future).
- **Voice-first**: Prioritize voice UX over text.
- **Safe medical messaging**: Always default to "consult a doctor" when uncertain.

## Entry Points

- Backend entry: `Backend/app/main.py`
- API routes: `Backend/app/api/v1/`
- Health schedule engine: `Backend/app/services/health_schedule/`
- AI service: `Backend/app/services/ai_service.py`
- OCR service: `Backend/app/services/ocr_service.py`
- Voice webhook: `Backend/app/api/v1/voice.py`

## Voice Routing

| Language               | Provider    | Model                    |
| ---------------------- | ----------- | ------------------------ |
| All (en, hi, mr, etc.) | Gemini Live | gemini-3.1-flash-preview |

- **Frontend/lib/gemini-voice.ts**: Gemini Live API integration (callback-based pattern)
- **Frontend/components/VoiceFAB.tsx**: Voice FAB using Gemini Live for all languages
- **Backend/app/api/v1/voice.py**: Gemini Live tool handlers for family data

## Lint & Test Order

`ruff check .` → `pytest tests/`

## Current Implementation State (Session 2026-04-12)

### Completed

- ✅ FastAPI backend with async/await throughout
- ✅ Neon Postgres connection via `asyncpg` (asyncpg-native SSL)
- ✅ SQLModel: Household, Dependent, HealthEvent, Reminder, Conversation
- ✅ India NIS schedule engine (deterministic, versioned)
- ✅ AI service using GitHub Models (openai/gpt-4o via https://models.github.ai/inference)
- ✅ OCR service using OpenAI gpt-4o multimodal (no local Ollama required)
- ✅ Medicine safety classification engine
- ✅ API routes: /v1/households, /v1/dependents, /v1/voice (tools)
- ✅ 29/29 pytest assertions passing
- ✅ Gemini Live API voice for all languages (English, Hindi, Marathi, etc.)
- ✅ Voice FAB using Gemini Live
- ✅ Settings page simplified - no premium mode modal

### Stack Changes (Approved)

- **Replaced Groq with GitHub Models** (openai/gpt-4o)
- **Replaced Ollama + Google Cloud Vision with OpenAI gpt-4o multimodal**
- **Fixed Neon SSL** — removed `sslmode=require&channel_binding=require` from DATABASE_URL
- **Replaced Vapi and ElevenLabs with Gemini Live** for all languages
- **Removed all Vapi/11Labs/ElevenLabs references** from frontend and backend

### Pending

- Alembic migrations
- Frontend integration (complete)
- Offline PWA (Phase 4)
