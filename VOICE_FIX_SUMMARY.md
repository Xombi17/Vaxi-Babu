# Voice Assistant Fix Summary - April 12, 2026

## ✅ Issues Fixed

### 1. Frontend - `sessionPromise is not defined` Error
**File**: `Frontend/hooks/use-live-api.ts:423`
- Changed `await sessionPromise` to `sessionRef.current = aiSession`
- Removed duplicate `onclose` and `onerror` handlers
- Fixed microphone audio sending (removed incorrect `isConnected` check)
- Added AudioContext resume for browser autoplay policies
- Added debug logging for audio playback

### 2. Frontend - Build Errors
- **lib/gemini-voice.ts**: Fixed React immutability with `globalStateRef.current` pattern
- **app/(app)/settings/page.tsx**: Fixed setState in effect by using initializer function
- **app/login/page.tsx**: Fixed HTML entity (`Don&apos;t`)
- **components/EmptyState.tsx**: Fixed TypeScript type guards

### 3. Backend - Vapi Webhook Timeout (20s)
**File**: `Backend/app/api/v1/voice.py`

**Root Cause**: Vapi IS reaching your backend, but it times out after 20 seconds waiting for response.

**Fixes Applied**:
- Added error handling to `_get_dependents_for_household`
- Added performance logging (duration_ms) to track slow queries
- Added webhook response time logging

## 🔍 Diagnosis from Vapi Team

The Emily/David hallucination is NOT because Vapi can't reach localhost. The call logs show:

```
Your server rejected tool-calls webhook. Error: timeout of 20000ms exceeded
```

This means:
1. ✅ Vapi successfully reached your backend URL
2. ❌ Your backend didn't respond within 20 seconds
3. 🤖 LLM hallucinated names (Emily/David) because tool call failed

## 🎯 Next Steps to Fix Vapi Timeout

### Option 1: Increase Vapi Timeout (Quick Fix)
Update your Vapi assistant configuration:
```json
{
  "server": {
    "timeoutSeconds": 45  // Increased from 20 to handle cold starts
  }
}
```

### Option 2: Optimize Backend Performance (Recommended)

**A. Check Database Connection**
```bash
cd Backend
# Check if database is slow
python -c "
import asyncio
from app.core.database import get_session
from app.models.dependent import Dependent
from sqlmodel import select
import time

async def test():
    start = time.time()
    async for session in get_session():
        result = await session.execute(select(Dependent).limit(1))
        print(f'Query took: {(time.time() - start) * 1000:.0f}ms')
        break

asyncio.run(test())
"
```

**B. Add Database Indexes**
```sql
-- Add index on household_id for faster dependent lookups
CREATE INDEX IF NOT EXISTS idx_dependents_household_id ON dependents(household_id);
CREATE INDEX IF NOT EXISTS idx_health_events_dependent_id ON health_events(dependent_id);
```

**C. Add Caching (if needed)**
```python
# In voice.py, add simple in-memory cache
_dependents_cache: dict[str, tuple[float, str]] = {}
CACHE_TTL = 60.0  # 1 minute

async def _get_dependents_for_household(household_id: str, session) -> str:
    # Check cache first
    if household_id in _dependents_cache:
        cached_time, cached_result = _dependents_cache[household_id]
        if time.time() - cached_time < CACHE_TTL:
            log.info("dependents_cache_hit", household_id=household_id)
            return cached_result

    # ... existing code ...
    result = json.dumps({"dependents": children})
    _dependents_cache[household_id] = (time.time(), result)
    return result
```

**D. Keep Backend Warm (if deployed to Render/Railway)**
```bash
# Add a cron job to ping your backend every 5 minutes
# This prevents cold starts
curl https://your-backend-url.com/health
```

### Option 3: Add "No Hallucination" Rule to Vapi Assistant

Add to system prompt:
```
CRITICAL: If a tool call fails or times out, you MUST say "I'm having trouble accessing the database right now" and NEVER invent or guess information about children, names, or health data.
```

## 🧪 Testing Checklist

### Gemini Voice (Regional Languages)
- [ ] Start voice call in Marathi
- [ ] Check browser console for:
  - "AudioContext initialized, state: running"
  - "Gemini message received:"
  - "Playing audio chunk, length:"
  - "Audio scheduled to play at:"
- [ ] Verify you can hear Gemini speaking
- [ ] Ask "What is my child's name?" (should return real name)
- [ ] Ask "What vaccines are due?" (should call tool)

### Vapi Voice (English)
- [ ] Check backend logs for webhook timing:
  ```bash
  cd Backend
  tail -f logs/app.log | grep "webhook_response_time"
  ```
- [ ] Start voice call in English
- [ ] Verify it fetches real children (not Emily/David)
- [ ] Check backend logs show `tool_call_completed` under 5000ms
- [ ] If still timing out, increase Vapi timeout to 45s

## 📊 Performance Monitoring

After deploying fixes, monitor these metrics:

```bash
# Backend logs will now show:
# - tool_call_completed: duration_ms=XXX
# - webhook_response_time: duration_ms=XXX
# - dependents_fetched: count=X

# Watch for slow queries:
cd Backend
tail -f logs/app.log | grep "duration_ms"
```

**Target Performance**:
- `get_household_dependents`: < 500ms
- `get_timeline_summary`: < 1000ms
- Total webhook response: < 5000ms

## 🚀 Deployment Notes

If your backend is deployed (Render/Railway/etc):
1. Push these changes
2. Monitor first few Vapi calls
3. Check logs for `webhook_response_time`
4. If still > 15s, increase Vapi timeout to 45s
5. Add database indexes if queries are slow
6. Consider adding caching for frequently accessed data

## 📝 Environment Check

Verify these are set:
```env
# Frontend/.env
NEXT_PUBLIC_GEMINI_API_KEY=REMOVED_GOOGLE_GEMINI_KEY
NEXT_PUBLIC_VAPI_PUBLIC_KEY=REMOVED_VAPI_PUBLIC_KEY
NEXT_PUBLIC_VAPI_ASSISTANT_ID=REMOVED_VAPI_ASSISTANT_ID
NEXT_PUBLIC_API_URL=http://localhost:8080  # or your deployed URL

# Backend/.env
DATABASE_URL=postgresql://...  # Your Supabase connection
```

## 🎉 Expected Behavior After Fixes

### Gemini (Regional Languages)
- ✅ Session connects
- ✅ Audio plays in browser
- ✅ Fetches real household data
- ✅ Calls tools automatically
- ✅ Speaks in Marathi/Hindi/etc

### Vapi (English)
- ✅ Connects to your backend
- ✅ Fetches real children names (not Emily/David)
- ✅ Responds within 20s (or 45s with increased timeout)
- ✅ Uses real vaccination data
- ✅ Records conversations

---

**Last Updated**: April 12, 2026 14:36 UTC
**Status**: Fixes applied, ready for testing
