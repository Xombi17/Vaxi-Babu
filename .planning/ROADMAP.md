# WellSync AI — Roadmap

**Last updated:** 2026-04-11 after initialization

## Overview

| Metric | Value |
|--------|-------|
| Phases | 5 |
| Requirements | 33 |
| v1 Coverage | 100% |

## Phase Summary

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Backend Foundation | Get the local backend stable, testable, and fully wired | HH-01 to HL-09 | 10 |
| 2 | Frontend Core | Build Next.js app with auth, household UI, and running-page polish | HH-01 to HL-09 | 9 |
| 3 | Voice & AI | Integrate Vapi voice, local voice testing, and AI explanations | VC-01 to EX-04, MS-01 to MS-06 | 9 |
| 4 | Offline PWA | Add offline-first capabilities and sync | OF-01 to OF-04 | 8 |
| 5 | Deployment & Launch | Deploy backend to Hugging Face and frontend to Vercel, then verify end-to-end | release/integration | 8 |

---

## Phase 1: Backend Foundation

**Goal:** Get the local backend running reliably, with migrations, tests, auth, and voice webhook wiring

**Plans:** 1

Plans:
- [ ] 01-01-PLAN.md — Stabilize backend startup, migrations, household/dependent/timeline contracts, and the local voice webhook path

**Requirements:**
- HH-01 through HH-04 (Household CRUD)
- DEP-01 through DEP-07 (Dependent profiles + timeline generation)
- HL-01 through HL-09 (Health timeline operations)

**Success Criteria:**
1. Local backend starts cleanly with validated environment variables
2. Alembic migrations run successfully and create all tables
3. Pytest suite covers all API endpoints with 80%+ coverage
4. Household and dependent creation works end-to-end in the backend
5. Vapi webhook endpoint (`/api/v1/voice/webhook`) handles incoming voice sessions locally
6. Health timeline generation works for any child DOB
7. Event status computation (upcoming/due/overdue/completed) is accurate
8. API returns proper error responses for invalid requests
9. Database session management handles concurrent requests
10. API documentation (OpenAPI) is accurate and complete

---

## Phase 2: Frontend Core

**Goal:** Build Next.js frontend with authentication, household management, timeline display, and a better running page

**Requirements:**
- HH-01 through HH-04 (household UI)
- DEP-01 through DEP-07 (dependent UI + timeline display)
- HL-01 through HL-09 (timeline UI)

**Success Criteria:**
1. Next.js app runs with TypeScript strict mode
2. User can create and manage households
3. User can add/edit/remove dependents
4. Health timeline displays correctly with status indicators
5. Next due action is prominently displayed
6. User can mark events as done
7. Prisma schema syncs with database
8. Basic authentication works (login/logout)
9. Mobile-responsive design works on 320px+ screens

---

## Phase 3: Voice & AI

**Goal:** Integrate Vapi voice agent, test it locally, and enhance AI explanations

**Requirements:**
- VC-01 through VC-05 (voice interaction)
- EX-01 through EX-04 (health explanations)
- MS-01 through MS-06 (medicine safety)
- RM-01 through RM-04 (reminders)

**Success Criteria:**
1. Vapi voice session connects and processes questions in local development
2. User can ask "What's due for my child?" via voice
3. System responds with voice in English or Hindi
4. Health explanations are simple and actionable
5. Medicine image upload works and returns safety info
6. Escalation works for high-risk medicine cases
7. Reminders can be viewed and managed via UI
8. Text fallback works when voice fails
9. Voice latency is under 3 seconds for simple queries

---

## Phase 4: Offline PWA

**Goal:** Add offline-first capabilities with local storage and sync

**Requirements:**
- OF-01 through OF-04 (offline support)

**Success Criteria:**
1. PWA manifest and service worker installed
2. App shell cached for offline access
3. Household and timeline data stored in IndexedDB via Dexie
4. User can view timeline offline
5. Updates queued when offline
6. Data syncs when connectivity restored
7. Sync conflicts handled gracefully
8. Offline indicator shown when disconnected

---

## Phase 5: Deployment & Launch

**Goal:** Deploy backend on Hugging Face and frontend on Vercel, then verify the full system works together

**Requirements:**
- release/integration for backend/frontend/voice handoff

**Success Criteria:**
1. Backend is deployed and reachable on Hugging Face
2. Frontend is deployed and reachable on Vercel
3. Frontend points to the deployed backend endpoints correctly
4. Voice agent webhook and API routes work against deployed services
5. Authentication, household flows, and timeline flows work end-to-end in production
6. Environment variables and secrets are configured correctly in both deployments
7. Smoke tests pass against the deployed stack
8. Deployment notes and rollback steps are documented

---

## Notes

- Phase 1 and 2 can run in parallel since they target different codebases (backend vs frontend)
- Phase 3 depends on Phase 2 (voice needs UI to initiate)
- Phase 4 depends on Phase 2 (offline needs data layer)
- Medicine safety feature (MS-01 to MS-06) exists in backend — needs frontend integration in Phase 3
- All medical content follows safety rules: never diagnose, always default to "consult doctor"