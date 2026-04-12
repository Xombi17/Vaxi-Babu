# AGENTS.md — WellSync AI

## Must Read First

Before any work, read `PRD.md` — it's the single source of truth. All agents must acknowledge it.

## Repository Structure

```
WellSyncAI/
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

| Language | Provider | Model |
|----------|----------|-------|
| English (en) | Vapi | GPT-4o |
| Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu | Gemini Live | gemini-2.0-flash-exp |

- **Frontend/lib/gemini-voice.ts**: Gemini Live API integration (callback-based pattern)
- **Frontend/components/VoiceFAB.tsx**: Voice FAB with auto-routing
- **Backend/app/api/v1/voice.py**: Vapi webhook for English, Gemini for regional

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
- ✅ API routes: /v1/households, /v1/dependents, /v1/voice (webhook)
- ✅ 29/29 pytest assertions passing
- ✅ Gemini Live API voice for regional languages (Hindi, Marathi, etc.)
- ✅ Voice FAB auto-routes to Gemini for regional languages
- ✅ Settings page simplified - no premium mode modal

### Stack Changes (Approved)
- **Replaced Groq with GitHub Models** (openai/gpt-4o)
- **Replaced Ollama + Google Cloud Vision with OpenAI gpt-4o multimodal**
- **Fixed Neon SSL** — removed `sslmode=require&channel_binding=require` from DATABASE_URL
- **Replaced ElevenLabs with Gemini Live** for regional languages
- **Removed all 11Labs/ElevenLabs references** from frontend and backend

### Pending
- Alembic migrations
- Frontend integration (complete)
- Vapi webhook (complete)