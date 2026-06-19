import React from "react";
import { Composition } from "remotion";
import {
  PresentationVideo,
  SlidePreview,
  presentationDurationInFrames,
} from "./PresentationVideo";
import { getSlideTimeline, FPS } from "./slideTimeline";
import { HEIGHT, WIDTH, secondsToFrames } from "./theme";

export const RemotionRoot: React.FC = () => {
  const timeline = getSlideTimeline();

  return (
    <>
      <Composition
        id="PresentationVideo"
        component={PresentationVideo}
        durationInFrames={presentationDurationInFrames}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{}}
      />
      <Composition
        id="TitleSlide"
        component={SlidePreview}
        durationInFrames={timeline[0]?.durationInFrames ?? secondsToFrames(30)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ slideIndex: 0 }}
      />
      <Composition
        id="DemoSlide"
        component={SlidePreview}
        durationInFrames={timeline[3]?.durationInFrames ?? secondsToFrames(100)}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ slideIndex: 3 }}
      />
    </>
  );
};
