import type { Challenge, DayLog } from "../types";
import { dateForDay } from "./challenge";

export interface WeightPoint {
  day: number;
  weight: number;
}

export const MIN_WEIGHT = 50;
export const MAX_WEIGHT = 700;

/** Parses "185", "185.5" or "185,5". Returns null for anything that isn't a plausible weight. */
export function parseWeight(text: string): number | null {
  const n = parseFloat(text.trim().replace(",", "."));
  if (!Number.isFinite(n) || n < MIN_WEIGHT || n > MAX_WEIGHT) return null;
  return Math.round(n * 10) / 10;
}

export function formatWeight(w: number): string {
  return Number.isInteger(w) ? `${w}` : w.toFixed(1);
}

/** Every day with a logged weight, in day order. */
export function weightSeries(challenge: Challenge, logs: Record<string, DayLog>): WeightPoint[] {
  const points: WeightPoint[] = [];
  for (let d = 1; d <= challenge.totalDays; d++) {
    const w = logs[dateForDay(challenge, d)]?.weight;
    if (typeof w === "number") points.push({ day: d, weight: w });
  }
  return points;
}
