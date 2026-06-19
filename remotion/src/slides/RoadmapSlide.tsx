import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { SlideTable } from "../components/SlideTable";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { Card, Chip, SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

const phaseRows: [string, string][] = [
  ["Phase 1 (now)", "Web MVP · studio pipeline · stub checkout · unit economics"],
  ["Phase 2", "Stripe revenue · expanded CI · production hardening"],
  ["Phase 3", "Native mobile on existing REST API — no schema migration"],
];

export const RoadmapSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);
  const chips = ["Stripe", "Mobile", "Owned catalog", "Same API"];

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="10 · Roadmap">Post-MVP Scaling Strategy</SlideTitle>
      <SlideStack compact style={content}>
        <SlideTable
          headers={["Phase", "Deliverable"]}
          rows={phaseRows}
          fontSize={16}
          emphasis="left"
          rowOpacity={(i) =>
            interpolate(frame, [8 + i * 5, 14 + i * 5], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
        <Card title="Strategic position">
          <p style={{ fontSize: 16, color: theme.textMuted, margin: 0, lineHeight: 1.45 }}>
            Pocket-FM economics without aggregator lock-in — TCO, privacy inventory,
            and solution docs in docs/
          </p>
        </Card>
      </SlideStack>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: spacing.grid,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {chips.map((label, i) => {
          const opacity = interpolate(
            frame,
            [20 + i * 5, 30 + i * 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div key={label} style={{ opacity }}>
              <Chip gold={label === "Stripe"}>{label}</Chip>
            </div>
          );
        })}
      </div>
    </SlideShell>
  );
};
