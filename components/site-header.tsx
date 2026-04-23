import { signOutAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-obsidian-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="group">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-500/90">
              Atelier
            </p>
            <p className="text-sm font-semibold tracking-tight text-text-primary group-hover:text-gold-200">
              Studio
            </p>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-text-muted">
            <Link
              href="/"
              className="transition hover:text-gold-300 data-[active]:text-gold-300"
            >
              Manuscript
            </Link>
            <Link
              href="/library"
              className="transition hover:text-gold-300"
            >
              Library
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-xs text-text-muted sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-border-subtle bg-elevated px-3 py-1.5 text-xs font-medium text-text-primary transition hover:border-gold-500/35"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg border border-gold-500/35 bg-gradient-to-r from-gold-600/90 to-gold-400/90 px-3 py-1.5 text-xs font-semibold text-obsidian-950 transition hover:from-gold-500 hover:to-gold-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
