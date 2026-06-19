/** Shared rhythm — keep Marp CSS variables in sync */
export const spacing = {
  cellX: 24,
  cellY: 14,
  rowMin: 52,
  stack: 24,
  grid: 20,
} as const;

export const theme = {
  bg: "#0b0c0f",
  bgElevated: "#12141a",
  bgCard: "#181b24",
  gold: "#d4af37",
  goldDim: "rgba(212, 175, 55, 0.15)",
  goldGlow: "rgba(212, 175, 55, 0.35)",
  text: "#f4f1ea",
  textMuted: "#9aa0b4",
  border: "rgba(212, 175, 55, 0.18)",
  success: "#6ee7a0",
  successDim: "rgba(110, 231, 160, 0.12)",
  onAccent: "#0c0b09",
  accentBlue: "#9eb4ff",
  accentBlueDim: "rgba(100, 120, 200, 0.12)",
} as const;

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** Per-slide fallback durations (~5–6 min total with voiceover) */
export const SLIDE_DURATIONS = {
  title: 26,
  problem: 30,
  competitors: 34,
  audience: 30,
  solution: 34,
  demo: 48,
  differentiation: 32,
  tech: 34,
  results: 36,
  limitations: 34,
  roadmap: 28,
  sources: 26,
  closing: 20,
} as const;

export const secondsToFrames = (seconds: number) => Math.round(seconds * FPS);

export const TOTAL_DURATION_FRAMES = Object.values(SLIDE_DURATIONS).reduce(
  (sum, sec) => sum + secondsToFrames(sec),
  0,
);
