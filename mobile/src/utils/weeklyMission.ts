import type { Challenge, DayLog } from "../types";
import { commitmentMet, dateForDay } from "./challenge";

export interface MissionGoal {
  commitmentId: string;
  title: string;
  icon: string;
  count: number;
  target: number;
  achieved: boolean;
}

export interface WeeklyMission {
  week: number;
  startDay: number;
  endDay: number;
  goals: MissionGoal[];
  achievedCount: number;
  totalGoals: number;
  allAchieved: boolean;
}

const MISSION_TITLES = [
  "Get Locked In",
  "Stay The Course",
  "Push Through",
  "Build The Habit",
  "Keep Climbing",
  "Hold The Line",
  "Find Your Rhythm",
  "Own This Week",
  "No Off Days",
  "Raise The Bar",
];

export function missionTitleForWeek(week: number): string {
  return MISSION_TITLES[(week - 1) % MISSION_TITLES.length];
}

/** A rolling weekly goal, built from the challenge's own commitments: hit each one ~5 of 7 days this week. */
export function weeklyMission(
  challenge: Challenge,
  logs: Record<string, DayLog>,
  dayNumber: number
): WeeklyMission {
  const clampedDay = Math.min(Math.max(dayNumber, 1), challenge.totalDays);
  const week = Math.ceil(clampedDay / 7);
  const startDay = (week - 1) * 7 + 1;
  const endDay = Math.min(week * 7, challenge.totalDays);
  const daysInWeek = endDay - startDay + 1;
  const target = Math.max(1, Math.round(daysInWeek * 0.7));
  const elapsedEnd = Math.min(endDay, clampedDay);

  const goals: MissionGoal[] = challenge.commitments.map((c) => {
    let count = 0;
    for (let d = startDay; d <= elapsedEnd; d++) {
      const log = logs[dateForDay(challenge, d)];
      if (commitmentMet(c, log?.entries[c.id])) count++;
    }
    return {
      commitmentId: c.id,
      title: c.title,
      icon: c.icon,
      count,
      target,
      achieved: count >= target,
    };
  });

  const achievedCount = goals.filter((g) => g.achieved).length;

  return {
    week,
    startDay,
    endDay,
    goals,
    achievedCount,
    totalGoals: goals.length,
    allAchieved: goals.length > 0 && achievedCount === goals.length,
  };
}
