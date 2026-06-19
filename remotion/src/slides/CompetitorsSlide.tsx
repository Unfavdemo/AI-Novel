import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { Callout } from "../components/StatGrid";
import { SlideTable } from "../components/SlideTable";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

const rows: [string, string][] = [
  ["Pocket FM & serial apps", "Strong UX — client does not own production or catalog"],
  ["Wattpad · Vella · Radish", "Serial demand — no AI + TTS + owned workflow"],
  ["DIY toolchain", "5+ apps — slow, expensive, poor unlock UX"],
  ["AI writers alone", "Fast drafts — no catalog, audio, or monetization"],
];

export const CompetitorsSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="02 · Market">Competitive Landscape</SlideTitle>
      <SlideStack compact style={content}>
        <SlideTable
          headers={["Alternative", "Why it falls short for our client"]}
          rows={rows}
          fontSize={16}
          rowOpacity={(i) =>
            interpolate(frame, [6 + i * 4, 12 + i * 4], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <Callout accent>
          <strong>Market gap:</strong> No platform gives an indie operator owned
          production + owned catalog + AI + TTS + chapter unlocks in one stack.
        </Callout>
        <p
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 600,
            color: theme.text,
            lineHeight: 1.4,
          }}
        >
          Atelier — private studio → narrate → publish → unlock → listen, in one app
          the client controls.
        </p>
      </SlideStack>
    </SlideShell>
  );
};
