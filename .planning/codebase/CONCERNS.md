# Codebase Concerns

**Analysis Date:** 2026-04-12

Severity model used in this document:
- **Critical:** Active defect or security gap with immediate user/data impact
- **High:** High-likelihood delivery/reliability risk in near-term roadmap
- **Medium:** Important maintainability/scalability risk that can become high later

## Tech Debt

**[Critical] Voice webhook handler control-flow defect:**
- Issue: Tool-call execution block is unreachable due to indentation after `continue`; response assembly still references `result_text`, causing runtime failure.
- Files: `Backend/app/api/v1/voice.py`, `Backend/tests/test_voice.py`
- Impact: Voice tool calls can fail at runtime with 500 errors; core voice-first experience is not reliable.
- Fix approach: Move DB session/tool-call execution outside duplicate-call branch; add explicit initialization for `result_text`; keep idempotency logic isolated.

**[High] Monolithic medicine safety rulebase in source code:**
- Issue: Large hardcoded ruleset in a single Python module (`565` lines) mixes data and classification logic.
- Files: `Backend/app/services/medicine_safety.py`
- Impact: High change risk, difficult reviewability, and error-prone updates for safety content.
- Fix approach: Externalize rules into versioned JSON/YAML with schema validation and load-time integrity checks.

## Known Bugs

**[Critical] Vapi tool-call webhook throws `UnboundLocalError`:**
- Symptoms: `"result": result_text` fails when `result_text` is never assigned.
- Files: `Backend/app/api/v1/voice.py`
- Trigger: POST `/api/v1/voice/webhook` with event type `tool-calls`.
- Workaround: None in production path; bug currently reproducible by tests.
- Evidence: `pytest -q` fails in `Backend/tests/test_voice.py::TestVapiWebhook::test_tool_calls_returns_results` with traceback into `Backend/app/api/v1/voice.py`.

## Security Considerations

**[Critical] API authorization is not enforced on data routes:**
- Risk: Any caller can list/create/update/delete households and dependents.
- Files: `Backend/app/api/v1/households.py`, `Backend/app/api/v1/dependents.py`, `Backend/app/core/auth.py`
- Current mitigation: Login endpoint exists (`Backend/app/api/v1/auth.py`) and JWT helper exists (`Backend/app/core/auth.py`).
- Recommendations: Add `Depends(get_current_household)` to private routes and enforce household scoping in queries.
- Evidence: `get_current_household` symbol is only defined in `Backend/app/core/auth.py` and not referenced by route files.

**[High] Insecure default secrets and optional webhook verification:**
- Risk: Default JWT secret and empty webhook secret reduce trust boundaries in non-dev misconfiguration.
- Files: `Backend/app/core/config.py`
- Current mitigation: Signature check exists in `Backend/app/api/v1/voice.py`.
- Recommendations: Fail fast on startup in non-dev if `secret_key` is default or `vapi_webhook_secret` is empty.

**[High] Offline sync endpoint can replay privileged mutations without auth guard:**
- Risk: `/sync/batch` accepts client-specified mutation list and replays internal API requests.
- Files: `Backend/app/api/v1/sync.py`, `Backend/app/schemas/sync.py`
- Current mitigation: Endpoint prefix allowlist (`/api/v1/`).
- Recommendations: Require authenticated household context and enforce per-mutation ownership checks.

## Performance Bottlenecks

**[High] Sync replays each mutation as an internal HTTP call:**
- Problem: N queued operations produce N HTTP requests inside one API call.
- Files: `Backend/app/api/v1/sync.py`
- Cause: `httpx.AsyncClient` request loop per mutation.
- Improvement path: Route to service-layer functions directly in-process and batch DB writes where possible.

**[Medium] Voice webhook in-memory caches are process-local and bounded only by periodic cleanup:**
- Problem: Rate-limit/idempotency state is not shared across instances and can grow under burst traffic.
- Files: `Backend/app/api/v1/voice.py`
- Cause: Global dict caches (`_processed_calls`, `_rate_limit_cache`).
- Improvement path: Move to Redis or database-backed store with TTL.

## Fragile Areas

**[High] Voice webhook orchestration path:**
- Files: `Backend/app/api/v1/voice.py`, `Backend/tests/test_voice.py`
- Why fragile: Mixed concerns (signature validation, rate-limit, idempotency, DB fetch, memory recording) in one endpoint.
- Safe modification: Split into pure helpers for parse/guard/dispatch/persist and add focused unit tests for each stage.
- Test coverage: Existing tests did not prevent runtime control-flow bug.

