# Project 90

A 90-day challenge app where you build your own challenge from daily commitments and
choose how strict it is.

- **`mobile/`** — Expo (React Native + TypeScript) app. Fully local-first: all challenge
  data lives on the device via `zustand` + `AsyncStorage`. No backend.

## Concept

You build a **Challenge** from a set of daily **commitments** and pick a **miss rule**:

| Commitment type      | Example                                          |
| -------------------- | ----------------------------------------------- |
| `check`              | Workout (done / not done)                        |
| `check` + `allowNote`| Read 10 pages, with room to write about the book |
| `quantity`           | Water — 128 oz / 1 gallon (tap +/- or type an amount to add) |
| `duration`           | Meditate 10 minutes                              |
| `photo`              | Daily progress photo                             |
| `text`               | Journal entry                                    |

| Miss rule     | Behavior                                                        |
| ------------- | -------------------------------------------------------------- |
| `reset`       | Strict — if a day ends with anything unfinished, the app resets you to day 1 automatically |
| `grace`       | A fixed number of skip days are allowed                        |
| `streak-only` | Never resets; just tracks your consistency                     |

## Running it

```bash
cd mobile
npm install
npm run web            # or: npm run ios / npm run android
```
