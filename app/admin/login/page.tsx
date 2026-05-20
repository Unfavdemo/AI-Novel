import Link from "next/link";
import { signInAsAdmin } from "@/app/admin/login/actions";
import { AuthCard } from "@/components/layout/auth-card";
import { CREATOR_PRODUCT_NAME } from "@/lib/brand";

type AdminLoginPageProps = {
  searchParams?: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const sp = searchParams ? await searchParams : {};

  const raw = sp.callbackUrl;
  const fromQuery =
    typeof raw === "string"
      ? raw
      : Array.isArray(raw)
        ? raw[0]
        : undefined;
  const callbackUrl =
    fromQuery?.startsWith("/") && !fromQuery.startsWith("//") ? fromQuery : "/studio";

  const rawError = sp.error;
  const errorCode =
    typeof rawError === "string" ? rawError : Array.isArray(rawError) ? rawError[0] : undefined;

  return (
    <AuthCard
      title={`${CREATOR_PRODUCT_NAME} sign-in`}
      description="Authorized creators only. Use the credentials configured for your deployment."
      footer={
        <Link
          href="/"
          className="block text-center text-xs text-text-faint hover:text-text-muted hover:underline"
        >
          ← Back to catalog
        </Link>
      }
    >
      <form action={signInAsAdmin} className="flex flex-col gap-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="input-surface rounded-md px-3 py-2 text-sm outline-none focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/20"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="input-surface rounded-md px-3 py-2 text-sm outline-none focus:border-gold-500/40 focus:ring-2 focus:ring-gold-500/20"
          />
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-lg border border-gold-500/40 bg-gold-500/90 px-3 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-gold-500"
        >
          Sign in to studio
        </button>

        {errorCode ? (
          <p className="text-center text-xs text-red-600 dark:text-red-400">
            {errorCode === "CredentialsSignin"
              ? "Invalid credentials."
              : "Sign-in failed. Try again."}
          </p>
        ) : null}
      </form>
    </AuthCard>
  );
}
