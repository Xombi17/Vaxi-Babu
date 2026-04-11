# Coding Conventions

**Analysis Date:** 2026-04-12

## Naming Patterns

**Backend files and modules:**
- Snake_case module names are standard, especially for API routes and services: `Backend/app/api/v1/dependents.py`, `Backend/app/services/medicine_safety.py`, `Backend/app/core/config.py`.
- Domain grouping is by layer directory (`models`, `schemas`, `services`, `api/v1`) with per-domain files, e.g. `Backend/app/models/health_event.py` and `Backend/app/schemas/household.py`.

**Frontend files and modules:**
- React components use PascalCase filenames and exports: `Frontend/components/VoiceFAB.tsx`, `Frontend/components/AppLayout.tsx`.
- Hooks use `use-*.ts` filenames and `use*` exports: `Frontend/hooks/use-mobile.ts` exports `useIsMobile`.
- Utility modules use lower-case names: `Frontend/lib/api.ts`, `Frontend/lib/utils.ts`.

**Functions and variables:**
- Backend functions are snake_case (`get_timeline`, `mark_event_complete`, `generate_and_save_schedule`) in `Backend/app/api/v1/timeline.py`.
- Frontend functions are camelCase (`toggleCall`, `fetchApi`, `getDependents`) in `Frontend/components/VoiceFAB.tsx` and `Frontend/lib/api.ts`.
- Constants are UPPER_SNAKE_CASE (`RATE_LIMIT_WINDOW`, `IDEMPOTENCY_TTL`, `MOBILE_BREAKPOINT`) in `Backend/app/api/v1/voice.py` and `Frontend/hooks/use-mobile.ts`.

**Types and schemas:**
- Python schemas use PascalCase DTO names with action suffixes (`HouseholdCreate`, `HouseholdUpdate`, `HouseholdResponse`) in `Backend/app/schemas/household.py`.
- TypeScript interfaces are PascalCase (`Household`, `HealthEvent`, `TimelineResponse`) in `Frontend/lib/api.ts`.
- Enums are PascalCase type names with lower-case members in Python and Prisma (`EventStatus`, `EventCategory`) in `Backend/app/models/health_event.py` and `Frontend/prisma/schema.prisma`.

## Code Style

**Python formatting/linting:**
- `pyproject.toml` sets Ruff target/runtime baseline and lint families: `E`, `F`, `I`, `UP`, `B` (`Backend/pyproject.toml`).
- `Backend/ruff.toml` overrides line length to 120 and defines targeted ignores (`B008`, `E501`, `UP042`) with per-file overrides.
- Practical rule in repo docs: run `ruff check .` and optionally `ruff check . --fix` (`AGENTS.md`).

**TypeScript formatting/linting:**
- ESLint is configured via flat config extending Next defaults (`Frontend/eslint.config.mjs`).
- TypeScript strict mode is enabled (`"strict": true`) in `Frontend/tsconfig.json`.
- Path alias `@/*` maps to project root in `Frontend/tsconfig.json`.
- No Prettier config file is detected at frontend root; style consistency is currently driven by ESLint defaults and team habits.

**Observed formatting style in source:**
- Backend uses type hints everywhere in route signatures and return types (`Backend/app/api/v1/dependents.py`, `Backend/app/api/v1/timeline.py`).
- Frontend style is mixed between single-quote/semi-colon-heavy files (`Frontend/components/VoiceFAB.tsx`) and no-semicolon/double-quote files (`Frontend/hooks/use-mobile.ts`).
- Long Tailwind class strings are embedded inline in JSX components (`Frontend/app/page.tsx`, `Frontend/components/AppLayout.tsx`).

## Type-Checking Conventions

- Python mypy is configured but non-strict (`strict = false`) and `ignore_missing_imports = true` in `Backend/pyproject.toml`.
- No explicit mypy command script is defined in backend scripts; type checking is available but not enforced by a committed command wrapper.
- Frontend TypeScript is strict and no-emit (`Frontend/tsconfig.json`), making `next build` a practical typed validation step (`Frontend/package.json`).

## Import Organization

**Backend pattern (observed):**
1. Standard library imports.
2. Third-party framework imports.
3. Local app imports.

Examples: `Backend/app/main.py`, `Backend/app/api/v1/households.py`.

