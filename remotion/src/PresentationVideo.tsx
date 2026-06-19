import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import type { TransitionPresentation } from "@remotion/transitions";
import { TransitionSeries } from "@remotion/transitions";
import { getTransitionAfter } from "./slideTransitions";
import {
  getPresentationDurationInFrames,
  getSlideTimeline,
} from "./slideTimeline";
import { theme } from "./theme";

export const PresentationVideo: React.FC = () => {
  const timeline = getSlideTimeline();

  return (
    <AbsoluteFill style={{ background: theme.bg }}>
      <TransitionSeries>
        {timeline.map(({ id, component: Component, durationInFrames, audioFile }, index) => {
          const isLast = index === timeline.length - 1;
          const transition = getTransitionAfter(id);

          return (
            <React.Fragment key={id}>
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <Component />
                {audioFile ? (
                  <Audio src={staticFile(audioFile)} volume={0.98} />
                ) : null}
              </TransitionSeries.Sequence>
              {!isLast ? (
                <TransitionSeries.Transition
                  presentation={
                    transition.presentation as TransitionPresentation<Record<string, unknown>>
                  }
                  timing={transition.timing}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};

/** Standalone slide preview composition helper */
export const SlidePreview: React.FC<{ slideIndex: number }> = ({ slideIndex }) => {
  const timeline = getSlideTimeline();
  const entry = timeline[slideIndex];
  if (!entry) return null;
  const Component = entry.component;
  return (
    <>
      <Component />
      {entry.audioFile ? (
        <Audio src={staticFile(entry.audioFile)} volume={0.98} />
      ) : null}
    </>
  );
};

export const presentationDurationInFrames = getPresentationDurationInFrames();

export { FPS } from "./slideTimeline";
