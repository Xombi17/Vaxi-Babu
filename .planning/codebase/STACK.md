# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- Python 3.11+ - backend API, services, and models in `Backend/app/` (`Backend/pyproject.toml`)
- TypeScript 5.9 - frontend app/router/components in `Frontend/app/`, `Frontend/components/`, `Frontend/lib/` (`Frontend/package.json`)

**Secondary:**
- SQL through ORM schemas - SQLModel in `Backend/app/models/` and Prisma schema mirror in `Frontend/prisma/schema.prisma`
- JavaScript for tooling/config - `Frontend/eslint.config.mjs`, `Frontend/postcss.config.mjs`

## Runtime

**Backend Runtime:**
- ASGI app on Uvicorn (`Backend/pyproject.toml`, `Backend/run_dev.sh`)
- FastAPI entrypoint in `Backend/app/main.py`

**Frontend Runtime:**
- Next.js App Router + React (`Frontend/package.json`, `Frontend/app/`)
- Next build target is standalone Node output (`Frontend/next.config.ts`)

**Package Managers:**
- Backend: `uv` workflow with lockfile (`Backend/uv.lock`, `Backend/run_dev.sh`)
- Frontend: npm lockfile present (`Frontend/package-lock.json`)
- Additional lockfile present: `Frontend/bun.lock` (secondary package manager metadata)

## Frameworks

**Backend Core:**
- FastAPI `>=0.115.0` - HTTP API framework (`Backend/pyproject.toml`)
- SQLModel `>=0.0.22` - ORM layer (`Backend/pyproject.toml`, `Backend/app/models/`)
- Pydantic v2 + pydantic-settings - schema validation and env settings (`Backend/app/core/config.py`)

**Frontend Core:**
- Next.js `^15.4.9` (`Frontend/package.json`)
- React `^19.2.1` / React DOM `^19.2.1` (`Frontend/package.json`)
- Tailwind CSS v4 toolchain (`Frontend/package.json`, `Frontend/postcss.config.mjs`)

**Supporting UI/Voice:**
- `@vapi-ai/web` for browser voice calls (`Frontend/components/VoiceFAB.tsx`)
- `motion` for UI animation (`Frontend/components/VoiceFAB.tsx`)
- `react-hook-form` and `zod` installed for form/validation patterns (`Frontend/package.json`)

## Key Dependencies

**Critical Backend:**
- `asyncpg` - async Postgres driver (`Backend/pyproject.toml`, `Backend/app/core/database.py`)
- `openai` - AI/OCR client SDK used with GitHub Models endpoint (`Backend/app/services/ai_service.py`)
- `httpx` - internal HTTP calls (offline sync replay) (`Backend/app/api/v1/sync.py`)
- `python-jose[cryptography]` + `passlib[bcrypt]` - JWT/password auth utilities (`Backend/app/core/auth.py`)

**Infrastructure/Tooling:**
- Alembic migrations (`Backend/alembic/`, `Backend/alembic.ini`)
- Ruff linting (`Backend/ruff.toml`, `Backend/pyproject.toml`)
- Pytest + pytest-asyncio tests (`Backend/tests/`, `Backend/pyproject.toml`)
- ESLint + Next lint config (`Frontend/eslint.config.mjs`, `Frontend/package.json`)

## Configuration

**Environment:**
- Backend settings loaded from `.env` and `Backend/.env` via Pydantic Settings (`Backend/app/core/config.py`)
- Frontend reads env vars directly through `process.env` in runtime code (`Frontend/lib/api.ts`, `Frontend/components/VoiceFAB.tsx`)

**Code-Referenced Environment Variables:**
- Backend: `DATABASE_URL`, `GITHUB_TOKEN`, `GITHUB_CHAT_MODEL`, `GITHUB_VISION_MODEL`, `VAPI_WEBHOOK_SECRET`, `FRONTEND_URL`, `APP_ENV`, `APP_PORT`, `LOG_LEVEL`
- Frontend: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_VAPI_PUBLIC_KEY`, `NEXT_PUBLIC_VAPI_ASSISTANT_ID`

**Build Config Files:**
- Backend: `Backend/pyproject.toml`, `Backend/alembic.ini`
- Frontend: `Frontend/next.config.ts`, `Frontend/tsconfig.json`, `Frontend/eslint.config.mjs`, `Frontend/postcss.config.mjs`

## Deployment Hints

**Detected in code/config:**
- Frontend can be deployed as standalone Next output (`Frontend/next.config.ts`)
- Backend docs routes are dev-only (`Backend/app/main.py`)
- Backend DB connections enforce SSL at engine level (`Backend/app/core/database.py`)

**Not detected in repo automation:**
- No CI pipelines in `.github/workflows/`
- No root Dockerfile/Kubernetes/IaC manifests

## Platform Requirements

**Development:**
- Python 3.11+ and Node.js
- Postgres connection via `DATABASE_URL`
- GitHub Models token for AI/OCR-backed endpoints

**Production:**
- ASGI hosting for FastAPI + persistent Postgres
- Node runtime for standalone Next app
- Runtime secrets for DB, AI models, and voice webhook validation

## Version/Consistency Notes

- Frontend currently uses `next@^15.4.9` with `eslint-config-next@16.0.8` in the same manifest (`Frontend/package.json`).
- Frontend has both npm and bun lockfiles (`Frontend/package-lock.json`, `Frontend/bun.lock`), so package-manager standardization is needed for deterministic installs.

---

*Stack analysis: 2026-04-12*