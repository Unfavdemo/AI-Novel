import type { ReactNode } from "react";

type Max = "reader" | "content" | "wide";

const maxClass: Record<Max, string> = {
  reader: "max-w-2xl",
  content: "max-w-4xl",
  wide: "max-w-6xl",
};

/**
 * Shared horizontal padding and max-width so pages feel dense, not “floating” in empty space.
 */
export function PageShell({
  children,
  max = "wide",
  className = "",
}: {
  children: ReactNode;
  max?: Max;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full ${maxClass[max]} px-3 py-5 sm:px-4 md:px-5 md:py-6 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
