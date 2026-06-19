import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { Callout } from "../components/StatGrid";
import { SlideTable } from "../components/SlideTable";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { SlideTitle } from "../components/ui";

const objectiveRows: [string, string, string][] = [
  ["End-to-end pipeline", "Met · MVP", "/ · /studio · /library · player"],
  ["LLM + TTS narration", "Met · MVP", "OpenAI + ElevenLabs routes"],
  ["Feedback + smoke tests", "Partial", "Walkthroughs + pnpm test:smoke"],
  ["Unit economics", "Met", "CLIENT_PRICING_AND_TCO.md"],
];

const feedbackRows: [string, string][] = [
  ["Locked chapters unclear", "Lock reason + value copy"],
  ["Session expiry at checkout", "Re-auth prompt + clear errors"],
  ["Publish state confusing", "Published vs Draft badges"],
  ["No regression safety", "Smoke suite on critical APIs"],
];

export const ResultsSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="08 · Effectiveness">
        Objectives, Evidence & Feedback
      </SlideTitle>
      <SlideStack compact style={content}>
        <SlideTable
          headers={["Objective", "Result", "Evidence"]}
          rows={objectiveRows}
          emphasis="center"
          fontSize={14}
          rowOpacity={(i) =>
            interpolate(frame, [4 + i * 3, 10 + i * 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <SlideTable
          headers={["Feedback", "Shipped fix"]}
          rows={feedbackRows}
          emphasis="right"
          fontSize={14}
          rowOpacity={(i) =>
            interpolate(frame, [18 + i * 3, 24 + i * 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <Callout>
          Validation: structured walkthroughs, client feedback loops, and automated
          smoke tests on auth, catalog, studio, and checkout paths.
        </Callout>
      </SlideStack>
    </SlideShell>
  );
};
