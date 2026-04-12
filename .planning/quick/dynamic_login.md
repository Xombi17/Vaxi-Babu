# Quick Task: Dynamic Login Page

## Objective
Make the login page dynamic by fetching real households from the database, falling back to demo ones if none exist.

## Plan
1. Update `Frontend/app/login/page.tsx` to fetch households from `/api/v1/households`.
2. Map the fetched households to the `families` display format.
3. Handle loading and empty states elegantly.
4. Keep the fallback to hardcoded demo accounts for easier testing.

## Files to Edit
- `Frontend/app/login/page.tsx`
