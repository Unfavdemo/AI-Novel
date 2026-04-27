import { signOutAction } from "@/app/actions/auth";
import { auth } from "@/auth";
import Link from "next/link";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border-subtle bg-obsidian-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2 sm:px-4 md:px-5">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5">
          <Link href="/" className="group shrink-0 leading-tight">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
              Atelier
            </p>
            <p className="text-sm font-semibold tracking-tight text-text-primary group-hover:text-gold-200">
              Stories
            </p>
          </Link>
          <nav className="flex items-center gap-1 text-[13px] text-text-muted sm:gap-3 sm:text-sm">
            <Link
              href="/"
              className="rounded-md px-2 py-1 transition hover:bg-elevated hover:text-gold-300"
            >
              Read
            </Link>
            {session?.user ? (
              <Link
                href="/studio"
                className="rounded-md px-2 py-1 transition hover:bg-elevated hover:text-gold-300"
              >
                Studio
              </Link>
            ) : null}
            <Link
              href="/library"
              className="rounded-md px-2 py-1 transition hover:bg-elevated hover:text-gold-300"
            >
              Library
            </Link>
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {session?.user ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-xs text-text-muted sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-border-subtle bg-elevated px-2.5 py-1 text-xs font-medium text-text-primary transition hover:border-gold-500/35"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-md border border-gold-500/40 bg-gradient-to-r from-gold-600/90 to-gold-400/90 px-2.5 py-1 text-xs font-semibold text-obsidian-950 transition hover:from-gold-500 hover:to-gold-300"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
