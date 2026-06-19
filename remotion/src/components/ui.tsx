import React from "react";
import { fontSans, fontSerif } from "../fonts";
import { spacing, theme } from "../theme";

export const Eyebrow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span
    style={{
      display: "block",
      fontFamily: fontSans,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: theme.gold,
      marginBottom: 10,
    }}
  >
    {children}
  </span>
);

export const SlideTitle: React.FC<{ eyebrow?: string; children: React.ReactNode }> = ({
  eyebrow,
  children,
}) => (
  <h2
    style={{
      fontFamily: fontSerif,
      fontSize: 52,
      fontWeight: 600,
      margin: `0 0 ${spacing.stack}px`,
      paddingBottom: spacing.cellY,
      borderBottom: `1px solid ${theme.border}`,
      color: theme.text,
      letterSpacing: "-0.02em",
    }}
  >
    {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
    {children}
  </h2>
);

type CardProps = {
  title?: React.ReactNode;
  accent?: boolean;
  success?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

export const Card: React.FC<CardProps> = ({
  title,
  accent,
  success,
  children,
  style,
}) => {
  const borderColor = success
    ? "rgba(110, 231, 160, 0.25)"
    : accent
      ? "rgba(212, 175, 55, 0.35)"
      : theme.border;

  const background = success
    ? `linear-gradient(145deg, ${theme.successDim}, ${theme.bgCard})`
    : accent
      ? `linear-gradient(145deg, rgba(212,175,55,0.08), ${theme.bgCard})`
      : theme.bgCard;

  return (
    <div
      style={{
        background,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: `${spacing.cellY + 8}px ${spacing.cellX}px`,
        flex: 1,
        ...style,
      }}
    >
      {title ? (
        <h3
          style={{
            fontFamily: fontSans,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: success ? theme.success : theme.gold,
            margin: "0 0 12px",
          }}
        >
          {title}
        </h3>
      ) : null}
      {children}
    </div>
  );
};

export const BulletList: React.FC<{ items: string[]; compact?: boolean }> = ({
  items,
  compact = false,
}) => (
  <ul
    style={{
      margin: 0,
      paddingLeft: 20,
      fontSize: compact ? 18 : 22,
      lineHeight: compact ? 1.45 : 1.55,
      color: theme.textMuted,
    }}
  >
    {items.map((item) => (
      <li key={item} style={{ marginBottom: compact ? 4 : 8 }}>
        {item}
      </li>
    ))}
  </ul>
);

export const NumBadge: React.FC<{ n: number }> = ({ n }) => (
  <div
    style={{
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: theme.gold,
      color: theme.onAccent,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
      fontSize: 18,
      marginBottom: 10,
    }}
  >
    {n}
  </div>
);

export const Chip: React.FC<{ children: React.ReactNode; gold?: boolean }> = ({
  children,
  gold,
}) => (
  <span
    style={{
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "10px 18px",
      borderRadius: 999,
      border: `1px solid ${gold ? "rgba(212,175,55,0.45)" : theme.border}`,
      background: gold ? theme.goldDim : "rgba(24, 27, 36, 0.8)",
      color: gold ? theme.gold : theme.textMuted,
    }}
  >
    {children}
  </span>
);

export const Quote: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <blockquote
    style={{
      margin: "24px 0 0",
      padding: "16px 20px",
      borderLeft: `3px solid ${theme.gold}`,
      background: theme.goldDim,
      borderRadius: "0 12px 12px 0",
      fontSize: 24,
      color: theme.text,
      lineHeight: 1.45,
    }}
  >
    {children}
  </blockquote>
);

export const Flow: React.FC<{ steps: string[] }> = ({ steps }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      flexWrap: "wrap",
      marginTop: 28,
    }}
  >
    {steps.map((step, i) => (
      <React.Fragment key={step}>
        {i > 0 ? (
          <span style={{ color: theme.gold, fontSize: 22 }}>→</span>
        ) : null}
        <span
          style={{
            background: theme.bgCard,
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            padding: "10px 16px",
            color: theme.text,
            fontSize: 20,
          }}
        >
          {step}
        </span>
      </React.Fragment>
    ))}
  </div>
);
