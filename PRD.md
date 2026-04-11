# WellSync AI — Final Project Requirements Document

## Document purpose
This document is the single source of truth for WellSync AI. Every human developer, coding agent, planner, reviewer, or automation system must read this file fully before creating, editing, reviewing, or deploying any part of the application.[web:149][web:163]

This file exists to reduce context loss, prevent conflicting parallel work, lower token waste across multiple AI sessions, and keep all implementation decisions aligned with the final product direction chosen for this project.[cite:158][cite:161]

## Mandatory instruction for all AI agents
**Before doing any work, every AI agent must read this entire document first.**[web:149][web:163]

No agent is allowed to start generating code, changing architecture, installing dependencies, or refactoring project structure before reading this file in full and acknowledging the rules defined here. This is mandatory because fragmented sessions and unshared context create conflicts, duplicate work, and token waste.[web:149][cite:161]

## Core operating rules
- One shared source of truth: this file.
- Update this file whenever major decisions change.
- No parallel agents making overlapping edits to the same area at the same time.
- No speculative architecture changes without updating this document first.
- No dependency additions unless they are justified in this file.
- No database, auth, or voice stack changes unless explicitly approved here.
- No “start coding immediately” behavior without requirement review.
- Every coding session must begin by checking the current contents of this file and relevant repo docs.
- Every substantial implementation must end with a short update note added to this file or a linked changelog file.

## Project title
**WellSync AI — Voice-First Health Memory System for Every Family**[cite:158]

## Problem statement
In many rural, low-access, and low-literacy communities, families miss important preventive healthcare actions such as vaccinations, pregnancy checkups, routine follow-ups, and child health milestones because information is fragmented, records are hard to maintain, literacy is limited, and reminders are not always understandable or actionable.[web:11][web:12]

Most digital health products assume that users can read, navigate apps, understand schedules, and manage records themselves. That assumption breaks down in underserved settings, especially when connectivity is unstable and healthcare memory is distributed across multiple caregivers in a household.[web:11][web:12][web:18]

WellSync AI solves this by turning health tracking into a proactive, voice-first, family-centered memory system that reminds, explains, and guides users using simple interactions and local-language support.[web:12][cite:158]

## Product vision
WellSync AI should behave like a trusted family health memory assistant that helps households remember what is due, understand why it matters, and take preventive actions on time.[web:12][web:18]

It is not a diagnosis system, not a replacement for doctors, and not a generic chatbot. It is a structured preventive-care assistant built on deterministic health schedules with AI used only for explanation, translation, and natural interaction.[web:18][web:31][web:36]

## Final product direction
The product must be built as a **voice-first preventive healthcare memory platform** for families, initially focused on child vaccination schedules and explainable health timelines, with future extensibility into pregnancy care, elder care, medicine adherence, and household preventive reminders.[cite:158][web:24][web:31]

## Final tech stack
This is the locked stack unless explicitly changed in this document.

### Frontend
- Next.js **16.2.3** with App Router.[web:92][web:163]
- TypeScript.[web:92]
- Tailwind CSS.
- ShadCN UI.
- Framer Motion.
- TanStack Query.
- React Hook Form.
- Zod.
- PWA support with service worker and manifest.[web:51]
- IndexedDB with Dexie for offline-first local data.

### Backend
- FastAPI.
- Python 3.11 or 3.12.
- Pydantic schemas.
- Custom deterministic health schedule engine.
- Rule-based safety filters.
- Orchestration layer for AI and voice logic.

### Database and ORM
- Neon serverless Postgres.[web:79][web:81]
- **SQLModel** (SQLAlchemy + Pydantic) as ORM for the backend — replaces Prisma for backend-only DB ownership.
- **asyncpg** as the async Postgres driver.
- **Alembic** for database migrations.
- Relational schema for households, dependents, health events, reminders, and conversation logs.

### Authentication
- Auth.js / NextAuth with Prisma adapter.
- Session strategy should remain simple for MVP.

### AI and intelligence
- **Groq API** (`llama-3.3-70b-versatile`) for low-latency LLM responses.
- LLM use is limited to explanation, simplification, translation, and conversational response generation.
- Deterministic schedule logic must never be delegated to the LLM.
- **Ollama** (local) with **Gemma 4** as primary and **Llama 3.2 Vision** as fallback for medicine OCR.
- **Google Cloud Vision API** as optional 3rd-tier OCR fallback.

