import { SiteAuthControls } from "@/components/auth/site-auth-controls";
import { ThemeToggle } from "@/components/theme-toggle";
import { ADMIN_WORKSPACE_NAME, APP_NAME } from "@/lib/brand";
import { isAdminSession } from "@/lib/server/is-admin";
import { safeAuth } from "@/lib/server/safe-auth";
import Link from "next/link";

const navLinkClass =
  "rounded-md px-2 py-1 transition hover:bg-elevated hover:text-accent";

export async function SiteHeader() {
  const session = await safeAuth();
  const showStudio = isAdminSession(session);

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2.5 sm:px-4 md:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <Link href="/" className="group shrink-0 leading-tight">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
              {APP_NAME}
            </p>
            <p className="text-sm font-semibold tracking-tight text-text-primary group-hover:text-accent">
              Audiobooks
            </p>
          </Link>
          <nav
            className="flex items-center gap-0.5 text-[13px] text-text-muted sm:gap-1 sm:text-sm"
            aria-label="Main"
          >
            <Link href="/" className={navLinkClass}>
              Discover
            </Link>
            <Link href="/library" className={navLinkClass}>
              Library
            </Link>
            {showStudio ? (
              <Link href="/studio" className={navLinkClass}>
                {ADMIN_WORKSPACE_NAME}
              </Link>
            ) : null}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <SiteAuthControls variant="header" />
        </div>
      </div>
    </header>
  );
}
