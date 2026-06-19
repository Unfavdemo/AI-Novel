import React from "react";
import { useFadeUp } from "../components/motion";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { BulletList, Card, SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

export const StatusSlide: React.FC = () => {
  const row1 = useFadeUp(8);
  const row2 = useFadeUp(24);
  const footer = useFadeUp(40);

  return (
    <SlideShell>
      <SlideTitle eyebrow="07 · Limitations">
        Status, Constraints & Next Steps
      </SlideTitle>
      <SlideStack style={row1}>
        <div style={{ display: "flex", gap: spacing.grid, width: "100%" }}>
          <div style={{ flex: 1 }}>
            <Card title="✓ Working today" success>
              <BulletList
                items={[
                  "Public catalog + creator studio",
                  "AI generation + TTS playback",
                  "Library, comments, smoke tests",
                ]}
              />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card title="→ Planned improvements">
              <BulletList
                items={[
                  "Stripe — production chapter unlocks",
                  "CI — broader API regression coverage",
                  "Mobile — native clients on the same API",
                ]}
              />
            </Card>
          </div>
        </div>
        <div style={{ ...row2, display: "flex", gap: spacing.grid, width: "100%" }}>
          <div style={{ flex: 1 }}>
            <Card title="Current limitations">
              <BulletList
                items={[
                  "Chapter checkout uses a stub flow pending Stripe",
                  "CI automation is not yet comprehensive",
                  "TTS usage is tier-capped to control provider cost",
                ]}
              />
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card title="Legal & security" accent>
              <BulletList
                items={[
                  "Provider API keys stored server-side only",
                  "Privacy/data inventory documented for compliance",
                  "Account deletion and sessions via Auth.js",
                ]}
              />
            </Card>
          </div>
        </div>
        <p
          style={{
            ...footer,
            margin: 0,
            fontSize: 22,
            fontWeight: 600,
            color: theme.text,
            lineHeight: 1.4,
          }}
        >
          Core flows work end-to-end; remaining gaps are payments hardening, test
          automation, and scale controls.
        </p>
      </SlideStack>
    </SlideShell>
  );
};
