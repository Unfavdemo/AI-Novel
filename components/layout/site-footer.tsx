import { SiteAuthControls } from "@/components/auth/site-auth-controls";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border-subtle bg-elevated/50">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-4 md:px-5">
        <div>
          <p className="text-sm font-semibold text-text-primary">{APP_NAME}</p>
          <p className="mt-0.5 max-w-sm text-xs text-text-muted">{APP_TAGLINE}</p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
          <Link href="/" className="transition hover:text-accent">
            Discover
          </Link>
          <Link href="/library" className="transition hover:text-accent">
            Library
          </Link>
          <SiteAuthControls variant="footer" />
        </nav>
        <p className="text-[11px] text-text-faint">© {year} {APP_NAME}</p>
      </div>
    </footer>
  );
}
