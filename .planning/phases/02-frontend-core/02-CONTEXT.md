Phase 2 — Frontend Core Context
================================

Purpose
-------
Implement the core user-facing flows and polish required for Phase 2.

References
----------
- PRD.md — product requirements (canonical)
- .planning/STATE.md — current project state (Phase 1 complete)
- .planning/phases/01-backend-foundation/01-01-PLAN.md — backend decisions and API contract

Key Decisions
-------------
- Frontend framework: Next.js 16 (TypeScript)
- Deploy target: Vercel (production)
- Auth: NextAuth or custom client using JWT tokens from backend `/api/v1/login`
- API base: `NEXT_PUBLIC_API_URL` → points to deployed backend (dev: http://localhost:8000)
- UX priorities: Household & dependent creation, timeline overview, scanner flow, voice entry point

Constraints
-----------
- Backend API (Phase 1) is the canonical source of endpoints and auth flows. Follow the OpenAPI contract.
- Deterministic-first: LLMs are used only for explanation; do not rely on models for correctness-critical logic.
