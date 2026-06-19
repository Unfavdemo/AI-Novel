import React from "react";
import { AbsoluteFill } from "remotion";
import { fontSans } from "../fonts";
import { theme } from "../theme";

type SlideShellProps = {
  children: React.ReactNode;
  variant?: "default" | "dense" | "lead" | "closing";
};

const shellPadding: Record<NonNullable<SlideShellProps["variant"]>, string> = {
  default: "64px 80px 56px",
  dense: "48px 72px 44px",
  lead: "64px 80px 56px",
  closing: "64px 80px 56px",
};

export const SlideShell: React.FC<SlideShellProps> = ({
  children,
  variant = "default",
}) => {
  const background =
    variant === "lead"
      ? `linear-gradient(160deg, ${theme.bg} 0%, ${theme.bgElevated} 45%, ${theme.bgCard} 100%)`
      : variant === "closing"
        ? `linear-gradient(160deg, ${theme.bgElevated}, ${theme.bg})`
        : variant === "dense"
          ? `linear-gradient(165deg, ${theme.bg} 0%, #0e1016 55%, ${theme.bgElevated} 100%)`
          : theme.bg;

  return (
    <AbsoluteFill
      style={{
        background,
        fontFamily: fontSans,
        color: theme.text,
        padding: shellPadding[variant],
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -80,
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.goldGlow} 0%, transparent 68%)`,
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${theme.gold}, transparent)`,
          opacity: 0.55,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        {children}
      </div>
    </AbsoluteFill>
  );
};
