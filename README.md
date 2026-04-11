# WellSync AI

**WellSync AI** is a voice-first health memory system built to help families remember, understand, and act on essential preventive healthcare tasks such as vaccinations, routine checkups, and medicine-safety checks.

The project is designed for low-access and low-literacy contexts, where healthcare actions are often missed not because of negligence, but because of fragmented records, weak reminder systems, limited digital literacy, and lack of simple guidance.

---

## Vision

WellSync AI acts like a family health memory assistant.

Instead of expecting users to manually track medical schedules, it helps them by:

- Generating a health timeline from basic profile data (based on India's National Immunization Schedule)
- Highlighting upcoming and overdue health actions
- Explaining what each health action means in simple language
- Supporting live voice interaction via Vapi AI
- Providing medicine safety double-checking through image upload and structured caution logic
- Working toward offline-first usability for real-world low-connectivity scenarios

---

## Problem We Are Solving

In many communities, families miss important healthcare actions such as:

- Child vaccination doses
- Pregnancy-related checkups
- Preventive follow-ups
- Safe medicine usage during pregnancy or illness

This happens because:

- Health records are fragmented
- Caregivers may not remember schedules
- Existing solutions often assume high literacy
- Many interfaces are too text-heavy
- People sometimes self-medicate without understanding risks

WellSync AI is being built to solve this with a structured, voice-first, easy-to-understand experience.

---

## Core Features

### 1. Health Timeline Generation
- Create household and dependent profiles
- Generate vaccination and preventive health timelines based on the India NIS (National Immunization Schedule)
- Mark events as `upcoming`, `due`, `overdue`, or `completed`
- Deterministic engine with versioned schedule output

### 2. Voice-First Assistance
- Live voice interaction for asking health-related timeline questions
- Simple spoken guidance for users with limited literacy
- Voice agent support via Vapi AI webhooks

### 3. Health Action Explanations
- Explain what a vaccine, checkup, or reminder is for
- Keep explanations short, simple, and understandable
- Groq LLM used only for simplification and communication, not for medical decision-making
- Automatic fallback to static templates if AI call fails

### 4. Medicine Safety Checker
- Upload a photo of a medicine strip, medicine box, or printed prescription
- Extract medicine details using Gemma 4 (via Ollama) with Llama 3.2 Vision fallback and Google Cloud Vision as last resort
- Check for common side effects, important cautions, and pregnancy-related warnings
- Return a safe, simplified caution-oriented response bucketted into: `common_use`, `use_with_caution`, `insufficient_information`, `consult_doctor_urgently`

### 5. Offline-First Readiness
- Cache key application screens
- Store important user and timeline data locally
- Support gradual sync when connectivity returns

---

## Tech Stack

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TanStack Query
- React Hook Form
- Zod
- PWA support
- IndexedDB + Dexie

### Backend (Implemented)
- **FastAPI** with async/await throughout
- **Python 3.11+**
- **SQLModel** (SQLAlchemy + Pydantic) for typed ORM models
- **asyncpg** for async Postgres driver
- **Alembic** for database migrations
- **GitHub Models** (`openai/gpt-4o` via `https://models.github.ai/inference`)
- **OpenAI gpt-4o multimodal** for medicine OCR
- **Pydantic Settings** for typed config management
- **structlog** for structured logging
- **httpx** for async HTTP calls
- Custom deterministic health schedule engine (India NIS rules)
- Rule-based medicine safety classification

### Database
- **Neon serverless Postgres** — async `asyncpg` driver
- **SQLModel** as ORM (replaces Prisma for backend-only schema ownership)
- Schema: `households`, `dependents`, `health_events`, `reminders`

### AI / Voice
- **GitHub Models** (`openai/gpt-4o`) — health event explanations, voice Q&A, medicine result simplification
- **OpenAI gpt-4o multimodal** — medicine OCR via image upload
- **Vapi AI** — live voice agent orchestration (webhook integration)
- Deterministic rule-based health and medicine safety logic (AI never decides safety)

### Tooling
- `uv` / `pip` for Python dependency management
- `pyproject.toml` with `hatchling` build backend
- `ruff` for linting and formatting
- `mypy` for optional static typing
- `pytest` + `pytest-asyncio` for backend testing

### Deployment
- Vercel for frontend
- Railway / Render for backend
- Neon for database hosting

---

## Actual Repository Structure

```text
WellSyncAI/
├─ Backend/
│  ├─ app/
│  │  ├─ api/
│  │  │  └─ v1/
│  │  │     ├─ households.py     # Household CRUD endpoints
│  │  │     └─ dependents.py     # Dependent CRUD + timeline endpoints
│  │  ├─ core/
│  │  │  ├─ config.py            # Pydantic Settings (env vars)
│  │  │  └─ database.py          # Async SQLAlchemy engine + session
│  │  ├─ models/
│  │  │  ├─ household.py         # Household SQLModel table
│  │  │  ├─ dependent.py         # Dependent SQLModel table (child/adult/elder/pregnant)
│  │  │  ├─ health_event.py      # HealthEvent SQLModel table (timeline events)
│  │  │  └─ reminder.py          # Reminder SQLModel table
│  │  ├─ schemas/                # Pydantic request/response schemas
│  │  └─ services/
│  │     ├─ health_schedule/
│  │     │  ├─ rules.py          # India NIS schedule loader + deterministic event generator
│  │     │  └─ engine.py         # Schedule orchestration + status computation
│  │     ├─ ai_service.py        # Groq wrapper (explain events, voice Q&A, medicine simplification)
│  │     ├─ ocr_service.py       # Multi-tier OCR (Gemma4 → Llama3.2-vision → Google Vision)
│  │     └─ medicine_safety.py   # Medicine safety classification engine
│  ├─ data/
│  │  └─ india_nis_schedule.json # India National Immunization Schedule data
│  ├─ .env.example               # Environment variable template
│  └─ pyproject.toml             # Python project + dependency config
├─ Frontend/                     # Next.js frontend (in progress)
├─ PRD.md                        # Project requirements document
└─ README.md
```

---

## Development Principles

- **Voice first, not voice only**
- **Deterministic health logic first** — the LLM never decides schedules or medicine safety
- **AI for explanation, not diagnosis**
- **Keep the interface simple**
- **Prefer safe, conservative medical messaging**
- **Document every major architectural decision**
- **Avoid context loss across AI sessions**
- **Use the PRD as the source of truth**

---

## Rules for AI Agents

All AI agents working in this repository must follow these rules:

1. Read the PRD (`PRD.md`) before making changes
2. Do not start coding without understanding the current architecture
3. Do not change the tech stack unless explicitly approved in the PRD
4. Do not work in conflicting parallel sessions on the same area
5. Update documentation when major changes are made
6. Prefer small, scoped changes over broad rewrites
7. Reuse existing context instead of re-deriving it every session

The goal is to reduce conflicts, save tokens, and keep the project coherent.

---

## Safety Principles

WellSync AI is **not** a diagnostic medical system.

The application must never:
- Diagnose disease
- Guarantee medicine safety
- Replace a doctor, pharmacist, or healthcare worker
- Invent vaccine schedules or medical guidance

The application may:
- Help users remember preventive care
- Explain health actions in simple language
- Surface medicine cautions and risk signals
- Encourage users to consult professionals when necessary

---

## Current Status

### Backend — Implemented
- ✅ FastAPI project structure with `pyproject.toml` and `hatchling`
- ✅ Async Neon Postgres connection via `asyncpg` + SQLModel (SSL fixed)
- ✅ `Household`, `Dependent`, `HealthEvent`, `Reminder` models
- ✅ `DependentType` enum: `child`, `adult`, `elder`, `pregnant`
- ✅ India NIS schedule engine (`rules.py` + `engine.py`)
  - Loads schedule from `data/india_nis_schedule.json`
  - Computes event due dates deterministically from DOB
  - Persists events idempotently, skipping duplicates by `schedule_key`
  - Recomputes `upcoming/due/overdue` status dynamically on fetch
- ✅ GitHub Models AI service (`openai/gpt-4o` via https://models.github.ai/inference)
- ✅ OCR service with OpenAI gpt-4o multimodal (no local Ollama required)
- ✅ Medicine safety classification engine
- ✅ API routes: `/v1/households`, `/v1/dependents`
- ✅ Pydantic Settings config with `.env.example`
- ✅ structlog structured logging throughout
- ✅ 29/29 pytest assertions passing

### Frontend — In Progress
- Next.js 16 base setup

### Pending
- Vapi webhook endpoint (`/v1/voice/vapi-webhook`)
- Alembic migration setup
- Frontend integration
- Offline-first PWA features

---

## Getting Started

### Prerequisites
- Python 3.11+
- Neon Postgres database
- GitHub Personal Access Token (with `models` scope for GitHub Models access)
- Vapi account (for voice features)
- Node.js + pnpm (for frontend)

### Backend Setup
```bash
cd Backend

# Install uv (recommended) or use pip
pip install uv

# Install dependencies
uv sync          # or: pip install -e .
uv sync --extra dev  # includes pytest, ruff, mypy

# Configure environment
cp .env.example .env
# Edit .env with your Neon DATABASE_URL and GITHUB_TOKEN

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Environment Variables
| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | Neon Postgres `postgresql+asyncpg://...` URL |
| `GITHUB_TOKEN` | ✅ | GitHub PAT with `models` scope |
| `GITHUB_CHAT_MODEL` | ❌ | Default: `openai/gpt-4o` |
| `GITHUB_VISION_MODEL` | ❌ | Default: `openai/gpt-4o` |
| `VAPI_WEBHOOK_SECRET` | ❌ | For validating Vapi voice webhooks |
| `FRONTEND_URL` | ❌ | CORS origin, default: `http://localhost:3000` |

---

## License

Add your preferred license here.

---

## Author

Built by Varad Joshi