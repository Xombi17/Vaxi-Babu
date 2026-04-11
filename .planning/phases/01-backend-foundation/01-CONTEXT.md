# Phase 1: Backend Foundation - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning
**Source:** PRD Express Path plus user constraints from the current session

<domain>
## Phase Boundary

Phase 1 delivers the backend foundation and local validation path. The backend must run locally, validate its environment, create and migrate its schema, support household and dependent creation, expose the API endpoints cleanly, and make the voice webhook testable in local development before later phases build on top of it.

</domain>

<decisions>
## Implementation Decisions

### Backend local stability
- The backend must be runnable locally before the phase is considered complete.
- Environment validation at startup is part of the phase, not a later cleanup item.
- Alembic migrations must be exercised against the local backend database.

### User and household flows
- Adding users/households is in scope for this phase.
- Household and dependent creation must work end-to-end through the backend API.
- Endpoint wiring must be verified against real request flows, not only unit-level mocks.

### Voice entrypoint
- The Vapi voice webhook must be testable in local development.
- Local voice-agent requests belong in this phase so later UI and deployment work can rely on a working backend contract.

### Health timeline core
- Deterministic health timeline generation stays in this phase.
- Event status computation must remain accurate for upcoming, due, overdue, and completed states.

### Backend quality bar
- API errors should be explicit and stable.
- Database session handling must support concurrent requests.
- OpenAPI documentation should accurately reflect the backend surface.

### the agent's Discretion
- Exact test harness structure, fixture layout, and endpoint test granularity.
- Whether any backend refactors are needed to make local startup and voice testing reliable.
- The smallest implementation changes required to keep the local backend stable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and sequencing
- [.planning/ROADMAP.md](../../ROADMAP.md) — Phase ordering, goals, and final deployment phase.
- [.planning/REQUIREMENTS.md](../../REQUIREMENTS.md) — User-facing requirements mapped to the product scope.
- [.planning/STATE.md](../../STATE.md) — Current project status and phase progress.
- [PRD.md](../../../PRD.md) — Source of truth for product direction and constraints.

### Backend implementation surface
- [Backend/app/main.py](../../../Backend/app/main.py) — Backend application entrypoint.
- [Backend/app/api/v1/router.py](../../../Backend/app/api/v1/router.py) — API route registration.
- [Backend/app/api/v1/voice.py](../../../Backend/app/api/v1/voice.py) — Voice webhook and related flow.
- [Backend/app/core/config.py](../../../Backend/app/core/config.py) — Runtime configuration and env validation.
- [Backend/app/core/database.py](../../../Backend/app/core/database.py) — Database session and schema setup.
- [Backend/app/models/](../../../Backend/app/models/) — Backend data model layer.

</canonical_refs>

<specifics>
## Specific Ideas

- The user explicitly wants local backend testing first because the backend was not running.
- The user explicitly wants the voice agent tested inside the local backend.
- The user wants the work split phase by phase rather than handled as one large rollout.
- The user wants later frontend work to include a better running page and overall polish.
- The user wants final deployment to land on Hugging Face for the backend and Vercel for the frontend.

</specifics>

<deferred>
## Deferred Ideas

- Frontend polish and running page enhancement move to Phase 2.
- Voice and AI enhancement beyond the backend webhook moves to Phase 3.
- Offline-first/PWA work remains a later phase.
- Deployment to Hugging Face and Vercel is reserved for the final deployment phase.

</deferred>

---

*Phase: 01-backend-foundation*
*Context gathered: 2026-04-12 via PRD Express Path*