### Voice stack
- Vapi AI for live voice agent orchestration.[web:134][web:136]
- Vapi provider stack handles live STT/TTS and streaming conversational flow.[web:153]
- Browser Speech Synthesis may be retained as fallback only.

### Monorepo and tooling
- Turborepo (planned for full monorepo).
- pnpm workspaces (frontend).
- ESLint, Prettier (frontend).
- **pyproject.toml** with `hatchling` build backend (Python).
- **ruff** for Python linting and formatting.
- **mypy** for optional Python static typing.
- Husky optional if time permits.
- GitHub Actions for CI.

### Testing
- Vitest.
- React Testing Library.
- **Pytest** + **pytest-asyncio** for async backend tests.
- Playwright.

### Deployment
- Vercel for frontend.
- Railway or Render for backend.
- Neon for database hosting.[web:79][web:81]

### Analytics and observability
- PostHog for product analytics.
- Basic structured logs for backend errors, voice failures, and sync failures.

## Why this stack is locked
Next.js 16.2.3 is the latest stable direction and includes AI-oriented workflow improvements and better development ergonomics, which is useful when AI agents are assisting development.[web:92][web:149][web:163]

Neon plus Prisma was selected over Convex and Supabase because the application has clearly relational data structures and benefits from schema clarity, SQL modeling, and long-term maintainability without Supabase’s paused free-project issue being part of the core stack choice.[web:79][web:81][web:95]

Vapi was selected for the hackathon and MVP because it reduces live voice integration complexity and allows the team to ship faster with initial trial credits instead of building a custom low-latency voice transport stack from scratch.[web:136][web:137][web:145]

## Product goals
- Help families remember upcoming and missed health actions.
- Explain each action in simple language.
- Provide live voice interaction in a natural, accessible interface.
- Work reasonably well under low-connectivity conditions.
- Reduce dependence on literacy-heavy interfaces.
- Demonstrate a clear, working MVP suitable for a hackathon and a mini project.

## Non-goals
- No medical diagnosis.
- No emergency treatment guidance beyond static escalation instructions.
- No autonomous medical decision-making.
- No unsupported health claims.
- No uncontrolled LLM-generated scheduling logic.
- No bloated admin panel in MVP.

## Target users
- Parents and caregivers in low-literacy households.[web:11]
- Families with children needing vaccination tracking.[web:24]
- Multigenerational households where memory and responsibility are shared.
- Future: ASHA workers, Anganwadi workers, and community health volunteers.[web:23][web:31]

## Core MVP features
### Feature 1: Household onboarding
- Create household record.
- Add caregiver details.
- Add child profile with date of birth and language preference.

### Feature 2: Health timeline generation
- Generate vaccination and preventive care timeline from DOB.
- Mark events as upcoming, due, overdue, completed.
- Show next action clearly.

### Feature 3: Voice-first interaction
- User can ask questions by voice.
- System listens in supported language.
- System replies in simple voice output.
- Live voice experience must be demo-ready.

### Feature 4: Simple health explanations
- For each event, explain what it is, why it matters, and what action to take.
- Response must be grounded in preapproved facts and structured schedule metadata.

### Feature 5: Reminders and status tracking
- Show upcoming reminders.
- Allow marking tasks done.
- Allow acknowledgement or snooze.

### Feature 6: Offline-first support
- Cache app shell.
- Store core household and event timeline locally.
- Queue updates for later sync.

## Future features
- Pregnancy schedule support.
- Multi-child household dashboard.
- Elder care reminders.
- Medicine adherence reminders.
- Community health worker mode.
- WhatsApp or IVR follow-up channels.
- Import/export integrations with future health platforms.

## Product behavior rules
- Always present the next due or overdue health action prominently.
- Prioritize clarity over feature density.
- Use local-language-friendly phrasing.
- Use voice as primary interaction, text as fallback.
- Minimize typing.
- Never overwhelm user with too many steps at once.
- Keep interface accessible for low digital literacy users.

## Health and safety rules
- This product must never diagnose disease.
- This product must never recommend unsafe treatment.
- This product must never invent vaccine schedules.
- All schedule outputs must come from the deterministic schedule engine.
- AI explanations must be derived from approved structured facts.
- Unsafe or out-of-scope questions must trigger fallback guidance such as “please consult a healthcare worker or doctor.”
- All medical content must be presented as guidance, not authority.

