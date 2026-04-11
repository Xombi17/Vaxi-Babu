# Architecture

**Analysis Date:** 2026-04-11

## Pattern Overview

**Overall:** Layered API Architecture with Service-Oriented Design

**Key Characteristics:**
- FastAPI-based REST API with async handlers
- SQLModel for database abstraction
- Service layer for business logic (health schedules, AI, medicine safety)
- Deterministic-first approach for health logic (no LLM for safety decisions)
- Webhook handlers for voice integration (Vapi)

## Layers

**API Layer (`app/api/v1/`):**
- Purpose: HTTP request handling and response formatting
- Location: `Backend/app/api/v1/`
- Contains: Route handlers (households, dependents, timeline, reminders, medicine, ai, voice, sync)
- Depends on: Services, Schemas
- Used by: FastAPI router, external clients

**Service Layer (`app/services/`):**
- Purpose: Business logic orchestration
- Location: `Backend/app/services/`
- Contains: `ai_service.py`, `medicine_safety.py`, `ocr_service.py`, `health_schedule/`
- Depends on: Models, Schemas, External APIs (Groq, Ollama)
- Used by: API layer

**Health Schedule Engine (`app/services/health_schedule/`):**
- Purpose: Deterministic schedule generation and status computation
- Location: `Backend/app/services/health_schedule/`
- Contains: `engine.py`, `rules.py`
- Depends on: Models (HealthEvent, Dependent)
- Used by: API layer (timeline, dependents)

**Model Layer (`app/models/`):**
- Purpose: Database schema definitions
- Location: `Backend/app/models/`
- Contains: SQLModel definitions (Household, Dependent, HealthEvent, Reminder)
- Depends on: SQLModel
- Used by: Service layer, API layer

**Schema Layer (`app/schemas/`):**
- Purpose: Pydantic request/response validation
- Location: `Backend/app/schemas/`
- Contains: Request/Response schemas for each domain
- Depends on: Pydantic
- Used by: API layer

**Core Layer (`app/core/`):**
- Purpose: Application configuration and database setup
- Location: `Backend/app/core/`
- Contains: `config.py` (settings), `database.py` (session management)
- Depends on: Pydantic Settings, SQLModel
- Used by: All layers

## Data Flow

**Health Timeline Flow:**
1. Client requests timeline for a dependent
2. API handler (`app/api/v1/timeline.py`) receives request
3. Service (`app/services/health_schedule/engine.py`) generates/refreshes events
4. Status computed deterministically based on due_date vs today
5. Response formatted with schemas and returned

**Medicine Safety Flow:**
1. Client uploads medicine image or enters name
2. API handler (`app/api/v1/medicine.py`) receives request
3. OCR service extracts text (if image) via Ollama
4. Deterministic classifier (`app/services/medicine_safety.py`) categorizes safety
5. Optional: AI service simplifies result via Groq
6. Response returned with safety bucket and recommendations

**Voice Question Flow:**
1. Vapi webhook sends voice transcript to `/api/v1/voice/webhook`
2. API handler passes context + question to AI service
3. Groq generates response based on health timeline context
4. Response sent back to Vapi for TTS

## Key Abstractions

**Health Schedule Engine:**
- Purpose: Generate and manage vaccination/checkup schedules
- Examples: `Backend/app/services/health_schedule/engine.py`, `Backend/app/services/health_schedule/rules.py`
- Pattern: Deterministic rule-based generation (India NIS schedule)

**Medicine Safety Classifier:**
- Purpose: Categorize medicine safety without LLM decision-making
- Examples: `Backend/app/services/medicine_safety.py`
- Pattern: Rule-based lookup with fuzzy matching

**AI Service:**
- Purpose: Wrapper for Groq API with health-focused prompts
- Examples: `Backend/app/services/ai_service.py`
- Pattern: Fallback to static templates on failure

## Entry Points

**Application Entry:**
# Architecture

**Analysis Date:** 2026-04-12

## Pattern Overview

**Overall:** Modular monolith with deterministic health domain core and adapter-style integration services.

**Key Characteristics:**
- Backend is a single FastAPI service with clear internal boundaries: API routing, core infra, models/schemas, and services.
- Frontend is a Next.js App Router application split between public landing and authenticated-like app routes under `app/(app)`.
- Health scheduling and medicine classification are deterministic; LLM calls are used only for explanation/simplification.

## Layers

**Backend API Layer:**
- Purpose: Expose versioned REST endpoints and orchestrate request-level flow.
- Location: `Backend/app/api/v1/`.
- Contains: `router.py`, `households.py`, `dependents.py`, `timeline.py`, `reminders.py`, `medicine.py`, `ai.py`, `voice.py`, `sync.py`, `auth.py`.
- Depends on: `app.core.database`, `app.models`, `app.schemas`, `app.services`.
- Used by: Frontend client (`Frontend/lib/api.ts`) and Vapi webhook callbacks.

