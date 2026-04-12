# Quick Task 260412-iaq: Fix regional language voice support - Deepgram multi mode + Azure voices

**Gathered:** 2026-04-12
**Status:** In Progress

## Task Boundary

Fix Vapi voice agent regional language support:
1. Change Deepgram transcriber to use "multi" language mode for auto-detection
2. Properly extract language_name from variables
3. Add Azure voices for Hindi (hi-IN-SwaraNeural) and Marathi (mr-IN-AarohiNeural)
4. Keep ElevenLabs as premium fallback

## Implementation

### Changes to Backend/app/api/v1/voice.py

1. **Lines 244-248**: Update transcriber config to use "multi" language mode
2. **After line ~196**: Add proper extraction of language_name from variables
3. **Lines 236-238**: Update target_lang_name to use language_name if available
4. **After line ~347**: Add Azure voice config for regional languages

### Verification

Run: `pytest tests/test_voice.py`