import type { Commitment } from "../types";

/** One-tap additions offered on the Challenge screen. Optional — nothing here is a default. */
export const SUGGESTED_COMMITMENTS: Array<Omit<Commitment, "id">> = [
  { title: "Meditate 10 minutes", icon: "🧘", type: "check" },
  { title: "7+ hours of sleep", icon: "😴", type: "check" },
  { title: "10,000 steps", icon: "🚶", type: "check" },
  { title: "No added sugar", icon: "🍬", type: "check" },
  { title: "Cold shower", icon: "🚿", type: "check" },
  { title: "Stretch / mobility", icon: "🤸", type: "check" },
  { title: "No social media", icon: "📵", type: "check" },
  { title: "Journal", icon: "📝", type: "text", hint: "Today's entry" },
];
