import { PRESENTER_SCRIPT } from "./presenter-script";

export const SLIDE_IDS = [
  "title",
  "problem",
  "competitors",
  "audience",
  "solution",
  "demo",
  "differentiation",
  "tech",
  "results",
  "limitations",
  "roadmap",
  "sources",
  "closing",
] as const;

export type SlideId = (typeof SLIDE_IDS)[number];

export type NarrationSegment = {
  id: SlideId;
  file: string;
  text: string;
};

const AUDIO_FILES: Record<SlideId, string> = {
  title: "voiceover/01-title.mp3",
  problem: "voiceover/02-problem.mp3",
  competitors: "voiceover/03-competitors.mp3",
  audience: "voiceover/04-audience.mp3",
  solution: "voiceover/05-solution.mp3",
  demo: "voiceover/06-demo.mp3",
  differentiation: "voiceover/07-differentiation.mp3",
  tech: "voiceover/08-tech.mp3",
  results: "voiceover/09-results.mp3",
  limitations: "voiceover/10-limitations.mp3",
  roadmap: "voiceover/11-roadmap.mp3",
  sources: "voiceover/12-sources.mp3",
  closing: "voiceover/13-closing.mp3",
};

/** Presenter narration per slide — edit presenter-script.ts, then regenerate voiceover. */
export const NARRATION_SEGMENTS: NarrationSegment[] = SLIDE_IDS.map((id) => ({
  id,
  file: AUDIO_FILES[id],
  text: PRESENTER_SCRIPT[id],
}));
