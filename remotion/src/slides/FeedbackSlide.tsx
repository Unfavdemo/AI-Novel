import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { SlideTable } from "../components/SlideTable";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { SlideTitle } from "../components/ui";
import { theme } from "../theme";

const objectiveRows: [string, string, string][] = [
  ["End-to-end creator → reader pipeline", "Met (MVP)", "Catalog, studio, library, player"],
  ["LLM authoring + TTS narration", "Met (MVP)", "OpenAI + ElevenLabs server routes"],
  ["Feedback + automated validation", "Partial", "Walkthroughs + pnpm test:smoke"],
];

const feedbackRows: [string, string][] = [
  ["Locked chapters unclear", "Lock reason + value copy"],
  ["Session expiry during unlock", "Re-auth prompt + clear errors"],
  ["Publish state confusing", "Published vs Draft badges"],
];

export const FeedbackSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);
  const footer = useFadeUp(52);

  return (
    <SlideShell>
      <SlideTitle eyebrow="06 · Effectiveness">
        Objectives, Feedback & Results
      </SlideTitle>
      <SlideStack style={content}>
        <SlideTable
          headers={["Objective", "Result", "Evidence"]}
          rows={objectiveRows}
          emphasis="center"
          fontSize={20}
          rowOpacity={(i) =>
            interpolate(frame, [12 + i * 6, 22 + i * 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <SlideTable
          headers={["Feedback", "Shipped fix"]}
          rows={feedbackRows}
          emphasis="right"
          fontSize={20}
          rowOpacity={(i) =>
            interpolate(frame, [30 + i * 6, 40 + i * 6], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <p
          style={{
            ...footer,
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            color: theme.text,
            lineHeight: 1.4,
          }}
        >
          MVP objectives met for catalog, studio, AI/TTS pipeline, and unlock UX —
          supported by documented feedback iterations and smoke tests.
        </p>
      </SlideStack>
    </SlideShell>
  );
};
