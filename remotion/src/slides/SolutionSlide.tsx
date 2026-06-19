import React from "react";
import { useFadeUp, useStagger } from "../components/motion";
import { StatGrid } from "../components/StatGrid";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { BulletList, Card, SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

const ECON_STATS = [
  { value: "~$2.50", label: "TTS / ~10-min chapter", accent: true },
  { value: "~$0.04", label: "LLM draft pass" },
  { value: "~3 unlocks", label: "Break-even @ $0.99", success: true },
  { value: "~90%", label: "Lower vs studio", accent: true },
];

export const SolutionSlide: React.FC = () => {
  const content = useFadeUp(useStagger(0, 4));

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="04 · Solution">What Atelier Is & How It Works</SlideTitle>
      <SlideStack compact style={content}>
        <div style={{ display: "flex", gap: spacing.grid }}>
          <div style={{ flex: 1 }}>
            <Card title="Creator path">
              <BulletList
                compact
                items={[
                  "Draft — OpenAI + isolated agents",
                  "Narrate — Server-side ElevenLabs",
                  "Publish — /library story management",
                ]}
              />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card title="Reader path">
              <BulletList
                compact
                items={[
                  "Discover → Preview → Unlock",
                  "Consume — text + audio player",
                  "Monetize — per-chapter unlocks",
                ]}
              />
            </Card>
          </div>
        </div>
        <StatGrid stats={ECON_STATS} compact />
        <div style={{ display: "flex", gap: spacing.grid }}>
          <div style={{ flex: 1 }}>
            <Card title="Creative guardrails" accent>
              <BulletList
                compact
                items={[
                  "Per-thread agent isolation",
                  "Story-controls schema (genre, mood, tension)",
                  "Prior-chapter context injection",
                  "Quality retries + [Speaker] tags",
                ]}
              />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card title="Data sovereignty">
              <BulletList
                compact
                items={[
                  "PostgreSQL owns IP + unlock ledgers",
                  "Swappable OpenAI / ElevenLabs adapters",
                  "Provider change ≠ asset loss",
                ]}
              />
            </Card>
          </div>
        </div>
      </SlideStack>
    </SlideShell>
  );
};