**[Medium] Frontend route structure split across two app roots:**
- Files: `Frontend/app/`, `Frontend/src/app/`
- Why fragile: Confusing ownership and possible dead routes/components, increasing onboarding and change risk.
- Safe modification: Consolidate on one App Router root and archive/remove stale path tree.
- Test coverage: No frontend tests detected.

## Scaling Limits

**[Medium] Voice dedup/rate-limit mechanism scales only per-process:**
- Current capacity: Effective only inside a single running API process.
- Limit: Multi-instance deployments can process duplicates and bypass rate limits.
- Scaling path: Use shared low-latency store (Redis) for idempotency/rate limiting keys.

## Dependencies at Risk

**[High] Frontend framework version drift:**
- Risk: Documented stack and lint tooling are out of sync with runtime package versions.
- Impact: Build/lint inconsistencies and ambiguous upgrade path.
- Files: `PRD.md`, `Frontend/package.json`
- Migration plan: Align all Next.js-related packages to a single supported major/minor and update lockfile/docs together.

## Missing Critical Features

**[High] Frontend automated testing is absent:**
- Problem: No unit/integration tests in frontend app.
- Blocks: Safe UI refactors and reliable release confidence.
- Files: `Frontend/package.json`, `Frontend/app/`, `Frontend/src/app/`

**[High] Authentication integration incomplete across API + frontend:**
- Problem: Backend login exists but core resources are not protected, and frontend demo login hardcodes local assumptions.
- Blocks: Multi-tenant data safety and production readiness.
- Files: `Backend/app/api/v1/auth.py`, `Backend/app/api/v1/households.py`, `Backend/app/api/v1/dependents.py`, `Frontend/src/app/login/page.tsx`

## Test Coverage Gaps

**[High] Authorization and ownership checks untested:**
- What's not tested: Route-level auth enforcement and household data isolation.
- Files: `Backend/app/api/v1/households.py`, `Backend/app/api/v1/dependents.py`, `Backend/tests/`
- Risk: Silent data exposure regressions.
- Priority: High

**[High] Frontend behavior and API contract tests missing:**
- What's not tested: API client assumptions, route behavior, and auth/session flow.
- Files: `Frontend/lib/api.ts`, `Frontend/src/app/login/page.tsx`, `Frontend/package.json`
- Risk: Contract drift and runtime failures found late.
- Priority: High

## Product-Delivery Blockers

1. **Critical:** Voice tool-call path currently fails a backend test and can break voice demo reliability (`Backend/app/api/v1/voice.py`, `Backend/tests/test_voice.py`).
2. **High:** Unprotected household/dependent endpoints prevent safe real-user deployment (`Backend/app/api/v1/households.py`, `Backend/app/api/v1/dependents.py`).
3. **High:** Frontend/backend contract drift and split route trees increase integration churn (`Frontend/lib/api.ts`, `Frontend/src/app/login/page.tsx`, `Frontend/app/`, `Frontend/src/app/`).
4. **High:** Documentation and stack drift creates setup errors and wrong operational assumptions (`Backend/README.md`, `Frontend/README.md`, `README.md`).

## Inconsistent Architecture Decisions

- **Backend AI/OCR provider docs vs code mismatch:** code uses GitHub Models/OpenAI-compatible endpoint (`Backend/app/services/ai_service.py`, `Backend/app/services/ocr_service.py`) while docs still describe Groq/Ollama flows (`Backend/README.md`, `README.md`).
- **Frontend stack/version mismatch with PRD:** PRD targets Next.js 16.2.3 while `Frontend/package.json` currently resolves Next.js 15.x and mixed Next-related package versions.
- **Dual frontend app roots:** simultaneous use of `Frontend/app/` and `Frontend/src/app/` indicates unresolved structure decision.

## Mitigation Backlog (Short)

1. Fix webhook control flow and add regression test for non-duplicate tool-call execution path (`Backend/app/api/v1/voice.py`, `Backend/tests/test_voice.py`).
2. Enforce JWT auth + household scoping on all private routes (`Backend/app/api/v1/*.py`, `Backend/app/core/auth.py`).
3. Harden production config validation for secrets/webhook verification (`Backend/app/core/config.py`).
4. Replace sync internal HTTP replay with service-layer dispatch and ownership validation (`Backend/app/api/v1/sync.py`).
5. Consolidate frontend route root and align API base/auth assumptions (`Frontend/app/`, `Frontend/src/app/`, `Frontend/lib/api.ts`).
6. Refresh all READMEs to match implemented stack and setup commands (`README.md`, `Backend/README.md`, `Frontend/README.md`).
7. Add minimum frontend test harness (unit + smoke integration) and backend auth integration tests (`Frontend/package.json`, `Backend/tests/`).

---

*Concerns audit: 2026-04-12*