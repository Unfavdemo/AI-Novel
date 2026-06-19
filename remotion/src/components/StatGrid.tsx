import React from "react";
import { fontSerif } from "../fonts";
import { spacing, theme } from "../theme";

export type Stat = {
  value: string;
  label: string;
  accent?: boolean;
  success?: boolean;
};

export const StatGrid: React.FC<{ stats: Stat[]; compact?: boolean }> = ({
  stats,
  compact = false,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
      gap: spacing.grid,
      width: "100%",
    }}
  >
    {stats.map((stat) => (
      <div
        key={stat.label}
        style={{
          background: stat.accent
            ? `linear-gradient(145deg, rgba(212,175,55,0.12), ${theme.bgCard})`
            : stat.success
              ? `linear-gradient(145deg, ${theme.successDim}, ${theme.bgCard})`
              : theme.bgCard,
          border: `1px solid ${
            stat.accent
              ? "rgba(212,175,55,0.35)"
              : stat.success
                ? "rgba(110,231,160,0.25)"
                : theme.border
          }`,
          borderRadius: 14,
          padding: compact ? "12px 14px" : "16px 18px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontFamily: fontSerif,
            fontSize: compact ? 28 : 34,
            fontWeight: 600,
            color: stat.success ? theme.success : stat.accent ? theme.gold : theme.text,
            lineHeight: 1.1,
          }}
        >
          {stat.value}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: theme.textMuted,
            lineHeight: 1.3,
          }}
        >
          {stat.label}
        </div>
      </div>
    ))}
  </div>
);

export const StatusBadge: React.FC<{
  status: "met" | "partial" | "planned" | "live";
  children: React.ReactNode;
}> = ({ status, children }) => {
  const colors = {
    met: { bg: theme.successDim, border: "rgba(110,231,160,0.35)", text: theme.success },
    partial: { bg: theme.goldDim, border: "rgba(212,175,55,0.35)", text: theme.gold },
    planned: { bg: "rgba(100,120,200,0.12)", border: "rgba(100,120,200,0.3)", text: "#9eb4ff" },
    live: { bg: theme.successDim, border: "rgba(110,231,160,0.35)", text: theme.success },
  }[status];

  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "4px 10px",
        borderRadius: 999,
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
      }}
    >
      {children}
    </span>
  );
};

export const Callout: React.FC<{
  children: React.ReactNode;
  accent?: boolean;
}> = ({ children, accent }) => (
  <div
    style={{
      borderLeft: `4px solid ${accent ? theme.gold : theme.success}`,
      background: accent ? theme.goldDim : theme.successDim,
      borderRadius: "0 12px 12px 0",
      padding: "12px 16px",
      fontSize: 15,
      lineHeight: 1.45,
      color: theme.text,
    }}
  >
    {children}
  </div>
);
