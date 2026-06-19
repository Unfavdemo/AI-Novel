import type React from "react";
import { SLIDE_IDS, type SlideId } from "./narration";
import { AudienceSlide } from "./slides/AudienceSlide";
import { ClosingSlide } from "./slides/ClosingSlide";
import { CompetitorsSlide } from "./slides/CompetitorsSlide";
import { DemoSlide } from "./slides/DemoSlide";
import { DifferentiationSlide } from "./slides/DifferentiationSlide";
import { LimitationsSlide } from "./slides/LimitationsSlide";
import { ProblemSlide } from "./slides/ProblemSlide";
import { ResultsSlide } from "./slides/ResultsSlide";
import { RoadmapSlide } from "./slides/RoadmapSlide";
import { SolutionSlide } from "./slides/SolutionSlide";
import { SourcesSlide } from "./slides/SourcesSlide";
import { TechSlide } from "./slides/TechSlide";
import { TitleSlide } from "./slides/TitleSlide";
import { getTotalTransitionFrames } from "./slideTransitions";
import { FPS, SLIDE_DURATIONS, secondsToFrames } from "./theme";
import manifest from "./voiceover-manifest.json";

export type VoiceoverManifest = {
  enabled: boolean;
  voiceId: string;
  model: string;
  generatedAt: string | null;
  segments: {
    id: SlideId;
    file: string;
    durationSeconds: number;
    padSeconds: number;
  }[];
};

const SLIDE_COMPONENTS: Record<SlideId, React.FC> = {
  title: TitleSlide,
  problem: ProblemSlide,
  competitors: CompetitorsSlide,
  audience: AudienceSlide,
  solution: SolutionSlide,
  demo: DemoSlide,
  differentiation: DifferentiationSlide,
  tech: TechSlide,
  results: ResultsSlide,
  limitations: LimitationsSlide,
  roadmap: RoadmapSlide,
  sources: SourcesSlide,
  closing: ClosingSlide,
};

export type SlideTimelineEntry = {
  id: SlideId;
  component: React.FC;
  durationInFrames: number;
  audioFile?: string;
};

const typedManifest = manifest as VoiceoverManifest;

function fallbackTimeline(): SlideTimelineEntry[] {
  return SLIDE_IDS.map((id) => ({
    id,
    component: SLIDE_COMPONENTS[id],
    durationInFrames: secondsToFrames(SLIDE_DURATIONS[id]),
  }));
}

export function getSlideTimeline(): SlideTimelineEntry[] {
  if (!typedManifest.enabled || typedManifest.segments.length === 0) {
    return fallbackTimeline();
  }

  const byId = new Map(typedManifest.segments.map((s) => [s.id, s]));

  return SLIDE_IDS.map((id) => {
    const segment = byId.get(id);
    const durationSeconds = segment
      ? segment.durationSeconds + segment.padSeconds
      : SLIDE_DURATIONS[id];

    return {
      id,
      component: SLIDE_COMPONENTS[id],
      durationInFrames: secondsToFrames(durationSeconds),
      audioFile: segment?.file,
    };
  });
}

export function getPresentationDurationInFrames(): number {
  const timeline = getSlideTimeline();
  const slideFrames = timeline.reduce((sum, s) => sum + s.durationInFrames, 0);
  const transitionFrames = getTotalTransitionFrames(timeline.map((s) => s.id));
  return slideFrames - transitionFrames;
}

export function isVoiceoverEnabled(): boolean {
  return typedManifest.enabled && typedManifest.segments.length > 0;
}

export { FPS, secondsToFrames } from "./theme";