**Backend Core Infrastructure Layer:**
- Purpose: Runtime settings, DB session lifecycle, auth primitives.
- Location: `Backend/app/core/`.
- Contains: `config.py`, `database.py`, `auth.py`.
- Depends on: environment variables and SQLModel/SQLAlchemy async runtime.
- Used by: route modules and service modules.

**Backend Domain Model Layer:**
- Purpose: Persisted data contracts and enums.
- Location: `Backend/app/models/`.
- Contains: `household.py`, `dependent.py`, `health_event.py`, `reminder.py`, `conversation.py`.
- Depends on: SQLModel fields and Python enums/types.
- Used by: API handlers, schedule engine, voice context assembly.

**Backend Domain Service Layer (Deterministic):**
- Purpose: Rule-based timeline and safety logic.
- Location: `Backend/app/services/health_schedule/`, `Backend/app/services/medicine_safety.py`.
- Contains: `rules.py` (pure schedule computation), `engine.py` (DB-aware orchestration), deterministic medicine bucket rules.
- Depends on: `Backend/data/india_nis_schedule.json`, model enums.
- Used by: `dependents.py`, `timeline.py`, `medicine.py`.

**Backend Integration Service Layer (AI/OCR):**
- Purpose: External model/OCR calls behind stable interfaces.
- Location: `Backend/app/services/ai_service.py`, `Backend/app/services/ocr_service.py`.
- Contains: Async OpenAI-compatible client for GitHub Models and multimodal OCR pipeline.
- Depends on: `github_token`, model settings in `config.py`.
- Used by: `ai.py`, `medicine.py`, `voice.py`.

**Frontend Route and Composition Layer:**
- Purpose: Route rendering, navigation shell, feature UI, API invocation.
- Location: `Frontend/app/`, `Frontend/components/`, `Frontend/lib/`.
- Contains: route pages, `AppLayout`, `ScannerView`, `VoiceFAB`, typed API client.
- Depends on: browser runtime, Next.js App Router, backend endpoints.
- Used by: end users through web/mobile browser.

## Data Flow

**Flow 1: Dependent creation -> deterministic schedule materialization**
1. `POST /api/v1/dependents` (`Backend/app/api/v1/dependents.py`) validates `household_id`.
2. Dependent is persisted as `Dependent`.
3. `generate_and_save_schedule` (`Backend/app/services/health_schedule/engine.py`) computes events via `generate_child_schedule` (`rules.py`) from `Backend/data/india_nis_schedule.json`.
4. New `HealthEvent` rows are inserted idempotently by `schedule_key`.

**Flow 2: Timeline read -> status refresh -> UI mapping**
1. Timeline page (`Frontend/app/(app)/timeline/[dependent_id]/page.tsx`) calls `getTimeline` in `Frontend/lib/api.ts`.
2. `GET /api/v1/timeline/{dependent_id}` (`Backend/app/api/v1/timeline.py`) ensures schedule exists and calls `refresh_event_statuses`.
3. Response includes ordered events and `next_due`; frontend maps statuses to UI tokens/colors/icons.

**Flow 3: Medicine scan path**
1. Scanner UI (`Frontend/components/ScannerView.tsx`) uploads image via `checkMedicineByImage`.
2. `POST /api/v1/medicine/check-image` (`Backend/app/api/v1/medicine.py`) validates MIME/size.
3. OCR extraction runs in `Backend/app/services/ocr_service.py`.
4. Deterministic safety classification runs in `Backend/app/services/medicine_safety.py`.
5. Optional simplification runs through `simplify_medicine_result` in `Backend/app/services/ai_service.py`; fallback text is retained on failure.

**Flow 4: Voice tool-call webhook**
1. Voice UI (`Frontend/components/VoiceFAB.tsx`) starts Vapi call when keys are configured.
2. Vapi sends webhook events to `POST /api/v1/voice/webhook` (`Backend/app/api/v1/voice.py`).
3. Handler applies optional signature verification, in-memory rate limiting, idempotency checks, then dispatches tool handlers.
4. Tool handlers read household/dependent/event data and may call `answer_voice_question` for concise response generation.

**Flow 5: Offline mutation replay**
1. Client posts queued mutations to `POST /api/v1/sync/batch` (`Backend/app/api/v1/sync.py`).
2. Endpoint validates that each mutation target begins with `/api/v1/`.
3. Mutations are replayed through internal HTTP requests; per-mutation status (`applied`, `failed`, `skipped`) is returned.

**State Management:**
- Backend state: Postgres via SQLModel entities.
- Frontend state: local component state (`useState`, `useEffect`) with typed fetch wrappers in `Frontend/lib/api.ts`.
- Voice webhook protection state: process-local memory dictionaries in `voice.py`.

## Key Abstractions

**Deterministic Schedule Abstraction:**
- Purpose: timeline generation independent of LLM behavior.
- Examples: `Backend/app/services/health_schedule/rules.py`, `Backend/app/services/health_schedule/engine.py`.
- Pattern: pure function schedule calculation + DB persistence orchestration.

