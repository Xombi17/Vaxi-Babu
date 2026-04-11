# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Runner (backend):**
- Pytest is configured as the active backend test runner in `Backend/pyproject.toml` (`[tool.pytest.ini_options]`).
- Async behavior is enabled via `asyncio_mode = "auto"`.
- Test root is configured as `testpaths = ["tests"]`.

**Supporting test libraries:**
- `pytest-asyncio` is listed in dev dependencies (`Backend/pyproject.toml`).
- FastAPI `TestClient` is used for API/webhook endpoint tests (`Backend/tests/test_voice.py`).
- `unittest.mock` (`patch`, `AsyncMock`) is used for isolation of external behavior in `Backend/tests/test_voice.py`.

**Frontend test framework:**
- Not detected in current frontend package scripts/config (`Frontend/package.json`).
- No `vitest`, `jest`, `playwright`, or frontend `*.test.*` / `*.spec.*` files were detected in repository source paths during this mapping pass.

## Run Commands (Observed In Repo Docs/Scripts)

```bash
cd Backend && pytest tests/ -v         # Backend tests (Backend/README.md)
cd Backend && ruff check .             # Lint before tests (AGENTS.md)
cd Backend && ruff check . --fix       # Lint + auto-fix (AGENTS.md)
```

Notes:
- `AGENTS.md` sets the intended validation order as `ruff check .` then `pytest tests/`.
- Frontend scripts currently expose `dev`, `build`, `start`, `lint`, and `clean`, but no test command (`Frontend/package.json`).

## Test Inventory (Current State)

**Backend test modules:**
- `Backend/tests/test_health_schedule.py`
- `Backend/tests/test_medicine_safety.py`
- `Backend/tests/test_voice.py`

**Inventory summary:**
- Deterministic schedule generation and status logic: covered in `Backend/tests/test_health_schedule.py`.
- Deterministic medicine safety classifier bucketing and confidence behavior: covered in `Backend/tests/test_medicine_safety.py`.
- Voice webhook request handling, signature bypass in test, and tool-call response shape: covered in `Backend/tests/test_voice.py`.

**Frontend tests:**
- No frontend unit/integration/e2e tests are currently present in project source directories.

## Test File Organization

**Location pattern:**
- Backend uses centralized test directory: `Backend/tests/`.
- Test files follow `test_*.py` naming.

**Suite/class pattern:**
- Class-grouped suites with `Test*` classes and focused test methods.
- Fixtures are local to module and used for readability in schedule tests (`newborn_dob`, `toddler_dob` in `Backend/tests/test_health_schedule.py`).

## Test Design Patterns

**Unit-first deterministic testing:**
- Pure function behavior is asserted without DB/network dependencies in schedule and medicine tests.
- Example patterns:
  - Value invariants (`events sorted`, `no duplicate keys`) in `Backend/tests/test_health_schedule.py`.
  - Category classification assertions in `Backend/tests/test_medicine_safety.py`.

**API behavior testing with lightweight mocking:**
- Endpoint tests use `TestClient` and patch internal helpers to isolate webhook branches (`Backend/tests/test_voice.py`).
- Response-shape assertions check contract-level fields (`results`, `assistant.firstMessage`).

**Error/edge-case assertions:**
- Negative path testing exists for unknown units and unknown medicine names (`Backend/tests/test_health_schedule.py`, `Backend/tests/test_medicine_safety.py`).

## Coverage Indications

- No coverage tool config (`coverage.py`, pytest-cov config, or dedicated coverage scripts) is detected in backend or frontend manifests.
- No coverage threshold policy is committed.
- Current evidence supports functional spot coverage on core deterministic backend logic, but not quantified line/branch coverage.

## Quality Gaps

**Gap 1: Frontend test absence (high risk)**
- No unit/component tests for `Frontend/components/*` and no API-client contract tests for `Frontend/lib/api.ts`.
- No automated checks for critical voice UX module `Frontend/components/VoiceFAB.tsx`.

**Gap 2: Backend API route breadth (medium-high risk)**
- Existing tests do not comprehensively exercise all API routers under `Backend/app/api/v1/`.
- CRUD routes (`households`, `dependents`, `timeline` patch flows) lack direct endpoint test files.

**Gap 3: Data-layer integration testing (medium risk)**
- No DB integration tests validating SQLModel persistence, relations, and migration assumptions.
- Routes depend on async DB sessions, but many tests remain unit-style and bypass full DB lifecycle.

**Gap 4: Security/regression scenarios in voice webhook (medium risk)**
- `Backend/tests/test_voice.py` verifies happy-path webhook branches, but rate-limit/idempotency/signature edge cases are only lightly exercised.

**Gap 5: Tooling drift risk in docs vs implementation (medium risk)**
- Backend README references older AI/OCR stack details, while `AGENTS.md` states newer stack direction.
- Drift can cause wrong assumptions in future test planning.

## Recommended Priorities

1. Add frontend test baseline with Vitest + React Testing Library for `Frontend/components/*` and `Frontend/lib/api.ts`.
2. Add backend API integration tests for `households`, `dependents`, and `timeline` endpoints using isolated test DB sessions.
3. Add webhook security behavior tests for signature validation, idempotency replay, and rate-limit rejections in `Backend/app/api/v1/voice.py`.
4. Add coverage reporting (`pytest --cov`) and set an initial backend threshold to prevent silent regressions.
5. Add at least one end-to-end smoke flow (voice-less fallback path + timeline display) once frontend tests are bootstrapped.

## Prescriptive Test Guidance For New Work

- For deterministic health or medicine logic, continue writing pure unit tests first.
- For every new API route, add one success and one failure-path integration test.
- Keep tests independent of external AI service calls; mock at service boundaries.
- Introduce frontend component tests before adding further interactive UI complexity.

---

*Testing analysis: 2026-04-12*