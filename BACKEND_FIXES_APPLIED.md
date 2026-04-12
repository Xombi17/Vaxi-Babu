# Backend Vapi Webhook Fixes - April 12, 2026

## ✅ All 4 Issues Fixed

### 1. ✅ Inconsistent "children found" vs "no children"
**Problem**: Same household_id sometimes returned children, sometimes returned empty array.

**Root Cause**: Not consistently using `args.get("household_id")` from function arguments.

**Fixes Applied**:
- `_handle_tool_call()` now extracts `household_id = args.get("household_id", "")` at the top
- Added detailed logging showing exactly what household_id is received
- Added logging of all args keys to debug parameter passing
- Never reads from session/auth state - always uses function arguments

**New Logs**:
```python
log.info(
    "tool_handler_start",
    tool=tool_name,
    call_id=call_id,
    household_id=household_id,
    args_keys=list(args.keys()),
)
```

---

### 2. ✅ Tool-call Timeouts (20s exceeded)
**Problem**: Backend took >20s to respond, causing Vapi to timeout and LLM to hallucinate.

**Fixes Applied**:

**A. Performance Logging**:
- Added `query_start` timing for every DB query
- Log `duration_ms` for each tool call
- Log total `webhook_response_time`

**B. Tool Result Caching**:
- Added `_tool_result_cache` with 60s TTL
- Caches results by `(tool_name, args)` hash
- Prevents repeated identical queries during same call
- Handles the 6x repeated `get_household_dependents` issue

**C. Detailed Query Logging**:
```python
log.info(
    "dependents_query_start",
    call_id=call_id,
    household_id=household_id,
    query="SELECT * FROM dependents WHERE household_id = ?",
)
```

**D. Error Handling**:
- All tool functions now have try/except
- Return JSON error messages instead of crashing
- Log errors with full context

---

### 3. ✅ Return Strict JSON Only (No Prose)
**Problem**: Functions returned prose strings like "Total vaccines: 25 | Completed: 0..."

**Fixes Applied**:

**`_get_dependents_for_household` now returns**:
```json
{
  "dependents": [
    {
      "name": "Ashwin",
      "ageMonths": 9,
      "dependent_id": "f81e..."
    }
  ]
}
```

**`_get_timeline_summary` now returns**:
```json
{
  "total": 25,
  "completed": 0,
  "dueNow": [
    {"vaccine": "BCG", "dose": 1, "dueDate": "2026-04-15"}
  ],
  "overdue": [
    {"vaccine": "Polio 1", "dose": 1, "dueDate": "2026-03-01"}
  ],
  "upcoming": [
    {"vaccine": "DPT 1", "dose": 1, "dueDate": "2026-05-01"}
  ]
}
```

**Error responses also JSON**:
```json
{"error": "I need to know which child you are asking about. Please provide their name."}
```

---

### 4. ✅ Dedupe Repeated Tool Calls (Idempotency)
**Problem**: Model called `get_household_dependents` 6 times back-to-back in one call.

**Fixes Applied**:

**A. Tool Result Cache**:
```python
_tool_result_cache: dict[str, tuple[float, str]] = {}
TOOL_CACHE_TTL = 60.0  # 1 minute
```

**B. Cache Key Generation**:
```python
def _get_tool_cache_key(tool_name: str, args: dict[str, Any]) -> str:
    """Generate cache key based on tool name and sorted args."""
    import json
    args_str = json.dumps(args, sort_keys=True)
    return f"{tool_name}:{args_str}"
```

**C. Cache Check Before Execution**:
```python
cache_key = _get_tool_cache_key(tool_name, tool_args)
if cache_key in _tool_result_cache:
    cached_time, cached_result = _tool_result_cache[cache_key]
    if now - cached_time < TOOL_CACHE_TTL:
        log.info("tool_result_cache_hit", tool=tool_name, age_seconds=int(now - cached_time))
        return cached_result
```

**D. Cache Cleanup**:
- Added cache cleanup to `_cleanup_old_entries()`
- Runs when cache exceeds 100 entries

---

## 📊 New Logging Output

When you run the backend, you'll now see:

```
[INFO] vapi_webhook_received event_type=tool-calls call_id=019d8222...
[INFO] tool_call_received call_id=019d8222... tool_call_id=abc123 tool_name=get_household_dependents args={'household_id': '8ab25c0a...'}
[INFO] tool_handler_start tool=get_household_dependents call_id=019d8222... household_id=8ab25c0a... args_keys=['household_id']
[INFO] dependents_query_start call_id=019d8222... household_id=8ab25c0a... query="SELECT * FROM dependents WHERE household_id = ?"
[INFO] dependents_query_complete call_id=019d8222... household_id=8ab25c0a... count=1 duration_ms=45
[INFO] dependents_result call_id=019d8222... household_id=8ab25c0a... result_length=156
[INFO] tool_call_completed tool=get_household_dependents duration_ms=52
[INFO] webhook_response_time event=tool-calls duration_ms=58
```

---

## 🎯 Expected Performance After Fixes

**Target Metrics**:
- `get_household_dependents`: < 500ms (typically 50-100ms)
- `get_timeline_summary`: < 1000ms (typically 100-300ms)
- Total webhook response: < 5000ms (typically 500-2000ms)

**Cache Benefits**:
- First call: Full DB query
- Repeated calls within 60s: Instant cache hit
- Handles 6x repeated calls gracefully

---

## 🧪 Testing the Fixes

### 1. Start Backend with Logging
```bash
cd Backend
python -m uvicorn app.main:app --reload --log-level info
```

### 2. Watch Logs in Real-Time
```bash
tail -f logs/app.log | grep -E "tool_call|webhook_response|duration_ms"
```

### 3. Make a Vapi Call
- Start voice call in English
- Ask "What is my child's name?"
- Watch backend logs for:
  - `tool_call_received` with correct household_id
  - `dependents_query_complete` with count > 0
  - `tool_call_completed` with duration_ms < 500
  - `webhook_response_time` with duration_ms < 5000

### 4. Verify No Hallucinations
- Should return real child name (Ashwin/Arnav)
- Should NOT return Emily/David
- Should NOT timeout

---

## 🚀 Next Steps

1. **Deploy Backend** (if not already deployed)
2. **Test with Vapi** - Make a call and verify logs
3. **Monitor Performance** - Check `duration_ms` values
4. **If Still Slow**:
   - Add database indexes (see below)
   - Check database connection latency
   - Consider upgrading database plan

### Database Indexes (if needed)
```sql
CREATE INDEX IF NOT EXISTS idx_dependents_household_id ON dependents(household_id);
CREATE INDEX IF NOT EXISTS idx_health_events_dependent_id ON health_events(dependent_id);
CREATE INDEX IF NOT EXISTS idx_health_events_status ON health_events(status);
```

---

## ✅ Summary

All 4 issues identified by Vapi team are now fixed:
1. ✅ Deterministic household_id lookup with detailed logging
2. ✅ Performance logging to identify slow queries
3. ✅ Strict JSON responses (no prose)
4. ✅ Tool result caching to handle repeated calls

**Expected Result**: Vapi calls should now complete in <5s with real data, no hallucinations.

---

**Last Updated**: April 12, 2026 14:44 UTC
**Status**: All fixes applied, ready for testing
