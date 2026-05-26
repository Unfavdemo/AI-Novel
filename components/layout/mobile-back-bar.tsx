import Link from "next/link";
import type { ReactNode } from "react";

type MobileBackBarProps = {
  href: string;
  /** Short label shown next to the chevron, e.g. "Library" or "Series" */
  label: string;
  className?: string;
  /** Extra actions on the same row (e.g. prev/next) */
  endSlot?: ReactNode;
};

/**
 * Native-style back affordance for WebView shells (no browser chrome).
 * Safe to render from server components.
 */
export function MobileBackBar({ href, label, className = "", endSlot }: MobileBackBarProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5 ${className}`.trim()}
    >
      <Link
        href={href}
        prefetch={href.startsWith("/")}
        className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-md py-1.5 pr-2 text-[11px] font-semibold uppercase tracking-wide text-gold-400/90 transition hover:text-gold-300 active:opacity-80"
      >
        <span className="text-base leading-none" aria-hidden>
          ←
        </span>
        <span>Back · {label}</span>
      </Link>
      {endSlot ? <div className="flex shrink-0 flex-wrap items-center gap-1">{endSlot}</div> : null}
    </div>
  );
}
