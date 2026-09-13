# Project 90

A 90-day challenge app where you build your own challenge from daily commitments and
choose how strict it is.

- **`mobile/`** — Expo (React Native + TypeScript) app. Local-first: your challenge,
  logs, and profile live on the device via `zustand` + `AsyncStorage`.
- **`server/`** — a small Express backend that powers **Groups**: a lightweight
  account (display name only, no password), a 6-character join code, and everyone
  in the group seeing each other's current day and streak.

## Concept

You build a **Challenge** from a set of daily **commitments** and pick a **miss rule**:

| Commitment type       | Example                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `check`                | Workout (done / not done)                                       |
| `check` + `allowNote`  | Read 10 pages, with room to write about the book                |
| `quantity`             | Water — 128 oz / 1 gallon (tap +/- or type an amount to add)    |
| `duration`             | Meditate 10 minutes                                              |
| `photo`                | Daily progress photo                                             |
| `text`                 | Journal entry                                                    |

| Miss rule     | Behavior                                                                                    |
| ------------- | -------------------------------------------------------------------------------------------- |
| `reset`       | Strict — if a day ends with anything unfinished, the app resets you to day 1 automatically   |
| `grace`       | A fixed number of skip days are allowed before it resets                                      |
| `streak-only` | Never resets; just tracks your consistency                                                    |

## Screens

- **Today** — your commitments for the day, a photo-backed hero card, this week's
  rolling mission (hit each commitment ~5 of 7 days)
- **Progress** — streak/completion ring, a 90-day grid, achievements (real SVG
  hexagon badges, computed from your streak/day data)
- **Photos** — every progress photo you've logged, by day
- **Groups** — create or join a group by code; see everyone's day/streak
- **Challenge** — edit commitments, miss rule, restart or delete

Finishing all 90 days shows a recap screen with final stats and a native share sheet.

## Running it

```bash
# Groups backend
cd server
npm install
npm start          # http://localhost:3001

# Mobile app (separate terminal)
cd mobile
npm install
npm run web         # or: npm run ios / npm run android
```

If you test on a physical device or want Groups to work with people on other
networks, update `API_BASE_URL` in `mobile/src/constants/api.ts` to point at a
deployed copy of `server/` (e.g. on Render) instead of `localhost`.
