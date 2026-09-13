# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Project 90 conventions

- Fully local-first, no backend. All challenge/log data lives on the device via
  `zustand` + `persist` + `AsyncStorage`.
- One zustand store per domain in `src/store/`. Persisted stores set a `partialize`.
- Colors come from `src/constants/theme.ts` (`COLORS`). Dark theme only.
- Derived state (current day, streak, completion, failure) is computed in
  `src/utils/challenge.ts`, never stored.
