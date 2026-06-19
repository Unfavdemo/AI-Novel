import React from "react";
import { spacing, theme } from "../theme";

type SlideTableProps = {
  headers: [string, string] | [string, string, string];
  rows: [string, string][] | [string, string, string][];
  fontSize?: number;
  emphasis?: "left" | "right" | "center";
  rowOpacity?: (index: number) => number;
  footer?: React.ReactNode;
};

const cellPad = `${spacing.cellY}px ${spacing.cellX}px`;

export const SlideTable: React.FC<SlideTableProps> = ({
  headers,
  rows,
  fontSize = 20,
  emphasis = "left",
  rowOpacity,
  footer,
}) => {
  const colCount = headers.length;
  const gridCols = colCount === 3 ? "1fr 0.55fr 1fr" : "1fr 1fr";

  const rowMin = fontSize <= 17 ? spacing.rowMin - 10 : spacing.rowMin;

  const cellBase: React.CSSProperties = {
    padding: cellPad,
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    minHeight: rowMin,
    lineHeight: 1.35,
    boxSizing: "border-box",
  };

  const headerCell: React.CSSProperties = {
    ...cellBase,
    background: "linear-gradient(180deg, #222633, #181b24)",
    color: theme.gold,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: 15,
    fontWeight: 600,
  };

  return (
    <div
      style={{
        width: "100%",
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        overflow: "hidden",
        background: theme.bgCard,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          width: "100%",
        }}
      >
        {headers.map((header) => (
          <div key={header} style={headerCell}>
            {header}
          </div>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={row[0]}
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            width: "100%",
            borderTop: `1px solid ${theme.border}`,
            opacity: rowOpacity?.(i) ?? 1,
            fontSize,
          }}
        >
          {row.map((cell, col) => {
            const emphasized =
              (emphasis === "left" && col === 0) ||
              (emphasis === "right" && col === row.length - 1) ||
              (emphasis === "center" && col === 1);
            return (
              <div
                key={`${row[0]}-${col}`}
                style={{
                  ...cellBase,
                  color: emphasized ? theme.text : theme.textMuted,
                  fontWeight: emphasized ? 600 : 400,
                }}
              >
                {cell}
              </div>
            );
          })}
        </div>
      ))}
      {footer}
    </div>
  );
};
