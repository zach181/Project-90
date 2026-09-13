# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Project 90 conventions

- Local-first. Challenge/log/profile data lives on the device via `zustand` +
  `persist` + `AsyncStorage`. The only backend call-out is `../server`, which
  powers Groups (accounts, join codes, member stats) — everything else works
  fully offline.
- One zustand store per domain in `src/store/`. Persisted stores set a `partialize`.
- Colors come from `src/constants/theme.ts` (`COLORS`). Dark theme only, with a
  bundled mountain-photo hero background (`components/HeroBackground.tsx`) and
  Anton (`constants/theme.ts` → `FONTS.display`) for big numbers.
- Derived state (current day, streak, completion, failure) is computed in
  `src/utils/challenge.ts`, never stored. Achievements and weekly missions are
  likewise computed on the fly (`utils/achievements.ts`, `utils/weeklyMission.ts`).
