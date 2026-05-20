import Link from "next/link";
import { signInAsGuest } from "@/app/auth/signin/actions";
import { SignInEmailForm } from "@/app/auth/signin/sign-in-email-form";
import { AuthCard } from "@/components/layout/auth-card";

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
    <AuthCard
      title="Welcome back"
      description="Sign in to unlock chapters, save your shelf, and join story discussions."
      footer={
        <div className="flex flex-col gap-2 text-center text-xs">
          <Link href="/auth/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
          <Link href="/" className="text-text-faint hover:text-text-muted hover:underline">
            Browse without signing in
          </Link>
        </div>
      }
    >
      {justRegistered === "1" ? (
        <p className="mb-4 rounded-md border border-gold-500/25 bg-surface px-3 py-2 text-center text-xs text-text-muted">
          Account created. Sign in with your email and password below.
        </p>
      ) : null}

      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-text-faint">
            Email &amp; password
          </p>
          <SignInEmailForm callbackUrl={callbackUrl} />
          {errorCode === "CredentialsSignin" || errorCode === "missing_credentials" ? (
            <p className="mt-2 text-center text-xs text-red-600 dark:text-red-400">
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

        {guestAllowed ? (
          <form action={signInAsGuest}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <button
              type="submit"
              className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:border-gold-500/40 hover:bg-elevated"
            >
              Continue as guest
            </button>
          </form>
        ) : null}
        {errorCode === "guest_disabled" ? (
          <p className="text-center text-xs text-red-600 dark:text-red-400">
            Guest access is not enabled on this deployment.
          </p>
        ) : null}
      </div>
    </AuthCard>
  );
}
