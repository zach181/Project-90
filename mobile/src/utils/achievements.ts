import type { Challenge, DayLog } from "../types";
import { dateForDay } from "./challenge";
import type { ProgressSummary } from "./challenge";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  gold: boolean;
  unlocked: boolean;
}

function countPhotos(challenge: Challenge, logs: Record<string, DayLog>): number {
  const photoCommitmentIds = challenge.commitments.filter((c) => c.type === "photo").map((c) => c.id);
  if (photoCommitmentIds.length === 0) return 0;
  let count = 0;
  for (let d = 1; d <= challenge.totalDays; d++) {
    const log = logs[dateForDay(challenge, d)];
    if (!log) continue;
    if (photoCommitmentIds.some((id) => log.entries[id]?.kind === "photo")) count++;
  }
  return count;
}

export function computeAchievements(
  challenge: Challenge,
  logs: Record<string, DayLog>,
  summary: ProgressSummary
): Achievement[] {
  const photos = countPhotos(challenge, logs);
  const reachedDay = Math.min(summary.dayNumber, summary.totalDays);

  return [
    {
      id: "first-week",
      title: "First Week",
      description: "7 days complete",
      icon: "🗓️",
      gold: false,
      unlocked: summary.completedDays >= 7,
    },
    {
      id: "perfect-week",
      title: "Perfect Week",
      description: "A 7-day streak",
      icon: "✅",
      gold: false,
      unlocked: summary.longestStreak >= 7,
    },
    {
      id: "locked-in",
      title: "Locked In",
      description: "10 days fully completed",
      icon: "🎯",
      gold: false,
      unlocked: summary.completedDays >= 10,
    },
    {
      id: "photo-log",
      title: "Photo Log",
      description: "10 progress photos",
      icon: "📸",
      gold: false,
      unlocked: photos >= 10,
    },
    {
      id: "30-strong",
      title: "30 Strong",
      description: "A 30-day streak",
      icon: "🔥",
      gold: false,
      unlocked: summary.longestStreak >= 30,
    },
    {
      id: "halfway",
      title: "Halfway There",
      description: `Reach day ${Math.ceil(challenge.totalDays / 2)}`,
      icon: "⛰️",
      gold: false,
      unlocked: reachedDay >= Math.ceil(challenge.totalDays / 2),
    },
    {
      id: "consistent",
      title: "Consistent",
      description: "50%+ completion after 2 weeks",
      icon: "📈",
      gold: false,
      unlocked: reachedDay >= 14 && summary.completedDays / reachedDay >= 0.5,
    },
    {
      id: "project-complete",
      title: "Project Complete",
      description: `Finish all ${challenge.totalDays} days`,
      icon: "👑",
      gold: true,
      unlocked: summary.finished,
    },
  ];
}
