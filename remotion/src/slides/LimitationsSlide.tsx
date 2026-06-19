import React from "react";
import { useFadeUp } from "../components/motion";
import { StatusBadge } from "../components/StatGrid";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { BulletList, Card, SlideTitle } from "../components/ui";
import { spacing } from "../theme";

export const LimitationsSlide: React.FC = () => {
  const content = useFadeUp(8);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="09 · Limitations">
        Phased Rollout & Risk Controls
      </SlideTitle>
      <SlideStack compact style={content}>
        <div style={{ display: "flex", gap: spacing.grid, width: "100%" }}>
          <div style={{ flex: 1 }}>
            <Card
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusBadge status="live">Live</StatusBadge>
                  Phase 1 — MVP delivered
                </span>
              }
            >
              <BulletList
                compact
                items={[
                  "Web · catalog · full studio pipeline",
                  "Stub checkout · TTS caps for cost control",
                  "Smoke tests on auth, catalog, studio, checkout",
                  "TCO + privacy inventory documented",
                ]}
              />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card
              accent
              title={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusBadge status="planned">Next</StatusBadge>
                  Phase 2–3 — no DB redesign
                </span>
              }
            >
              <BulletList
                compact
                items={[
                  "Stripe — verified unlock revenue",
                  "CI — API regression before launch",
                  "Mobile — React Native / Flutter, same REST",
                  "Decoupled day one — not retrofit",
                ]}
              />
            </Card>
          </div>
        </div>
        <Card title="Security & legal" success>
          <BulletList
            compact
            items={[
              "API keys server-side only (OpenAI, ElevenLabs)",
              "Privacy: docs/APP_PRIVACY_DATA_INVENTORY.md",
              "Auth.js deletion · operator content policy",
              "Version history: docs/CHANGELOG.md",
            ]}
          />
        </Card>
      </SlideStack>
    </SlideShell>
  );
};
