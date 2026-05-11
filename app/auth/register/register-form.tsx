"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { registerAction } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-md border border-gold-500/40 bg-gradient-to-r from-gold-600/90 to-gold-400/90 px-3 py-2.5 text-sm font-semibold text-on-accent transition hover:from-gold-500 hover:to-gold-300 disabled:opacity-50"
    >
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction] = useFormState(registerAction, undefined);

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Display name (optional)</span>
        <input
          name="name"
          type="text"
          autoComplete="name"
          className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Password (10+ characters)</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={10}
          className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-text-muted">Confirm password</span>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          minLength={10}
          className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
        />
      </label>

      {state?.ok === false ? (
        <p className="text-center text-xs text-red-300">{state.error}</p>
      ) : null}

      <SubmitButton />

      <p className="text-center text-xs text-text-muted">
        Already have an account?{" "}
        <Link
          href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-gold-400/90 underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
