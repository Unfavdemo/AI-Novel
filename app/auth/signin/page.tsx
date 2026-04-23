import Link from "next/link";
import { signInWithGithub } from "@/app/auth/signin/actions";

export default function SignInPage() {
  const hasGithub =
    Boolean(process.env.AUTH_GITHUB_ID) &&
    Boolean(process.env.AUTH_GITHUB_SECRET);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Atelier
      </p>
      <h1 className="mt-2 text-center text-2xl font-semibold tracking-tight text-text-primary">
        Sign in
      </h1>
      <p className="mt-2 text-center text-sm text-text-muted">
        Use GitHub to access your private shelf, reactions, and comments.
      </p>

      <div className="mt-10 flex flex-col gap-3">
        {hasGithub ? (
          <form action={signInWithGithub}>
            <button
              type="submit"
              className="w-full rounded-lg border border-border-subtle bg-elevated px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-gold-500/40 hover:bg-elevated-2"
            >
              Continue with GitHub
            </button>
          </form>
        ) : (
          <p className="rounded-lg border border-gold-500/25 bg-obsidian-950/80 p-4 text-center text-sm text-text-muted">
            Set <code className="font-mono text-gold-400">AUTH_GITHUB_ID</code>{" "}
            and{" "}
            <code className="font-mono text-gold-400">AUTH_GITHUB_SECRET</code>{" "}
            in <code className="font-mono text-gold-400">.env</code>, then
            restart the dev server.
          </p>
        )}
        <Link
          href="/library"
          className="text-center text-sm text-gold-400/90 underline-offset-4 hover:underline"
        >
          Browse public library without signing in
        </Link>
        <Link
          href="/"
          className="text-center text-sm text-text-faint hover:text-text-muted"
        >
          Back to studio
        </Link>
      </div>
    </div>
  );
}
