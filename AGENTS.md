# AGENTS.md — WellSync AI

## Must Read First

Before any work, read `PRD.md` — it's the single source of truth. All agents must acknowledge it.

## Repository Structure

```
WellSyncAI/
├── Backend/          # FastAPI + Python 3.11+ (OWNED: primary dev)
├── Frontend/        # Next.js 16 (in progress)
├── PRD.md          # Product requirements
└── README.md      # Setup docs
```

## Developer Commands

### Backend (FastAPI)
```bash
cd Backend
uv sync              # install deps
uv sync --extra dev # install + dev deps (pytest, ruff)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
ruff check .        # lint
ruff check . --fix # lint + format
pytest tests/      # run tests
```

### Environment
```bash
cp .env.example .env
# Required: DATABASE_URL (Neon Postgres), GROQ_API_KEY
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

## Lint & Test Order

`ruff check .` → `pytest tests/`