## AI agent system design rules
### Rule 1: Read-first rule
Every AI agent must read this file first before acting.[web:149][web:163]

### Rule 2: No blind parallelization
Do not run multiple code-generation agents in parallel on overlapping tasks. If multiple agents are used, each must own a clearly separated area such as frontend UI, backend rules, or documentation, and their boundaries must be written down before work starts.[cite:161]

### Rule 3: Update-the-doc rule
After important decisions, agents must update this file or a linked progress log so that future sessions inherit context without re-spending tokens.

### Rule 4: No architecture drift
Agents must not change database provider, ORM, voice platform, framework version, or file structure conventions without explicit approval recorded in this file.

### Rule 5: Use existing context first
Before asking for more context, agents should inspect:
1. this document,
2. the repo README,
3. architecture docs,
4. package manifests,
5. env example files,
6. current schema and API contracts.

### Rule 6: Minimal token usage
Agents should avoid repeatedly re-explaining context that already exists in repo docs. Instead, they should reference existing project files and operate incrementally.

### Rule 7: Deterministic-first rule
If something can be handled by a rule engine or schema validation, do that first. Use LLM reasoning only where natural language, translation, summarization, or user communication is required.

### Rule 8: Structured outputs rule
Agents should produce concise outputs: changed files, why they changed, what assumptions were made, and what remains to be done.

### Rule 9: Small diffs rule
Agents should make focused changes in small units to reduce merge conflicts and review complexity.

### Rule 10: No duplicate dependencies
Before adding any package, agent must check whether an existing dependency or native platform feature already solves the problem.

## Coding standards
- TypeScript strict mode enabled.
- Use shared types where possible.
- Avoid unnecessary abstraction in MVP.
- Prefer server-safe, typed APIs.
- Keep components small and single-purpose.
- Prefer composition over deeply nested prop chains.
- Validate all external inputs.
- Use descriptive names and stable folder conventions.
- Do not leave placeholder code without marking it clearly.
- No dead code or unused packages in final submissions.

## Frontend rules
- Use App Router only.
- Keep routes simple and intentional.
- Use server components where useful, client components only when needed.
- Optimize for mobile-first design.
- Use accessible form controls.
- Keep UI minimal and focused on the next action.
- Avoid overanimation; use motion only for clarity and polish.
- Ensure voice controls are obvious and easy to trigger.

## Backend rules
- Keep schedule generation deterministic and versioned.
- Separate rule engine, voice orchestration, safety filtering, and API routing.
- Expose clear schemas for request and response payloads.
- Log failures in STT, voice sessions, sync, and schedule generation.
- Ensure idempotent updates where possible.

## Database rules
- Schema must be normalized enough for clarity but not overengineered.
- Prisma schema is authoritative for database modeling.
- Use migrations consistently.
- Use audit timestamps on major tables.
- Prefer explicit relations over JSON blobs for core domain data.
- Keep health event records queryable and version-aware.

## Voice system rules
- Live voice interaction must feel responsive.
- Keep prompts short and clear.
- Reduce conversational latency where possible.
- Provide fallback text response if voice fails.
- Record only what is necessary for the product flow.
- Avoid expensive voice loops when a short answer is enough.

## Monorepo rules
Recommended structure:

```text
wellsync-ai/
  apps/
    web/
    api/
  packages/
    ui/
    shared-types/
    health-rules/
    agents/
    config/
  docs/
    requirements/
    architecture/
    prompts/
    changelog/
```

Rules:
- Frontend and backend must live in same monorepo.[cite:161]
- Shared schemas and contracts must live in packages.
- Docs must be stored in repo, not in chat only.
- Every important prompt or agent instruction should be versioned.

## Token-saving strategy
This section is mandatory for all AI-assisted development sessions.

### Why token waste happens
Token waste usually comes from repeated re-explaining of product context, repeated architectural debates, long unstructured prompts, duplicated code generation attempts, and agents working without reading existing files first.

### Token-saving rules
- Keep this document updated so future sessions reuse context instead of regenerating it.
- Use short task-specific prompts after context is documented.
- Ask agents to read exact files before coding instead of restating the whole project in every prompt.[web:149][web:163]
- Split work into scoped tasks: one route, one component, one endpoint, one schema at a time.
- Reuse existing components and utility functions.
- Prefer patching files over regenerating whole files.
- Maintain a prompt library for common tasks.
- Maintain architecture, schema, and API docs in repo.
- Use strict output formats such as “files changed / summary / next step.”
- Avoid asking multiple agents to solve the same problem independently.

