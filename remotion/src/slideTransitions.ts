import type { TransitionTiming } from "@remotion/transitions";
import { linearTiming, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { SlideId } from "./narration";
import { FPS } from "./theme";

const spring = (durationInFrames: number): TransitionTiming =>
  springTiming({
    config: { damping: 200, stiffness: 120 },
    durationInFrames,
  });

const linear = (durationInFrames: number): TransitionTiming =>
  linearTiming({ durationInFrames });

/** Transition played after each slide (before the next one). */
export function getTransitionAfter(slideId: SlideId) {
  switch (slideId) {
    case "title":
      return { presentation: fade(), timing: linear(20) };
    case "solution":
      return { presentation: fade(), timing: linear(18) };
    case "demo":
      return {
        presentation: wipe({ direction: "from-bottom" }),
        timing: spring(30),
      };
    case "limitations":
      return { presentation: fade(), timing: linear(18) };
    case "sources":
      return { presentation: fade(), timing: linear(16) };
    case "competitors":
      return { presentation: fade(), timing: linear(18) };
    case "results":
      return { presentation: fade(), timing: linear(20) };
    case "roadmap":
      return { presentation: fade(), timing: linear(18) };
    default:
      return {
        presentation: slide({ direction: "from-right" }),
        timing: spring(26),
      };
  }
}

export function getTransitionDurationInFrames(slideId: SlideId): number {
  return getTransitionAfter(slideId).timing.getDurationInFrames({ fps: FPS });
}

export function getTotalTransitionFrames(slideIds: SlideId[]): number {
  if (slideIds.length <= 1) {
    return 0;
  }

  return slideIds
    .slice(0, -1)
    .reduce((sum, id) => sum + getTransitionDurationInFrames(id), 0);
}
