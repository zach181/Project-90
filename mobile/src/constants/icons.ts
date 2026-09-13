/** Emoji options offered in the commitment editor. */
export const COMMITMENT_ICONS = [
  "💪", "🏃", "🚴", "🏊", "🧘", "🥊", "🚶", "🌳",
  "💧", "🥗", "🍎", "🥩", "☕", "🚭", "🚫", "😴",
  "📖", "📝", "🧠", "📵", "💰", "🙏", "📸", "✅",
] as const;

export const DEFAULT_ICON_FOR_TYPE: Record<string, string> = {
  check: "✅",
  quantity: "💧",
  duration: "💪",
  photo: "📸",
  text: "📖",
};
