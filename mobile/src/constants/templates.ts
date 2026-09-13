import type { NewChallengeInput } from "../types";

export interface ChallengeTemplate {
  key: string;
  title: string;
  blurb: string;
  input: NewChallengeInput;
}

const WATER = {
  title: "Water (1 gallon)",
  icon: "💧",
  type: "quantity" as const,
  target: 128,
  unit: "oz",
  step: 16,
};

const READ = {
  title: "Read 10 pages",
  icon: "📖",
  type: "check" as const,
  allowNote: true,
  hint: "Notes on the book (optional)",
};

const PHOTO = { title: "Progress photo", icon: "📸", type: "photo" as const };

export const TEMPLATES: ChallengeTemplate[] = [
  {
    key: "all-in",
    title: "All In",
    blurb: "The full commitment. Two workouts, a gallon of water, reading, a daily photo, clean eating. Miss a day and you restart at day 1.",
    input: {
      name: "All In",
      totalDays: 90,
      missRule: "reset",
      commitments: [
        { title: "Workout (30 min)", icon: "💪", type: "check" },
        { title: "Second workout, outdoors (30 min)", icon: "🌳", type: "check" },
        WATER,
        READ,
        PHOTO,
        { title: "Stick to the diet", icon: "🥗", type: "check" },
        { title: "No alcohol / no cheat meals", icon: "🚫", type: "check" },
      ],
    },
  },
  {
    key: "flexible",
    title: "Flexible",
    blurb: "The core habits with room to be human — six grace days across the whole challenge.",
    input: {
      name: "Flexible 90",
      totalDays: 90,
      missRule: "grace",
      graceDays: 6,
      commitments: [
        { title: "Workout", icon: "💪", type: "check" },
        WATER,
        READ,
        PHOTO,
      ],
    },
  },
  {
    key: "custom",
    title: "Build your own",
    blurb: "Start from a blank slate. Consistency-only scoring — it never resets.",
    input: {
      name: "My 90",
      totalDays: 90,
      missRule: "streak-only",
      commitments: [WATER, PHOTO],
    },
  },
];
