import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const useFadeUp = (delay = 0, distance = 28) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 18, stiffness: 120, mass: 0.7 },
  });

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(progress, [0, 1], [distance, 0]);

  return { opacity, transform: `translateY(${translateY}px)` };
};

export const useFadeIn = (delay = 0, duration = 15) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
  return { opacity };
};

export const useStagger = (index: number, baseDelay = 8, step = 6) =>
  baseDelay + index * step;
