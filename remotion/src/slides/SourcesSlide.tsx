import React from "react";
import { useFadeUp } from "../components/motion";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { BulletList, Card, SlideTitle } from "../components/ui";
import { spacing } from "../theme";

const sourceItems = [
  "Next.js App Router — nextjs.org/docs",
  "PostgreSQL + Drizzle ORM — orm.drizzle.team",
  "OpenAI API — platform.openai.com/docs",
  "ElevenLabs — elevenlabs.io/docs",
  "Auth.js — authjs.dev",
];

const furtherItems = [
  "SOLUTION_DOCUMENTATION.md — Level 12 + rubric",
  "CCC_DELIVERABLE_REPORT.md — plan & test evidence",
  "CLIENT_PRICING_AND_TCO.md — per-chapter economics",
  "Q_AND_A_BRIEF.md — post-presentation Q&A",
  "CHANGELOG.md — version history",
];

export const SourcesSlide: React.FC = () => {
  const content = useFadeUp(8);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="11 · References">
        Citations & Further Investigation
      </SlideTitle>
      <SlideStack compact style={{ ...content, flex: 1, justifyContent: "center" }}>
        <div style={{ display: "flex", gap: spacing.grid, width: "100%" }}>
          <div style={{ flex: 1 }}>
            <Card title="Sources cited">
              <BulletList compact items={sourceItems} />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card title="Further investigation" accent>
              <BulletList compact items={furtherItems} />
            </Card>
          </div>
        </div>
      </SlideStack>
    </SlideShell>
  );
};
