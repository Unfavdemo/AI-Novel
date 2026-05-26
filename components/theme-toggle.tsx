"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

type ThemeChoice = "light" | "dark" | "system";

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const active: ThemeChoice =
    theme === "light" || theme === "dark" || theme === "system" ? theme : "system";

  const set = (next: ThemeChoice) => setTheme(next);

  return (
    <div
      className="flex items-center rounded-md border border-border-subtle bg-elevated/80 p-0.5"
      role="group"
      aria-label="Theme"
    >
      {(
        [
          { id: "system" as const, label: "System theme", Icon: MonitorIcon },
          { id: "light" as const, label: "Light theme", Icon: SunIcon },
          { id: "dark" as const, label: "Dark theme", Icon: MoonIcon },
        ] as const
      ).map(({ id, label, Icon }) => {
        const isActive = mounted && active === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={isActive}
            disabled={!mounted}
            onClick={() => set(id)}
            className={`rounded px-1.5 py-1 transition ${
              isActive
                ? "bg-elevated-2 text-gold-300 shadow-sm ring-1 ring-border-subtle"
                : "text-text-muted hover:text-text-primary"
            } disabled:opacity-40`}
          >
            <Icon className="block" />
          </button>
        );
      })}
      {!mounted ? (
        <span className="sr-only" aria-live="polite">
          Theme options loading
        </span>
      ) : (
        <span className="sr-only" aria-live="polite">
          {active === "system"
            ? `System (${resolvedTheme ?? "default"})`
            : active === "light"
              ? "Light"
              : "Dark"}
        </span>
      )}
    </div>
  );
}
