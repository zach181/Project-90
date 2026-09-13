import type { Challenge, Commitment, DayLog, EntryValue } from "../types";
import { daysBetween, isoPlusDays, todayISO } from "./date";

/** Day number for a given date (1-indexed). Day 1 == startDate. */
export function currentDayNumber(challenge: Challenge, today: string = todayISO()): number {
  return daysBetween(challenge.startDate, today) + 1;
}

export function dateForDay(challenge: Challenge, dayNumber: number): string {
  return isoPlusDays(challenge.startDate, dayNumber - 1);
}

export function commitmentMet(c: Commitment, v: EntryValue | undefined): boolean {
  if (!v) return false;
  switch (v.kind) {
    case "check":
      return v.done;
    case "quantity":
      return v.amount > 0 && v.amount >= (c.target ?? 1);
    case "duration":
      return v.minutes > 0 && v.minutes >= (c.targetMinutes ?? 1);
    case "photo":
      return v.uri.length > 0;
    case "text":
      return v.text.trim().length > 0;
    default:
      return false;
  }
}

export function commitmentProgress(c: Commitment, v: EntryValue | undefined): number {
  if (!v) return 0;
  if (v.kind === "quantity") return Math.min(1, v.amount / Math.max(1, c.target ?? 1));
  if (v.kind === "duration") return Math.min(1, v.minutes / Math.max(1, c.targetMinutes ?? 1));
  return commitmentMet(c, v) ? 1 : 0;
}

export function dayComplete(challenge: Challenge, log: DayLog | undefined): boolean {
  if (challenge.commitments.length === 0) return false;
  if (!log) return false;
  return challenge.commitments.every((c) => commitmentMet(c, log.entries[c.id]));
}

export interface PerCommitmentStat {
  id: string;
  title: string;
  icon: string;
  done: number;
  possible: number;
}

export interface ProgressSummary {
  dayNumber: number;
  totalDays: number;
  started: boolean;
  finished: boolean;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  /** past day numbers (before today) that were not completed */
  missedDays: number[];
  perCommitment: PerCommitmentStat[];
  failed: boolean;
  graceRemaining: number | null;
  /** completion status for every day 1..totalDays: "done" | "missed" | "today" | "future" */
  dayStates: Array<"done" | "missed" | "today" | "future">;
}

export function summarize(
  challenge: Challenge,
  logs: Record<string, DayLog>,
  today: string = todayISO()
): ProgressSummary {
  const total = challenge.totalDays;
  const dayNumber = currentDayNumber(challenge, today);
  const started = dayNumber >= 1;
  const finished = dayNumber > total;

  // Fully-elapsed days are strictly before today.
  const lastElapsed = Math.min(dayNumber - 1, total);
  const reachedToday = Math.min(Math.max(dayNumber, 0), total);

  const completed = new Set<number>();
  for (let d = 1; d <= reachedToday; d++) {
    if (dayComplete(challenge, logs[dateForDay(challenge, d)])) completed.add(d);
  }

  const missedDays: number[] = [];
  for (let d = 1; d <= lastElapsed; d++) {
    if (!completed.has(d)) missedDays.push(d);
  }

  // Current streak: walk back from today (if done) or yesterday.
  let anchor = completed.has(reachedToday) ? reachedToday : dayNumber - 1;
  let currentStreak = 0;
  for (let d = anchor; d >= 1; d--) {
    if (completed.has(d)) currentStreak++;
    else break;
  }

  let longestStreak = 0;
  let run = 0;
  for (let d = 1; d <= reachedToday; d++) {
    if (completed.has(d)) {
      run++;
      longestStreak = Math.max(longestStreak, run);
    } else {
      run = 0;
    }
  }

  const perCommitment: PerCommitmentStat[] = challenge.commitments.map((c) => {
    let done = 0;
    for (let d = 1; d <= reachedToday; d++) {
      if (commitmentMet(c, logs[dateForDay(challenge, d)]?.entries[c.id])) done++;
    }
    return { id: c.id, title: c.title, icon: c.icon, done, possible: reachedToday };
  });

  let failed = false;
  let graceRemaining: number | null = null;
  if (challenge.missRule === "reset") {
    failed = missedDays.length > 0;
  } else if (challenge.missRule === "grace") {
    graceRemaining = Math.max(0, challenge.graceDays - missedDays.length);
    failed = missedDays.length > challenge.graceDays;
  }

  const dayStates = Array.from({ length: total }, (_, i): "done" | "missed" | "today" | "future" => {
    const d = i + 1;
    if (completed.has(d)) return "done";
    if (d === dayNumber && !finished) return "today";
    if (d < dayNumber) return "missed";
    return "future";
  });

  return {
    dayNumber,
    totalDays: total,
    started,
    finished,
    completedDays: completed.size,
    currentStreak,
    longestStreak,
    missedDays,
    perCommitment,
    failed,
    graceRemaining,
    dayStates,
  };
}
