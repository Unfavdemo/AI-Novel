import React from "react";
import { spacing } from "../theme";

type SlideStackProps = {
  children: React.ReactNode;
  compact?: boolean;
  style?: React.CSSProperties;
};

export const SlideStack: React.FC<SlideStackProps> = ({
  children,
  compact = false,
  style,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: compact ? spacing.grid : spacing.stack,
      width: "100%",
      ...style,
    }}
  >
    {children}
  </div>
);
