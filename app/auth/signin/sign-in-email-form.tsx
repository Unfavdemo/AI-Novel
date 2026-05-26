"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { signInWithUserPassword } from "./actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-md border border-border-subtle bg-elevated px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:border-gold-500/40 hover:bg-elevated-2 disabled:opacity-50"
    >
      {pending ? "Signing in…" : "Sign in with email"}
    </button>
  );
}

export function SignInEmailForm({ callbackUrl }: { callbackUrl: string }) {
  return (
    <form action={signInWithUserPassword} className="flex flex-col gap-2">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Email</span>
        <input
          id="signin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Password</span>
        <input
          id="signin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
        />
      </label>
      <Submit />
      <p className="text-center text-xs text-text-muted">
        New here?{" "}
        <Link
          href={`/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-gold-400/90 underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
