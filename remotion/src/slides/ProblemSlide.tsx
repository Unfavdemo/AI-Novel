import React from "react";
import { useFadeUp, useStagger } from "../components/motion";
import { StatGrid } from "../components/StatGrid";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { BulletList, Card, SlideTitle } from "../components/ui";
import { theme } from "../theme";

const STATS = [
  { value: "5+ apps", label: "Typical DIY toolchain" },
  { value: "$200+/hr", label: "Human studio narration", accent: true },
  { value: "3 steps", label: "Preview · unlock · listen" },
];

export const ProblemSlide: React.FC = () => {
  const content = useFadeUp(useStagger(0, 4));

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="01 · Problem">The Client&apos;s Challenge</SlideTitle>
      <SlideStack compact style={content}>
        <Card title="Problem statement" accent>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.45, color: theme.text }}>
            Independent creators who publish serialized audio fiction cannot move from
            draft manuscript to monetized, listenable chapters in one workflow—tools
            are fragmented and not built for serial unlock models.
          </p>
        </Card>
        <StatGrid stats={STATS} compact />
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ flex: 1 }}>
            <Card title="Pain points">
              <BulletList
                compact
                items={[
                  "Slow & expensive production across tools",
                  "Readers expect preview → unlock → continue",
                  "No owned stack for a private studio operator",
                  "Aggregators take margin + IP risk",
                ]}
              />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card title="What the client needs" accent>
              <BulletList
                compact
                items={[
                  "Exclusive private workspace (/studio)",
                  "Owned catalog with chapter sales",
                  "AI + TTS + payments in one app",
                  "Pocket-FM economics on owned infra",
                ]}
              />
            </Card>
          </div>
        </div>
      </SlideStack>
    </SlideShell>
  );
};
