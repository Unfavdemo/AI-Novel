import Link from "next/link";
import { signInAsGuest, signInWithGithub } from "@/app/auth/signin/actions";

type SignInPageProps = {
  searchParams?: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const hasGithub =
    Boolean(process.env.AUTH_GITHUB_ID) &&
    Boolean(process.env.AUTH_GITHUB_SECRET);
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

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-sm flex-col justify-center px-3 py-10 sm:px-4">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Atelier
      </p>
      <h1 className="mt-1.5 text-center text-xl font-semibold tracking-tight text-text-primary">
        Sign in
      </h1>
      <p className="mt-1.5 text-center text-xs text-text-muted">
        GitHub unlocks your shelf, reactions, and comments.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {hasGithub ? (
          <form action={signInWithGithub}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="w-full rounded-md border border-border-subtle bg-elevated px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:border-gold-500/40 hover:bg-elevated-2"
            >
              Continue with GitHub
            </button>
          </form>
        ) : (
          <div className="rounded-lg border border-gold-500/25 bg-obsidian-950/80 p-4 text-center text-sm text-text-muted">
            <p>
              Set <code className="font-mono text-gold-400">AUTH_GITHUB_ID</code>{" "}
              and{" "}
              <code className="font-mono text-gold-400">AUTH_GITHUB_SECRET</code>{" "}
              in <code className="font-mono text-gold-400">.env</code>, then
              restart the dev server.
            </p>
            {guestAllowed ? (
              <form action={signInAsGuest} className="mt-3">
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button
                  type="submit"
                  className="w-full rounded-md border border-border-subtle bg-elevated px-3 py-2 text-xs font-semibold text-text-primary transition hover:border-gold-500/40 hover:bg-elevated-2"
                >
                  Continue as Guest
                </button>
              </form>
            ) : null}
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
  );
}
