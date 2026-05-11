import Link from "next/link";
import { signInAsGuest } from "@/app/auth/signin/actions";
import { SignInEmailForm } from "@/app/auth/signin/sign-in-email-form";

type SignInPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string | string[];
    error?: string | string[];
    registered?: string | string[];
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const guestAllowed =
    process.env.ALLOW_GUEST_AUTH === "true" || process.env.NODE_ENV !== "production";

  const sp = searchParams ? await searchParams : {};
  const raw = sp.callbackUrl;
  const fromQuery =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw[0]
        : undefined;
  const callbackUrl =
    fromQuery?.startsWith("/") && !fromQuery.startsWith("//")
      ? fromQuery
      : "/library";
  const rawError = sp.error;
  const errorCode =
    typeof rawError === "string" ? rawError : Array.isArray(rawError) ? rawError[0] : undefined;
  const registeredRaw = sp.registered;
  const justRegistered =
    typeof registeredRaw === "string"
      ? registeredRaw
      : Array.isArray(registeredRaw)
        ? registeredRaw[0]
        : undefined;

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-sm flex-col justify-center px-3 py-10 sm:px-4">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Atelier
      </p>
      <h1 className="mt-1.5 text-center text-xl font-semibold tracking-tight text-text-primary">
        Sign in
      </h1>
      <p className="mt-1.5 text-center text-xs text-text-muted">
        Sign in unlocks your shelf, reactions, and comments.
      </p>

      {justRegistered === "1" ? (
        <p className="mt-4 rounded-md border border-gold-500/25 bg-elevated px-3 py-2 text-center text-xs text-text-muted">
          Account created. Sign in with your email and password below.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-5">
        <div>
          <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-text-faint">
            Email &amp; password
          </p>
          <SignInEmailForm callbackUrl={callbackUrl} />
          {errorCode === "CredentialsSignin" || errorCode === "missing_credentials" ? (
            <p className="mt-2 text-center text-xs text-red-300">
              {errorCode === "missing_credentials"
                ? "Enter your email and password."
                : "Invalid email or password."}
            </p>
          ) : null}
        </div>

        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-border-subtle" />
          <span className="text-[11px] text-text-faint">or</span>
          <div className="h-px flex-1 bg-border-subtle" />
        </div>

        <div className="flex flex-col gap-2">
        {guestAllowed ? (
          <form action={signInAsGuest}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="w-full rounded-md border border-border-subtle bg-elevated px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:border-gold-500/40 hover:bg-elevated-2"
            >
              Continue as Guest
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-gold-500/25 bg-obsidian-950/80 p-4 text-center text-sm text-text-muted">
            <p>
              Guest sign-in is disabled in this environment. Set{" "}
              <code className="font-mono text-gold-400">ALLOW_GUEST_AUTH=true</code> in{" "}
              <code className="font-mono text-gold-400">.env</code> and restart the dev
              server.
            </p>
          </div>
        )}
        {errorCode === "guest_disabled" ? (
          <p className="text-center text-xs text-red-300">
            Guest sign-in is disabled in this environment.
          </p>
        ) : null}
        <Link
          href="/library"
          className="text-center text-sm text-gold-400/90 underline-offset-4 hover:underline"
        >
          Browse public library without signing in
        </Link>
        <Link
          href="/"
          className="text-center text-xs text-text-faint hover:text-text-muted"
        >
          Back to catalog
        </Link>
        </div>
      </div>
    </div>
  );
}
