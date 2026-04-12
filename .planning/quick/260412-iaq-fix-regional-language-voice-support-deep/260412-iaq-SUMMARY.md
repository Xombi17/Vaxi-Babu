# Quick Task 260412-iaq: Fix regional language voice support

**Completed:** 2026-04-12

## Summary

Fixed Vapi voice agent regional language support for Hindi and Marathi:

### Changes Made

1. **Backend (voice.py)**:
   - Changed Deepgram transcriber language from explicit codes to `"multi"` for auto-detection
   - Added extraction of `language_name` from variables (e.g., "Hindi", "Marathi")
   - Added Azure voice configuration:
     - Hindi → `hi-IN-SwaraNeural`
     - Marathi → `mr-IN-AarohiNeural`
   - Kept ElevenLabs as premium fallback option

2. **Frontend (VoiceFAB.tsx)**:
   - Now passes `language_name` to backend via `variableValues`
   - Simplified assistant overrides (removed redundant transcriber config)

3. **Tests**:
   - Updated test assertion to match new firstMessage format

### Verification

- `uv run ruff check app/api/v1/voice.py` ✅ Pass
- `uv run pytest tests/test_voice.py` ✅ 6/6 tests pass
- `npm run lint` on VoiceFAB.tsx ✅ Pass (existing lint error in settings page unrelated)

### Next Steps for Testing

User needs to:
1. Ensure Vapi dashboard has Azure voices configured
2. Test Hindi: Select language → Confirm modal → Speak Hindi → Verify understanding + Azure voice
3. Test Marathi: Select language → Confirm modal → Speak Marathi → Verify understanding + Azure voice
4. If Azure fails, fallback to ElevenLabs premium mode