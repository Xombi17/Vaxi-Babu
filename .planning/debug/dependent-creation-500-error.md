---
status: resolved
trigger: "dependent-creation-500-error"
created: 2026-04-11T00:00:00Z
updated: 2026-04-11T00:00:00Z
---

## ROOT CAUSE FOUND

**Root Cause:** Synchronous SQLModel API (`.exec()`) used on async `AsyncSession` - the async version requires `.execute()` instead

**Evidence Summary:**
- Found `.exec()` used in 3 files on AsyncSession
- engine.py line 60, 107: Used in health schedule generation
- dependents.py line 45: Used in list_dependents
- households.py line 30: Used in list_households
- AsyncSession from sqlmodel.ext.asyncio.session only has `.execute()`, not `.exec()`

**Files Involved:**
- `app/services/health_schedule/engine.py`: Lines 60, 107 - `.exec()` → `.execute()`
- `app/api/v1/dependents.py`: Line 45 - `.exec()` → `.execute()`
- `app/api/v1/households.py`: Line 30 - `.exec()` → `.execute()`

**Fix Applied:** Changed all `.exec()` calls to `.execute()` to match AsyncSession API

**Verification:**
- All 35 pytests pass
- ruff check passes

## CHECKPOINT REACHED

**Type:** human-verify
**Progress:** 3 files fixed, 35 tests pass, 0 linter errors

### Checkpoint Details

**Need verification:** Confirm the API now successfully creates a dependent

**Self-verified checks:**
- pytest: 35/35 tests pass
- ruff: All checks pass
- Code: Changed 3 `.exec()` → `.execute()` calls across 3 files

**How to check:**
1. Start backend: `uvicorn app.main:app --reload`
2. Create a household first (if none exists)
3. POST to `/api/v1/dependents` with valid dependent data
4. Should return 201 with dependent object (not 500)

**Tell me:** "confirmed fixed" OR describe any error you see

## Resolution

root_cause: ""
fix: ""
verification: ""
files_changed: []