### Best prompting pattern
Use this pattern for coding agents:
1. Read `wellsync_final_project_requirements.md`.
2. Read the relevant files you will edit.
3. Summarize only the task-specific context in 5 to 8 lines.
4. Make the smallest valid implementation.
5. Return changed files, assumptions, and next steps.

This reduces repeated token burn and keeps sessions deterministic.[web:149][web:163]

### Code generation best practices to save tokens
- Prefer incremental diffs over full rewrites.
- Keep functions short and purpose-specific.
- Avoid excessive comments generated by AI.
- Put business rules in config or data files instead of repeating them in prompts.
- Generate schemas once and reference them everywhere.
- Keep examples small and representative.
- Avoid “make it production-ready” prompts without boundaries.
- Ask for exact deliverables: one endpoint, one migration, one UI state, one test.

### Documentation strategy to save tokens
Create and maintain these files in the repo:
- `docs/requirements/wellsync_final_project_requirements.md`
- `docs/architecture/system-architecture.md`
- `docs/prompts/agent-rules.md`
- `docs/prompts/task-templates.md`
- `docs/changelog/session-log.md`
- `README.md`
- `.env.example`
- `AGENTS.md`

Using `AGENTS.md` is especially helpful because newer Next.js workflows explicitly improve AI-assisted development patterns and agent-oriented project context handling.[web:149][web:163]

## Recommended session workflow for AI-assisted development
### At the start of every session
1. Read this PRD.
2. Read repo README.
3. Read session log.
4. Read architecture notes for relevant area.
5. Read files to be edited.
6. Confirm no one else is editing the same area.

### During implementation
1. Make one scoped change.
2. Run lint/tests where relevant.
3. Update docs if decision changed.
4. Commit with clear message.

### At session end
1. Write short summary.
2. Note pending blockers.
3. Update changelog or task log.
4. Record any changed assumptions.

## Deliverables expected in repo
- Functional Next.js frontend.
- Functional FastAPI backend.
- Prisma schema and migrations.
- Neon database connection.
- Vapi integration for live voice.
- Deterministic vaccination timeline engine.
- Local offline support.
- Core tests.
- README and setup instructions.
- Architecture docs.
- Prompt and agent operation docs.

## Final enforcement statement
Any human or AI contributor who works on WellSync AI without reading and following this document is operating out of process. This document is mandatory context, mandatory architecture guidance, and mandatory coordination policy for the project.[web:149][cite:161]

## New feature addition: medicine safety checker
This feature is now approved as an add-on module for WellSync AI. It should be treated as a **medicine safety double-check assistant** and not as a diagnosis tool.[web:172][web:171]

### Problem this feature addresses
People sometimes self-medicate with common tablets, creams, painkillers, cold medicines, or antibiotics without checking whether the medicine may be risky for pregnancy, lactation, age, allergy status, or specific conditions. Public health guidance notes that medication safety in pregnancy is complex, medicine use during pregnancy is common, and safety information is incomplete for many medicines, so simple “safe/unsafe” assumptions are dangerous.[web:171][web:172][web:196]

### Purpose
Allow a user to upload a photo of a medicine strip, medicine box, or printed prescription and ask whether the medicine may have important side effects, cautions, or pregnancy-related risk signals that require pharmacist or doctor consultation.[web:188][web:190]

### Scope for MVP
- Upload image of medicine packaging, strip, or printed prescription.
- Extract medicine text using OCR.
- Normalize medicine name to a known record.
- Check common side effects, key cautions, and pregnancy-related warnings.
- Return a simplified response in safe language.
- Escalate to “consult doctor/pharmacist urgently” when risk is high or confidence is low.

### Technical approach
- **OCR layer:** PaddleOCR for printed prescriptions and medicine packaging extraction.[web:188][web:184][web:194]
- **Preprocessing:** grayscale, denoising, skew correction, and text cleanup before extraction.[web:188]
- **Drug knowledge layer:** use structured drug-label and safety sources such as FDA labeling resources and open drug data sources for warnings, pregnancy and lactation information, and adverse-effect summaries.[web:190][web:200]
- **Safety engine:** deterministic rule-based classifier for risk buckets such as `common_use`, `use_with_caution`, `insufficient_information`, and `consult_doctor_urgently`.[web:171][web:196]
- **AI layer:** only simplifies results and explains them in user-friendly language; it must not independently infer medication safety.