**Frontend pattern (observed):**
- Mixed ordering across files.
- Typical grouping is external packages first, then local modules (`@/` aliases or relative imports), e.g. `Frontend/components/VoiceFAB.tsx` and `Frontend/components/AppLayout.tsx`.

## API and Schema Conventions

**Route design:**
- Versioned REST base prefix is `/api/v1` via router aggregator in `Backend/app/api/v1/router.py`.
- Resource routers use plural nouns and path params (`/households/{household_id}`, `/dependents/{dependent_id}`) in `Backend/app/api/v1/households.py` and `Backend/app/api/v1/dependents.py`.
- Response DTO binding uses `response_model=...` consistently for shape enforcement in route decorators.

**Request/response DTO pattern:**
- `Create`, `Update`, `Response` schema triplets are standard (`Backend/app/schemas/household.py`, `Backend/app/schemas/dependent.py`).
- Partial updates use `model_dump(exclude_unset=True)` before field assignment in patch handlers (`Backend/app/api/v1/households.py`, `Backend/app/api/v1/dependents.py`).
- ORM-to-schema serialization is enabled via `model_config = {"from_attributes": True}` in response models.

**Field naming convention across stack:**
- API payloads are snake_case and mirror SQLModel fields (`primary_language`, `created_at`, `updated_at`) in `Backend/app/schemas/household.py` and `Frontend/lib/api.ts`.
- Prisma schema explicitly maps DB snake_case columns with `@map(...)` while retaining compatibility with backend naming (`Frontend/prisma/schema.prisma`).

**Status/error patterns:**
- `HTTPException` with `404` and clear `detail` strings is the common not-found pattern (`Backend/app/api/v1/households.py`, `Backend/app/api/v1/timeline.py`).
- No custom global error envelope is detected; errors are route-local.

## Error Handling and Logging

- Structured logging via `structlog` is used in core entrypoints and services (`Backend/app/main.py`, `Backend/app/api/v1/voice.py`, `Backend/app/services/medicine_safety.py`).
- Voice webhook includes defensive controls (HMAC verification, rate limiting, idempotency caches) in `Backend/app/api/v1/voice.py`.
- Frontend relies on console logging for runtime errors in voice integration (`console.error` and `console.warn` in `Frontend/components/VoiceFAB.tsx`).

## Comments and Documentation Style

- Backend favors module docstrings plus section divider comments for readability (`Backend/app/api/v1/voice.py`, `Backend/app/main.py`).
- Frontend contains short rationale comments for non-obvious behavior (SSR-safe dynamic import in `Frontend/components/VoiceFAB.tsx`).
- Tests include purpose-oriented header docstrings and focused inline notes (`Backend/tests/test_health_schedule.py`).

## Function and Module Design Patterns

**Backend:**
- Async-first API handlers with dependency injection (`Depends(get_session)`) in route modules.
- Clear separation: models (`Backend/app/models/*`), schemas (`Backend/app/schemas/*`), API handlers (`Backend/app/api/v1/*`), deterministic domain services (`Backend/app/services/health_schedule/*`, `Backend/app/services/medicine_safety.py`).
- Deterministic-first medical logic is encoded in rule tables/functions, not LLM outputs (`Backend/app/services/medicine_safety.py`, `AGENTS.md`).

**Frontend:**
- Component-centric feature assembly with shared layout/shell components (`Frontend/components/AppLayout.tsx`).
- API typing is centralized in `Frontend/lib/api.ts` and consumed as typed contracts.
- Client-only interactive modules use `'use client'` directive where needed (`Frontend/components/VoiceFAB.tsx`, `Frontend/app/page.tsx`).

## Prescriptive Guidance For New Code

- Follow backend snake_case naming and DTO triplet schema pattern (`*Create`, `*Update`, `*Response`).
- Keep API field names snake_case to stay aligned with existing backend and Prisma mappings.
- Place business rules in deterministic service modules, not route handlers.
- Use typed response models on every new FastAPI route and keep `HTTPException` details explicit.
- In frontend, keep shared data contracts in `Frontend/lib/api.ts` and reuse `@/*` alias imports.
- Before adding stylistic changes, normalize lint/format strategy (ESLint-only vs ESLint+Prettier) because current frontend style is mixed.

---

*Convention analysis: 2026-04-12*