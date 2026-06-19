import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useFadeUp } from "../components/motion";
import { SlideShell } from "../components/SlideShell";
import { BulletList, Card, Flow, SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

const SCREENSHOTS = [
  { src: "screenshots/catalog.png", label: "Reader catalog" },
  { src: "screenshots/studio.png", label: "Creator studio" },
  { src: "screenshots/chapter.png", label: "Chapter audio" },
] as const;

const PILLARS = [
  {
    title: "AI studio",
    accent: true,
    items: ["OpenAI chat + agents", "Live manuscript", "Admin /studio"],
  },
  {
    title: "Owned catalog",
    items: ["Price per chapter", "Preview + unlock rules", "Public / + /store"],
  },
  {
    title: "Chapter audio",
    items: ["ElevenLabs in-player", "Lock-state UX", "Text + audio surface"],
  },
] as const;

export const DemoSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const header = useFadeUp(4);
  const pillars = useFadeUp(22);

  const segment = Math.floor((frame / durationInFrames) * SCREENSHOTS.length);
  const activeIndex = Math.min(SCREENSHOTS.length - 1, Math.max(0, segment));

  return (
    <SlideShell variant="dense">
      <div style={header}>
        <SlideTitle eyebrow="05 · Product">What We Shipped</SlideTitle>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
        }}
      >
        {SCREENSHOTS.map((shot, i) => {
          const isActive = i === activeIndex;
          return (
            <figure key={shot.src} style={{ margin: 0 }}>
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `2px solid ${isActive ? theme.gold : theme.border}`,
                  boxShadow: isActive ? `0 0 28px rgba(212,175,55,0.22)` : "none",
                }}
              >
                <Img
                  src={staticFile(shot.src)}
                  style={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    objectPosition: "top center",
                    display: "block",
                  }}
                />
              </div>
              <figcaption
                style={{
                  marginTop: 6,
                  textAlign: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: isActive ? theme.gold : theme.textMuted,
                }}
              >
                {i + 1} · {shot.label}
              </figcaption>
            </figure>
          );
        })}
      </div>
      <Flow steps={["Catalog", "Studio", "Listen + unlock"]} />
      <div
        style={{
          ...pillars,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: spacing.grid,
          marginTop: spacing.grid,
        }}
      >
        {PILLARS.map((pillar) => (
          <Card key={pillar.title} accent={pillar.accent}>
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 15,
                fontWeight: 700,
                color: theme.gold,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {pillar.title}
            </p>
            <BulletList compact items={[...pillar.items]} />
          </Card>
        ))}
      </div>
    </SlideShell>
  );
};