### Safety rules for this feature
- Never claim a medicine is universally safe.
- Never provide diagnosis.
- Never advise continuing or stopping prescription medication with strong authority.
- Always present uncertainty when evidence is incomplete.[web:171][web:172]
- Pregnancy-related responses must be especially cautious because fewer than 10% of medicines approved since 1980 have enough data to determine safety during pregnancy according to CDC information.[web:171]
- When risk is unclear, respond conservatively and direct the user to a doctor or pharmacist.[web:172][web:205]

### UX response rules
All responses should be short, plain-language, and bucketed:
- Usually okay for common use
- Use with caution
- Not enough information
- Avoid / talk to doctor now

Every response should also include:
- what medicine was detected,
- what concern was checked,
- why caution is needed,
- what the user should do next.

### Suggested future extension
This module can later support handwritten prescription parsing, allergy cross-checking, pregnancy week-based warnings, and medicine reminder integration into the household health timeline.[web:188][web:203]

---

## Implementation Progress Log

### Session: 2026-04-11 — Backend Foundation

**What was built:**

- Created full backend project under `Backend/` using FastAPI + SQLModel + asyncpg + Neon Postgres.
- **Stack deviation approved:** Switched from Prisma to SQLModel for the backend. Prisma is the planned ORM for the frontend server layer; SQLModel is used for backend-only DB schema ownership to stay within the Python ecosystem.
- **`pyproject.toml`** created with all backend dependencies: FastAPI, uvicorn, SQLModel, asyncpg, Alembic, Pydantic Settings, httpx, Groq, Pillow, python-multipart, structlog, python-dateutil.
- **Models implemented:**
  - `Household` — family unit with name, language, location fields.
  - `Dependent` — person in household with `DependentType` (child/adult/elder/pregnant), `Sex` enum, DOB, and optional pregnancy fields.
  - `HealthEvent` — timeline item with `EventStatus` (upcoming/due/overdue/completed), `EventCategory` (vaccination/checkup/vitamin/reminder), `schedule_key`, `schedule_version`, dose tracking, window dates, and completion tracking.
  - `Reminder` — standalone reminder table.
- **Health Schedule Engine:**
  - `rules.py`: Loads `data/india_nis_schedule.json` at startup. Provides `generate_child_schedule(dob)` which computes all NIS event due dates deterministically from DOB. Schedule version is stored with each event.
  - `engine.py`: Orchestrates schedule persistence (idempotent — skips existing schedule_key+dependent_id pairs). Recomputes `upcoming/due/overdue` status dynamically on every fetch. Provides `get_next_due_event()` for voice assistant priority.
  - DUE_WINDOW_DAYS = 7 (events within 7 days of due date are marked `due`).
- **Groq AI Service (`ai_service.py`):**
  - Singleton `AsyncGroq` client with lazy init.
  - `explain_health_event()` — plain-language event explanations.
  - `answer_voice_question()` — voice Q&A using health timeline context.
  - `simplify_medicine_result()` — converts safety bucket to simple language.
  - All Groq calls have static-text fallback on exception.
  - Language support: English and Hindi.
- **OCR Service (`ocr_service.py`):**
  - 3-tier fallback chain: Gemma 4 (Ollama) → Llama 3.2 Vision (Ollama) → Google Cloud Vision API.
  - Image preprocessing: converts to RGB, resizes to max 1024px on longest edge, saves as JPEG 85% quality before sending to model.
  - Returns `(text, model_used_label)` tuple for traceability.
- **Medicine Safety Service (`medicine_safety.py`):** Rule-based classifier with 4 safety buckets.
- **API routes:** `/api/v1/households` (CRUD), `/api/v1/dependents` (CRUD + timeline generation).
- **Core config:** Pydantic Settings with `.env.example` covering all required and optional variables.
- **Database layer:** Async SQLAlchemy engine with `pool_size=5`, `max_overflow=10`, `pool_pre_ping=True`. Auto-creates tables in dev via `create_db_and_tables()`. Proper session lifecycle with commit/rollback/close.

**Pending as of this session:**
- Vapi webhook endpoint (`/api/v1/voice/vapi-webhook`).
- Alembic migration initial setup.
- Full Pytest test suite.
- Frontend integration (Next.js).
- Offline-first PWA implementation.
