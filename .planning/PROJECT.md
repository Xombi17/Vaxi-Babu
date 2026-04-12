# WellSync AI — Project Context

**Last updated:** 2026-04-11 after initialization

## What This Is

Voice-first preventive healthcare memory platform for families. Helps households remember vaccinations, checkups, and preventive care actions for children. Uses voice as primary interaction, supports local languages, works offline-first.

**Core Value:** One trusted family health memory that reminds, explains, and guides preventive actions using simple voice interactions.

## Problem

- Families in low-literacy, low-access communities miss preventive healthcare (vaccinations, pregnancy checkups, child health milestones)
- Information is fragmented, records are hard to maintain
- Most digital health products assume literacy, navigation skills, and self-management
- Connectivity is often unstable

## Solution

Proactive, voice-first, family-centered memory system that:
- Reminds what is due
- Explains why it matters in simple language
- Guides users using voice interactions
- Supports local languages
- Works offline-first

## Target Users

- Parents and caregivers in low-literacy households
- Families with children needing vaccination tracking
- Multigenerational households where health memory is shared

## Key Constraints

- **Deterministic-first:** Never use LLM for health scheduling or medicine safety logic
- **No Prisma on backend:** Uses SQLModel (Python ORM) — Prisma is for frontend only
- **Voice-first:** Prioritize voice UX over text
- **Safe medical messaging:** Always default to "consult a doctor" when uncertain
- **No diagnosis:** Product is a memory assistant, not a medical device

## Technology

- **Frontend:** Next.js 16.2.3, TypeScript, Tailwind, ShadCN, Framer Motion, TanStack Query, React Hook Form, Zod, PWA with Dexie/IndexedDB
- **Backend:** FastAPI, Python 3.11+, SQLModel, asyncpg, Alembic
- **Database:** Neon serverless Postgres
- **AI:** Groq (llama-3.3-70b-versatile) for explanation/simplification only
- **Local AI:** Ollama with Gemma 4 + Llama 3.2 Vision for OCR
- **Voice:** Vapi AI for live voice agent orchestration
- **Auth:** Auth.js/NextAuth with Prisma adapter

## Existing Code

This is a brownfield project — substantial code already exists:

| Component | Status | Location |
|-----------|--------|----------|
| Backend API | Complete | `Backend/app/` |
| Database Models | Complete | `Backend/app/models/` |
| Health Schedule Engine | Complete | `Backend/app/services/health_schedule/` |
| AI Service | Complete | `Backend/app/services/ai_service.py` |
| OCR Service | Complete | `Backend/app/services/ocr_service.py` |
| Medicine Safety | Complete | `Backend/app/services/medicine_safety.py` |
| Frontend Skeleton | Started | `Frontend/src/app/` |
| Prisma Schema | Started | `Frontend/prisma/schema.prisma` |

## Requirements

### Validated

- ✓ Household CRUD (name, language, location)
- ✓ Dependent profiles (child/adult/elder/pregnant, DOB, sex, pregnancy fields)
- ✓ HealthEvent model (vaccination/checkup/vitamin/reminder)
- ✓ Deterministic NIS vaccination schedule from DOB
- ✓ Event status computation (upcoming/due/overdue/completed)
- ✓ Next due event priority query
- ✓ Groq AI for plain-language explanations
- ✓ Voice Q&A with health timeline context
- ✓ Medicine safety 4-tier classifier
- ✓ 3-tier OCR fallback (Ollama → Vision)
- ✓ Reminders CRUD

### Active

- [ ] Vapi webhook endpoint for live voice
- [ ] Alembic migration setup
- [ ] Full test suite (pytest)
- [ ] Next.js frontend integration
- [ ] Auth.js/NextAuth setup
- [ ] PWA offline-first implementation
- [ ] Multi-child household dashboard

### Out of Scope

- Medical diagnosis
- Emergency treatment guidance
- Autonomous medical decisions
- Uncontrolled LLM scheduling
- Admin panel (MVP)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLModel over Prisma (backend) | Stay within Python ecosystem | — Pending |
| Voice-first over text | Target users have low literacy | — Pending |
| Deterministic-first | Safety-critical health scheduling | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state