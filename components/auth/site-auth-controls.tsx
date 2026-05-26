"use client";

import { signOutAction } from "@/app/actions/auth";
import { SignInLink } from "@/components/auth/sign-in-link";
import { useAppSession } from "@/lib/hooks/use-app-session";

type SiteAuthControlsProps = {
  /** Header: bordered button; footer: text link */
  variant?: "header" | "footer";
};

export function SiteAuthControls({ variant = "header" }: SiteAuthControlsProps) {
  const { session, isSignedIn, isLoading } = useAppSession();

  if (isLoading) {
    return variant === "header" ? (
      <span className="text-xs text-text-faint">…</span>
    ) : null;
  }

  if (isSignedIn && session?.user) {
    if (variant === "footer") {
      return (
        <form action={signOutAction} className="inline">
          <button
            type="submit"
            className="transition hover:text-accent"
          >
            Sign out
          </button>
        </form>
      );
    }

    return (
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
    );
  }

  if (variant === "footer") {
    return (
      <SignInLink className="transition hover:text-accent">Sign in</SignInLink>
    );
  }

  return (
    <SignInLink className="rounded-md border border-gold-500/35 bg-gold-500/10 px-2.5 py-1 text-xs font-semibold text-accent transition hover:bg-gold-500/15">
      Sign in
    </SignInLink>
  );
}
