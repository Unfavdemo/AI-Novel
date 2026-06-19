import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { StatGrid } from "../components/StatGrid";
import { SlideShell } from "../components/SlideShell";
import { Chip } from "../components/ui";
import { fontSerif } from "../fonts";
import { spacing, theme } from "../theme";

const HERO_STATS = [
  { value: "~90%", label: "Lower prod. cost vs studio", accent: true },
  { value: "$0.99–1.49", label: "Per-chapter unlock" },
  { value: "1 stack", label: "Draft → audio → sell" },
  { value: "100%", label: "Client-owned catalog", success: true },
];

export const TitleSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const titleScale = interpolate(titleProgress, [0, 1], [0.92, 1]);
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  const chips = ["AI Studio", "Reader Catalog", "Chapter Audio", "Next.js"];

  return (
    <SlideShell variant="lead">
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        <h1
          style={{
            fontFamily: fontSerif,
            fontSize: 110,
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.05,
            background: `linear-gradient(135deg, ${theme.text} 30%, ${theme.gold} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          Atelier
        </h1>
        <p
          style={{
            fontSize: 30,
            color: theme.textMuted,
            maxWidth: 720,
            marginTop: 16,
            lineHeight: 1.4,
            opacity: interpolate(frame, [18, 38], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Serialized audiobooks — read and listen chapter by chapter
        </p>
        <div
          style={{
            display: "flex",
            gap: 14,
            marginTop: 36,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {chips.map((label, i) => {
            const chipOpacity = interpolate(
              frame,
              [28 + i * 6, 42 + i * 6],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            return (
              <div key={label} style={{ opacity: chipOpacity }}>
                <Chip gold={i === 0}>{label}</Chip>
              </div>
            );
          })}
        </div>
        <div
          style={{
            width: "100%",
            maxWidth: 1100,
            marginTop: spacing.stack,
            opacity: interpolate(frame, [48, 68], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <StatGrid stats={HERO_STATS} compact />
        </div>
        <p
          style={{
            marginTop: 28,
            fontSize: 16,
            color: theme.textMuted,
            fontStyle: "italic",
            opacity: interpolate(frame, [60, 80], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Level 12 solution documentation · commissioned for an independent studio
          operator
        </p>
      </AbsoluteFill>
    </SlideShell>
  );
};
