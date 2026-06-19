import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { StatGrid } from "../components/StatGrid";
import { SlideShell } from "../components/SlideShell";
import { Card, Chip, SlideTitle } from "../components/ui";
import { fontSerif } from "../fonts";
import { spacing, theme } from "../theme";

const CLOSE_STATS = [
  { value: "Owned IP", label: "Catalog in PostgreSQL", accent: true },
  { value: "Phased scale", label: "Stripe → CI → mobile", success: true },
];

export const ClosingSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);
  const chips = ["Unit economics", "Creative guardrails", "No lock-in", "API-first"];

  return (
    <SlideShell variant="closing">
      <SlideTitle eyebrow="12 · Close">Summary</SlideTitle>
      <div style={content}>
        <StatGrid stats={CLOSE_STATS} compact />
        <Card title="Success check" accent style={{ marginTop: spacing.grid }}>
          <p style={{ fontSize: 18, color: theme.text, margin: 0, lineHeight: 1.45 }}>
            Client-owned ecosystem with documented economics, serial-memory guardrails,
            data sovereignty, and a defined post-MVP scaling path.
          </p>
        </Card>
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: spacing.stack,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {chips.map((label, i) => {
          const opacity = interpolate(
            frame,
            [18 + i * 5, 28 + i * 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <div key={label} style={{ opacity }}>
              <Chip gold={label === "Unit economics"}>{label}</Chip>
            </div>
          );
        })}
      </div>
      <p
        style={{
          marginTop: spacing.stack,
          textAlign: "center",
          fontFamily: fontSerif,
          fontSize: 34,
          fontWeight: 600,
          color: theme.gold,
          opacity: interpolate(frame, [32, 48], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Questions?
      </p>
    </SlideShell>
  );
};
