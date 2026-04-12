# GSD Quick Task: Removing Hardcoded Voice Assistant Content

- **Status**: 🏗️ In Progress
- **Created**: 2026-04-11
- **Task**: Eliminate demo names (Olivia/Jackson) and ensure dynamic data from DB is used.

## 📋 Checklist
- [x] Implement robust variable extraction in `voice.py`
- [x] Add explicit "No Demo Content" rule to system prompt
- [x] Verify `household_id` transmission from frontend
- [x] Add fallback context if database returns empty (to avoid "Jackson" defaults)
- [x] Update frontend to log exactly what's being sent

## 📝 Activity Log
- **2026-04-11**: Started quick task. Identified that Vapi is likely failing to reach the local backend or using cached dashboard prompts.
