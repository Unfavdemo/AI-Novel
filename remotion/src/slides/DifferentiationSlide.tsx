import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { Callout } from "../components/StatGrid";
import { SlideTable } from "../components/SlideTable";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { SlideTitle } from "../components/ui";

const rows: [string, string][] = [
  ["Private studio — not marketplace", "Client controls IP, voice, release cadence"],
  ["Write + narrate + sell in one app", "~90% lower marginal cost vs studio"],
  ["Serial unlock on owned infra", "Pocket-FM UX without aggregator tax"],
  ["Owned PostgreSQL IP layer", "Manuscripts, unlock ledgers — no lock-in"],
  ["Swappable AI providers", "Core assets stay in client database"],
  ["API-first web MVP", "Same REST API for mobile clients"],
];

export const DifferentiationSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="06 · Differentiation">Why Atelier Wins</SlideTitle>
      <SlideStack compact style={content}>
        <SlideTable
          headers={["Atelier advantage", "Product benefit"]}
          rows={rows}
          fontSize={15}
          emphasis="left"
          rowOpacity={(i) =>
            interpolate(frame, [6 + i * 3, 12 + i * 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <Callout>
          <strong>Bottom line:</strong> Pocket-FM listener UX + indie-studio economics +
          zero aggregator lock-in — on infrastructure the client owns.
        </Callout>
      </SlideStack>
    </SlideShell>
  );
};
