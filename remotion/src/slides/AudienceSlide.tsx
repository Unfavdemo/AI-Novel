import React from "react";
import { useFadeUp } from "../components/motion";
import { StatGrid } from "../components/StatGrid";
import { SlideShell } from "../components/SlideShell";
import { SlideStack } from "../components/SlideStack";
import { Card, NumBadge, SlideTitle } from "../components/ui";
import { spacing, theme } from "../theme";

type Persona = {
  n: number;
  title: string;
  body: string;
  route: string;
  accent?: boolean;
};

const PersonaCard: React.FC<{ persona: Persona; delay: number }> = ({
  persona,
  delay,
}) => {
  const anim = useFadeUp(delay);

  return (
    <div style={{ ...anim, flex: 1 }}>
      <Card accent={persona.accent}>
        <NumBadge n={persona.n} />
        <h3
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: theme.gold,
            margin: "0 0 6px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {persona.title}
        </h3>
        <p style={{ fontSize: 16, color: theme.textMuted, margin: "0 0 6px", lineHeight: 1.35 }}>
          {persona.body}
        </p>
        <p style={{ fontSize: 14, color: theme.gold, margin: 0, fontFamily: "monospace" }}>
          {persona.route}
        </p>
      </Card>
    </div>
  );
};

const personas: Persona[] = [
  {
    n: 1,
    title: "The client",
    body: "Studio operator — exclusive private workspace, not a marketplace",
    route: "/studio · /library · owns catalog",
    accent: true,
  },
  {
    n: 2,
    title: "Readers",
    body: "Discover serials, unlock paid chapters at the store",
    route: "/ · /store",
  },
  {
    n: 3,
    title: "Listeners",
    body: "Text + ElevenLabs audio in one chapter player",
    route: "Chapter player",
  },
];

const REVENUE_STATS = [
  { value: "Free", label: "Preview chapters", accent: true },
  { value: "$0.99–1.49", label: "Paid unlock / chapter" },
  { value: "0%", label: "Aggregator share", success: true },
];

export const AudienceSlide: React.FC = () => {
  const content = useFadeUp(8);

  return (
    <SlideShell variant="dense">
      <SlideTitle eyebrow="03 · Audience">Client & End Users</SlideTitle>
      <SlideStack compact style={content}>
        <div style={{ display: "flex", gap: spacing.grid }}>
          {personas.map((persona, i) => (
            <PersonaCard key={persona.title} persona={persona} delay={6 + i * 6} />
          ))}
        </div>
        <StatGrid stats={REVENUE_STATS} compact />
        <Card title="Business model & revenue flow" accent>
          <p style={{ margin: 0, fontSize: 16, color: theme.textMuted, lineHeight: 1.45 }}>
            Discover on catalog → preview free chapters → unlock paid installments →
            consume text + audio. Client owns catalog, pricing, and margin.
          </p>
        </Card>
      </SlideStack>
    </SlideShell>
  );
};
