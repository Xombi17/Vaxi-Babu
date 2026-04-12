# Quick Task: Regional Voice & ElevenLabs Premium Mode

Implement high-quality regional language support for Vapi with an optional ElevenLabs "Premium" mode.

## Implementation Steps

### Phase 1: Backend (Vapi Webhook)
1.  **Modify `Backend/app/api/v1/voice.py`**:
    *   Correct BCP-47 mapping for Marathi (`mr`) and Hindi (`hi`).
    *   Implement conditional `assistant-request` handling for `use_elevenlabs` variable.
    *   Set ElevenLabs voice overrides (`Multilingual v2`, Aria voice) when flag is active.

### Phase 2: Frontend (UI & Components)
1.  **Create `Frontend/components/LanguageConfirmationModal.tsx`**:
    *   Modal explaining the switch to "Premium" regional voice.
    *   Styled with WellSync's blue-gradient aesthetic.
2.  **Modify `Frontend/app/(app)/settings/page.tsx`**:
    *   Update `handleLanguageChange` to trigger the confirmation modal if regional language is selected.
    *   Persist `use_elevenlabs` state in `localStorage`.
3.  **Modify `Frontend/components/VoiceFAB.tsx`**:
    *   Read `use_elevenlabs` from storage.
    *   Pass flag to Vapi's `variableValues`.
    *   Add visual "Premium" indicator (sparkle icon/neon glow).

### Phase 3: Verification
1.  Manual end-to-end test of language switch and voice quality.
2.  Verify Vapi webhook response for correct override structure.
