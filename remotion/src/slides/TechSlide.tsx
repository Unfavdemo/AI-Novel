import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { useFadeUp } from "../components/motion";
import { StatGrid } from "../components/StatGrid";
import { SlideTable } from "../components/SlideTable";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

const rows: [string, string][] = [
  ["Next.js App Router", "UI + secure API routes in one codebase"],
  ["PostgreSQL + Drizzle", "System of record — IP, unlocks, portability"],
  ["Serial memory", "Prior chapters + story-controls in LLM context"],
  ["OpenAI + ElevenLabs", "Swappable server adapters — keys server-side"],
  ["Auth.js", "Sessions, deletion, admin studio gate"],
  ["API-first", "Web today · mobile consumes same REST layer"],
];

const ARCH_STATS = [
  { value: "6 routes", label: "Core API surfaces" },
  { value: "Server-only", label: "AI keys never in browser", accent: true },
  { value: "API-first", label: "Mobile = same REST", success: true },
];

const archNodes = [
  { label: "Studio / Readers", gold: false },
  { label: "Next.js API", gold: true },
  { label: "PostgreSQL", gold: true },
  { label: "AI providers", gold: false },
];

export const TechSlide: React.FC = () => {
  const frame = useCurrentFrame();
  const content = useFadeUp(8);
  const arch = useFadeUp(32);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="07 · Architecture">How We Built It</SlideTitle>
      <SlideStack compact style={content}>
        <SlideTable
          headers={["Stack", "Rationale"]}
          rows={rows}
          fontSize={15}
          rowOpacity={(i) =>
            interpolate(frame, [6 + i * 3, 12 + i * 3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
          footer={
            <div
              style={{
                ...arch,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
                flexWrap: "wrap",
                gap: 10,
                padding: `${spacing.cellY}px ${spacing.cellX}px`,
                borderTop: `1px solid ${theme.border}`,
                background: theme.bgElevated,
              }}
            >
              {archNodes.map((node, i) => (
                <React.Fragment key={node.label}>
                  {i > 0 ? <span style={{ color: theme.gold }}>→</span> : null}
                  <span
                    style={{
                      background: theme.bgCard,
                      border: `1px solid ${node.gold ? "rgba(212,175,55,0.4)" : theme.border}`,
                      borderRadius: 8,
                      padding: "8px 12px",
                      color: node.gold ? theme.gold : theme.text,
                      fontSize: 13,
                    }}
                  >
                    {node.label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          }
        />
        <StatGrid stats={ARCH_STATS} compact />
      </SlideStack>
    </SlideShell>
  );
};