**Safety Bucket Abstraction:**
- Purpose: medicine caution output with explicit risk buckets and next-step guidance.
- Examples: `Backend/app/services/medicine_safety.py`, `Backend/app/api/v1/medicine.py`.
- Pattern: static rule table and conservative defaulting.

**Typed API Contract Abstraction:**
- Purpose: stable payload shape across backend and frontend.
- Examples: `Backend/app/schemas/`, `Frontend/lib/api.ts`.
- Pattern: Pydantic schemas mirrored by TypeScript interfaces.

**Shared App Shell Abstraction:**
- Purpose: consistent navigation, voice trigger, and cross-page chrome.
- Examples: `Frontend/app/(app)/layout.tsx`, `Frontend/components/AppLayout.tsx`.
- Pattern: route-group layout wrapping page components.

## Entry Points

**Backend runtime entry:**
- Location: `Backend/app/main.py`.
- Triggers: ASGI startup (`uvicorn app.main:app ...`).
- Responsibilities: app initialization, dev-time table creation, CORS setup, v1 router inclusion, health check route.

**Backend route composition entry:**
- Location: `Backend/app/api/v1/router.py`.
- Triggers: imported from `main.py`.
- Responsibilities: aggregate all domain routers under `/api/v1`.

**Frontend root entry:**
- Location: `Frontend/app/layout.tsx`, `Frontend/app/page.tsx`.
- Triggers: Next.js route rendering.
- Responsibilities: global theme provider and landing page.

**Frontend in-app entry:**
- Location: `Frontend/app/(app)/layout.tsx`.
- Triggers: all in-app routes (`/dashboard`, `/dependents`, `/timeline/...`, `/medicine`, `/reminders`, `/settings`, `/households`).
- Responsibilities: mount shared `AppLayout` shell.

## Error Handling

**Strategy:** explicit HTTP exceptions at route boundaries plus service-level graceful fallback for non-critical AI paths.

**Patterns:**
- Route modules return explicit status errors (e.g., 404 for missing entities, 413 for large images, 429 for rate limit).
- AI and OCR wrapper failures are caught and converted to safe user-facing fallback messages when possible.
- DB dependency `get_session` in `Backend/app/core/database.py` wraps commit/rollback semantics around each request scope.

## Backend/Frontend Split

**Backend responsibilities:**
- Data ownership and persistence (`Household`, `Dependent`, `HealthEvent`, `Reminder`, `Conversation`).
- Deterministic schedule and medicine safety logic.
- Voice webhook orchestration and offline sync replay.

**Frontend responsibilities:**
- UX flows, route-level rendering, API calls, camera/file interactions, voice call initiation.
- Page-level transformation of backend entities into visual cards/timeline widgets.

**Current implementation boundary:**
- Live backend integration is present in key paths like dashboard/timeline/medicine (`Frontend/app/(app)/dashboard/page.tsx`, `Frontend/app/(app)/timeline/[dependent_id]/page.tsx`, `Frontend/components/ScannerView.tsx`).
- Some pages still use static mock arrays/forms without backend writes (`Frontend/app/(app)/households/page.tsx`, `Frontend/app/(app)/dependents/page.tsx`, `Frontend/app/(app)/reminders/page.tsx`, `Frontend/app/(app)/households/new/page.tsx`, `Frontend/app/(app)/dependents/new/page.tsx`).

## Cross-Cutting Concerns

**Logging:**
- Structured logs via `structlog` in `Backend/app/main.py`, `Backend/app/api/v1/medicine.py`, `Backend/app/api/v1/voice.py`, `Backend/app/services/ai_service.py`, `Backend/app/services/ocr_service.py`.

**Validation:**
- Input/output validation via FastAPI + Pydantic/SQLModel schemas in `Backend/app/schemas/`.
- Enum and field constraints in `Backend/app/models/`.

**Authentication:**
- JWT issuance endpoint exists in `Backend/app/api/v1/auth.py`.
- Global auth enforcement dependencies are not yet applied across all v1 routes.

## Implemented Design Constraints

- Deterministic-first schedule contract: health event generation is anchored to `Backend/data/india_nis_schedule.json` through `rules.py`; scheduling is not delegated to LLM outputs.
- AI scope constraint: `Backend/app/services/ai_service.py` confines model usage to explanation, Q&A simplification, and fallback-safe messaging.
- Dev/prod DB behavior split: `Backend/app/main.py` auto-creates tables only in development; production expects migration-driven schema management.
- API namespace constraint: all public endpoints are mounted under `/api/v1`; sync only replays mutations targeting that prefix.
- Voice reliability constraint: rate-limit/idempotency state in `Backend/app/api/v1/voice.py` is in-memory and resets on process restart.
- Frontend voice dependency constraint: `Frontend/components/VoiceFAB.tsx` requires `NEXT_PUBLIC_VAPI_PUBLIC_KEY` and `NEXT_PUBLIC_VAPI_ASSISTANT_ID`; otherwise it enters simulation behavior.

---

*Architecture analysis: 2026-04-12*