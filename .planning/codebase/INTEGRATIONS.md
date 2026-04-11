# Integrations

**Analysis Date:** 2026-04-12

## Integration Status Legend

- Active: wired in runtime code paths and reachable from routes/components.
- Partial: code exists but wiring is incomplete, inconsistent, or fallback-only.
- Present/Unused: dependency or schema exists but no active runtime usage found.

## Internal Integrations

**API Composition (Active):**
- `Backend/app/main.py` mounts the v1 router from `Backend/app/api/v1/router.py`.
- `Backend/app/api/v1/router.py` composes `auth`, `households`, `dependents`, `timeline`, `reminders`, `medicine`, `ai`, `voice`, `sync`.

**Schedule Engine (Active):**
- `Backend/app/api/v1/dependents.py` and `Backend/app/api/v1/timeline.py` call `generate_and_save_schedule` and refresh logic from `Backend/app/services/health_schedule/engine.py`.
- Rule data source is `Backend/data/india_nis_schedule.json` via `Backend/app/services/health_schedule/rules.py`.

**Medicine Pipeline (Active):**
- Endpoint `POST /api/v1/medicine/check-image` in `Backend/app/api/v1/medicine.py` chains:
  - OCR extraction (`Backend/app/services/ocr_service.py`)
  - deterministic classifier (`Backend/app/services/medicine_safety.py`)
  - LLM simplification (`Backend/app/services/ai_service.py`)

**Voice + Memory (Partial):**
- Backend webhook endpoint `POST /api/v1/voice/webhook` in `Backend/app/api/v1/voice.py` handles Vapi events and tool calls.
- Voice answers are generated through `answer_voice_question` in `Backend/app/services/ai_service.py`.
- Conversation memory model exists in `Backend/app/models/conversation.py` and is referenced in `Backend/app/api/v1/voice.py`.
- Tool-call execution block in `Backend/app/api/v1/voice.py` currently contains unreachable indented code after a `continue`, so part of the intended DB-backed tool-call flow is only partially wired.

**Offline Sync Replay (Active):**
- `Backend/app/api/v1/sync.py` replays queued client mutations by issuing internal HTTP requests back to `/api/v1/*` endpoints using `httpx`.

**Frontend → Backend API (Partial):**
- Shared API client in `Frontend/lib/api.ts` targets `NEXT_PUBLIC_API_URL` with default `http://localhost:8000`.
- Login page in `Frontend/src/app/login/page.tsx` uses hardcoded `http://localhost:8080/api/v1/login`, which is inconsistent with `Frontend/lib/api.ts` default and backend dev scripts.

## External Integrations

## Databases

**PostgreSQL / Neon-style connection (Active):**
- Client and ORM wiring in `Backend/app/core/database.py` with `sqlmodel` + `asyncpg`.
- Connection source: `DATABASE_URL` (`Backend/app/core/config.py`, `Backend/.env.example`).
- SSL enforcement configured in engine connect args (`Backend/app/core/database.py`).

**Prisma (Present/Unused for runtime):**
- Prisma schema exists at `Frontend/prisma/schema.prisma` and Prisma config at `Frontend/prisma.config.ts`.
- `@prisma/client` is installed in `Frontend/package.json`, but no active import/use in frontend runtime app code was detected.

## AI Providers

**GitHub Models via OpenAI-compatible SDK (Active):**
- Client setup in `Backend/app/services/ai_service.py` using `AsyncOpenAI` with `base_url=settings.github_models_base_url`.
- Chat model env-configured by `GITHUB_CHAT_MODEL` (`Backend/app/core/config.py`).
- Used by endpoints in `Backend/app/api/v1/ai.py`, `Backend/app/api/v1/voice.py`, `Backend/app/api/v1/medicine.py`.

**Vision/OCR via same provider (Active):**
- Image OCR in `Backend/app/services/ocr_service.py` uses chat-completions with image input and `settings.github_vision_model`.

## Voice

**Vapi Webhook (Active):**
- Incoming webhook endpoint: `POST /api/v1/voice/webhook` in `Backend/app/api/v1/voice.py`.
- Optional HMAC signature verification with `VAPI_WEBHOOK_SECRET` (`Backend/app/core/config.py`, `Backend/app/api/v1/voice.py`).
- In-memory rate limiting and idempotency caches implemented in `Backend/app/api/v1/voice.py`.

**Vapi Browser SDK (Active with simulation fallback):**
- `Frontend/components/VoiceFAB.tsx` dynamically imports `@vapi-ai/web` and starts calls with assistant/public key env vars.
- If keys/SDK are missing, component falls back to simulated local state transitions.

## OCR and File Handling

**Medicine image OCR (Active):**
- Upload handling in `Backend/app/api/v1/medicine.py` (JPEG/PNG/WebP/HEIC, max 10MB).
- Images are processed in-memory; no external blob storage integration detected.

## Authentication and Identity

**JWT + Password Auth (Active, local DB-backed):**
- Login endpoint: `POST /api/v1/login` in `Backend/app/api/v1/auth.py`.
- Password verify/hash + JWT issue in `Backend/app/core/auth.py` using `passlib` + `python-jose`.
- User lookup uses `Household` table (`Backend/app/models/household.py`).

**External IdP (Not detected):**
- No active Auth.js/NextAuth/Clerk integration in runtime code paths.

## Analytics and Observability

**Structured Logging (Active):**
- `structlog` used broadly across API/services (`Backend/app/main.py`, `Backend/app/services/*.py`, `Backend/app/api/v1/*.py`).

**Product Analytics (Present/Unused):**
- `POSTHOG_API_KEY` appears in `Backend/.env.example` but no PostHog client wiring was found in backend/frontend runtime code.

## CI/CD and Hosting Hints

**Repo Automation:**
- No CI workflow files detected under `.github/workflows/`.

**Deployment Hints in code/config:**
- Frontend standalone output in `Frontend/next.config.ts` suggests container/Node deployment mode.
- Backend startup scripts and docs imply standard ASGI hosting with Uvicorn (`Backend/run_dev.sh`, `Backend/app/main.py`).

## Environment Configuration

**Backend env vars used by active code:**
- `DATABASE_URL`
- `GITHUB_TOKEN`
- `GITHUB_CHAT_MODEL`
- `GITHUB_VISION_MODEL`
- `VAPI_WEBHOOK_SECRET`
- `FRONTEND_URL`
- `APP_ENV`, `APP_HOST`, `APP_PORT`, `LOG_LEVEL`
- `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`

**Frontend env vars used by active code:**
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

## External API Surface Summary

**Incoming webhooks:**
- Vapi webhook at `/api/v1/voice/webhook` (`Backend/app/api/v1/voice.py`)

**Outgoing external network calls:**
- GitHub Models endpoint via OpenAI-compatible client (`Backend/app/services/ai_service.py`, `Backend/app/services/ocr_service.py`)

**Outgoing internal network calls:**
- Offline sync replay to internal API endpoints via `httpx` (`Backend/app/api/v1/sync.py`)

---

*Integration audit: 2026-04-12*