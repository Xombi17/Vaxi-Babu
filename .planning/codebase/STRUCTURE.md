# Codebase Structure

**Analysis Date:** 2026-04-11

## Directory Layout

```
WellSyncAI/
├── Backend/                   # FastAPI Python backend
│   ├── app/                  # Application code
│   │   ├── api/              # API route handlers
│   │   │   └── v1/           # Version 1 API routes
│   │   ├── core/             # Configuration and database
│   │   ├── models/           # SQLModel database models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic services
│   │   │   └── health_schedule/  # Schedule engine
│   │   └── main.py           # FastAPI application entry point
│   ├── tests/                # pytest test suite
│   ├── data/                 # Static data (schedule rules JSON)
│   ├── pyproject.toml        # Python project config
│   ├── .env.example          # Environment template
│   └── README.md             # Backend-specific documentation
├── Frontend/                 # Next.js 16 frontend (in progress)
│   └── context.empty         # Placeholder - frontend not initialized
├── PRD.md                    # Product Requirements Document
├── README.md                 # Project overview and setup
├── AGENTS.md                 # Developer commands and constraints
└── .planning/codebase/       # Codebase analysis docs
```

## Directory Purposes

**Backend/app/:**
- Purpose: Main application package
# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```text
WellSyncAI/
├── Backend/                 # FastAPI + SQLModel backend (primary implemented domain)
├── Frontend/                # Next.js App Router frontend (partially integrated)
├── docs/                    # Product/design reference docs
├── graphify-out/            # Generated graph artifacts and cache outputs
├── .planning/               # Planning and codebase analysis documents
├── AGENTS.md                # Agent operating guidance and ownership hints
├── PRD.md                   # Product source-of-truth requirements
└── README.md                # Project overview and setup
```

## Directory Purposes

**Backend:**
- Purpose: API, business logic, persistence, deterministic health rules, and integration orchestration.
- Contains: `app/`, `data/`, `tests/`, Alembic scaffold, Python project config.
- Key files: `Backend/app/main.py`, `Backend/pyproject.toml`, `Backend/tests/test_health_schedule.py`.

**Backend/app/api/v1:**
- Purpose: Versioned HTTP endpoint modules.
- Contains: one router file per feature area.
- Key files: `Backend/app/api/v1/router.py`, `Backend/app/api/v1/timeline.py`, `Backend/app/api/v1/medicine.py`, `Backend/app/api/v1/voice.py`.

**Backend/app/core:**
- Purpose: shared runtime infrastructure for routes/services.
- Contains: settings, DB session engine, auth helpers.
- Key files: `Backend/app/core/config.py`, `Backend/app/core/database.py`, `Backend/app/core/auth.py`.

**Backend/app/models:**
- Purpose: SQLModel entity and enum declarations.
- Contains: household, dependent, event, reminder, conversation models.
- Key files: `Backend/app/models/household.py`, `Backend/app/models/dependent.py`, `Backend/app/models/health_event.py`, `Backend/app/models/reminder.py`, `Backend/app/models/conversation.py`.

**Backend/app/schemas:**
- Purpose: API request/response DTOs.
- Contains: typed schemas for household/dependent/timeline/medicine/sync.
- Key files: `Backend/app/schemas/household.py`, `Backend/app/schemas/dependent.py`, `Backend/app/schemas/timeline.py`, `Backend/app/schemas/medicine.py`, `Backend/app/schemas/sync.py`.

**Backend/app/services:**
- Purpose: business and integration services behind route handlers.
- Contains: deterministic schedule engine, AI service, OCR service, medicine safety rules.
- Key files: `Backend/app/services/health_schedule/rules.py`, `Backend/app/services/health_schedule/engine.py`, `Backend/app/services/ai_service.py`, `Backend/app/services/ocr_service.py`, `Backend/app/services/medicine_safety.py`.

**Backend/data:**
- Purpose: deterministic schedule source data.
- Contains: `india_nis_schedule.json`.
- Key files: `Backend/data/india_nis_schedule.json`.

**Backend/tests:**
- Purpose: backend verification for deterministic logic and voice behavior.
- Contains: schedule, medicine safety, and voice tests.
- Key files: `Backend/tests/test_health_schedule.py`, `Backend/tests/test_medicine_safety.py`, `Backend/tests/test_voice.py`.

**Frontend/app:**
- Purpose: App Router route tree.
- Contains: root landing routes and grouped app routes under `(app)`.
- Key files: `Frontend/app/layout.tsx`, `Frontend/app/page.tsx`, `Frontend/app/(app)/layout.tsx`, `Frontend/app/(app)/dashboard/page.tsx`, `Frontend/app/(app)/timeline/[dependent_id]/page.tsx`.

**Frontend/components:**
- Purpose: reusable UI composition and interaction modules.
- Contains: shell, summary cards, timeline/scanner/voice components, theming helpers.
- Key files: `Frontend/components/AppLayout.tsx`, `Frontend/components/ScannerView.tsx`, `Frontend/components/VoiceFAB.tsx`, `Frontend/components/FamilyOverview.tsx`, `Frontend/components/TimelineFeed.tsx`.

**Frontend/lib:**
- Purpose: shared utilities and backend API client wrapper.
- Contains: typed fetch client and utility helpers.
- Key files: `Frontend/lib/api.ts`, `Frontend/lib/utils.ts`.

**Frontend/hooks:**
- Purpose: reusable UI hooks.
- Contains: viewport/mobile helper.
- Key files: `Frontend/hooks/use-mobile.ts`.

**Frontend/prisma:**
- Purpose: frontend-side Prisma schema scaffold (not backend DB authority).
- Contains: Prisma data model file.
- Key files: `Frontend/prisma/schema.prisma`.

**docs:**
- Purpose: product/design direction support docs.
- Contains: frontend design notes.
- Key files: `docs/FRONTEND_DESIGN.md`.

## Key File Locations

**Entry Points:**
- `Backend/app/main.py`: FastAPI application startup and route mount.
- `Backend/app/api/v1/router.py`: central API v1 router aggregator.
- `Frontend/app/layout.tsx`: global layout and theme provider.
- `Frontend/app/page.tsx`: landing experience entry route.
- `Frontend/app/(app)/layout.tsx`: shared shell for in-app routes.

**Configuration:**
- `Backend/pyproject.toml`: Python dependencies and tooling.
- `Backend/ruff.toml`: backend linting rules.
- `Backend/alembic.ini`: migration configuration.
- `Frontend/package.json`: frontend dependencies/scripts.
- `Frontend/next.config.ts`: Next.js config.
- `Frontend/eslint.config.mjs`: frontend lint config.
- `Frontend/tsconfig.json`: TypeScript compiler config.

**Core Logic:**
- `Backend/app/services/health_schedule/rules.py`: pure deterministic schedule rules.
- `Backend/app/services/health_schedule/engine.py`: event persistence and status lifecycle.
- `Backend/app/services/medicine_safety.py`: deterministic medicine safety classification.
- `Backend/app/services/ai_service.py`: model call adapter and response simplification.
- `Backend/app/api/v1/voice.py`: voice webhook orchestration and context assembly.

**Testing:**
- `Backend/tests/test_health_schedule.py`: schedule and status logic tests.
- `Backend/tests/test_medicine_safety.py`: medicine classifier tests.
- `Backend/tests/test_voice.py`: voice endpoint behavior tests.

## Naming Conventions

**Files:**
- Backend Python modules: `snake_case.py`.
- Frontend route files: `page.tsx` and `layout.tsx` by App Router convention.
- Frontend reusable components: `PascalCase.tsx` in `Frontend/components/`.

**Directories:**
- Backend grouped by architectural role (`api`, `core`, `models`, `schemas`, `services`).
- Frontend grouped by route semantics (`app/(app)/...`) and reusable UI (`components`).

## Ownership Hints

- `Backend/` is the primary owned implementation area (noted in `AGENTS.md` as owned by primary dev).
- `Frontend/` is marked in-progress and currently mixes integrated pages with mocked/static pages.
- `PRD.md` and `AGENTS.md` define cross-team and cross-agent constraints for both areas.

## Where to Add New Code

**New backend API feature:**
- Endpoint file: `Backend/app/api/v1/{feature}.py`.
- Schemas: `Backend/app/schemas/{feature}.py`.
- Domain/integration logic: `Backend/app/services/{feature}.py` (or `Backend/app/services/{feature}/`).
- Registration: include new router in `Backend/app/api/v1/router.py`.

**New deterministic schedule behavior:**
- Schedule source update: `Backend/data/india_nis_schedule.json`.
- Deterministic computation changes: `Backend/app/services/health_schedule/rules.py`.
- Persistence/status changes: `Backend/app/services/health_schedule/engine.py`.

**New in-app frontend route:**
- Route placement: `Frontend/app/(app)/{feature}/page.tsx`.
- Shared visual blocks: `Frontend/components/`.
- API contract wrappers/types: extend `Frontend/lib/api.ts`.

**New shared frontend utility/hook:**
- Utility placement: `Frontend/lib/{name}.ts`.
- Hook placement: `Frontend/hooks/{name}.ts`.

**New backend tests:**
- Test placement: `Backend/tests/test_{feature}.py`.

## Special Directories

**Frontend/.next:**
- Purpose: Next.js build and cache artifacts.
- Generated: Yes.
- Committed: No.

**Frontend/node_modules:**
- Purpose: installed frontend dependencies.
- Generated: Yes.
- Committed: No.

**Backend/.venv:**
- Purpose: local Python virtual environment.
- Generated: Yes.
- Committed: No.

**.planning:**
- Purpose: planning context and generated mapping docs.
- Generated: Mixed (manual + generated).
- Committed: project-dependent (currently present in workspace).

**.agents:**
- Purpose: local agent skills/context artifacts.
- Generated: Mixed local artifacts.
- Committed: No.

**graphify-out:**
- Purpose: generated knowledge graph outputs and cache.
- Generated: Yes.
- Committed: currently present in workspace.

---

*Structure analysis: 2026-04-12*