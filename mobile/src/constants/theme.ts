// Dark, outdoor-adventure theme: near-black ground, one vivid green for progress
// and action, a warm gold reserved for milestones/achievements.
export const COLORS = {
  background: "#0A0B0D",
  card: "#16181C",
  surface: "#1E2126",
  border: "rgba(255,255,255,0.07)",
  chip: "#1B1E23",
  text: "#F5F6F7",
  textMuted: "#9BA1A8",
  textFaint: "#5C6167",

  accent: "#2ECC71",
  accentSoft: "#15301F",
  gold: "#E3B341",
  goldSoft: "#332A15",

  green: "#2ECC71",
  greenSoft: "#15301F",
  red: "#E5484D",
  redSoft: "#331A1B",
  yellow: "#E3B341",
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

/** Loaded via useFonts in App.tsx; falls back to the system font until ready. */
export const FONTS = {
  display: "Anton_400Regular",
} as const;
