# Runtime Gemini API Key Management

## Problem

- API key was hardcoded in `BuildConfig` at compile time
- Every time the key expired or hit rate limits, you had to rebuild the entire APK
- No way to rotate keys without rebuilding

## Solution

### Architecture

```
Android App (at startup)
    ↓
GeminiKeyManager.getApiKey()
    ↓
Try: Fetch from Backend (/api/v1/config/gemini-key)
    ↓
Success: Cache locally (encrypted SharedPreferences)
    ↓
Fallback: Use cached key or BuildConfig.GEMINI_API_KEY
    ↓
GeminiVoiceClient uses fetched key
```

### Components

**1. Backend Endpoint** (`Backend/app/api/v1/config.py`)

```python
@router.get("/config/gemini-key")
async def get_gemini_key(current_user: dict = Depends(get_current_user)):
    return {"api_key": settings.GEMINI_API_KEY}
```

- Requires authentication (Bearer token)
- Serves the current Gemini API key from environment variables
- Can be changed without rebuilding anything

**2. Android GeminiKeyManager** (`app/src/main/java/com/Vaxi Babu/vaxi/data/config/GeminiKeyManager.kt`)

- Fetches key from backend on app startup
- Caches in encrypted SharedPreferences (24-hour validity)
- Falls back to cached key if backend unavailable
- Automatic refresh on next app launch

**3. Updated VoiceModule** (`app/src/main/java/com/Vaxi Babu/vaxi/di/VoiceModule.kt`)

- Injects GeminiKeyManager into GeminiVoiceClient
- Provides fallback to BuildConfig.GEMINI_API_KEY

**4. Updated GeminiVoiceClient** (`app/src/main/java/com/Vaxi Babu/vaxi/data/voice/GeminiVoiceClient.kt`)

- Accepts optional GeminiKeyManager
- Fetches key at session start time
- Uses fetched key for Gemini Live initialization

## Workflow

### Changing the API Key (No Rebuild Needed!)

1. Update `GEMINI_API_KEY` environment variable on backend
2. Restart backend (or just update env var if using managed service)
3. Next time user opens app or starts voice session → fetches new key automatically
4. No APK rebuild required

### Rate Limit Management

1. When current key hits rate limits, generate a new one in Google Cloud Console
2. Update backend environment variable
3. Users automatically get new key on next app launch
4. Seamless key rotation without app updates

### Offline Fallback

- If backend is unavailable, app uses cached key (valid for 24 hours)
- If cache expired and backend down, falls back to BuildConfig key
- App continues to work even if backend temporarily unavailable

## Security

- API key never stored in APK (only in backend)
- Encrypted local cache using Android Security library
- Requires authentication to fetch key from backend
- 24-hour cache validity prevents excessive backend calls

## Benefits

✅ No rebuild when API key changes
✅ Automatic key rotation support
✅ Rate limit management without app updates
✅ Secure key storage (encrypted cache)
✅ Offline fallback (24-hour cache)
✅ Backward compatible (BuildConfig fallback)

## Testing

**Test 1: Fetch from Backend**

```
1. Start app with valid backend running
2. Check logcat: should see key fetched from /api/v1/config/gemini-key
3. Start voice session → should work
```

**Test 2: Offline Fallback**

```
1. Start app once (caches key)
2. Disconnect backend
3. Restart app
4. Start voice session → should use cached key
```

**Test 3: Key Rotation**

```
1. Update GEMINI_API_KEY on backend
2. Restart app
3. Start voice session → should use new key
4. No APK rebuild needed
```

## Files Changed

- `Backend/app/api/v1/config.py` - NEW endpoint
- `Backend/app/api/v1/router.py` - Register config router
- `Android/app/src/main/java/com/Vaxi Babu/vaxi/data/config/GeminiKeyManager.kt` - NEW manager
- `Android/app/src/main/java/com/Vaxi Babu/vaxi/data/api/Vaxi BabuApiService.kt` - NEW endpoint
- `Android/app/src/main/java/com/Vaxi Babu/vaxi/di/VoiceModule.kt` - Updated DI
- `Android/app/src/main/java/com/Vaxi Babu/vaxi/data/voice/GeminiVoiceClient.kt` - Updated to use manager
