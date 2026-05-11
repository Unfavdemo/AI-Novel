import Link from "next/link";
import { signInAsAdmin } from "@/app/admin/login/actions";

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
    fromQuery?.startsWith("/") && !fromQuery.startsWith("//") ? fromQuery : "/admin";

  const rawError = sp.error;
  const errorCode =
    typeof rawError === "string" ? rawError : Array.isArray(rawError) ? rawError[0] : undefined;

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-sm flex-col justify-center px-3 py-10 sm:px-4">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Atelier
      </p>
      <h1 className="mt-1.5 text-center text-xl font-semibold tracking-tight text-text-primary">
        Admin
      </h1>
      <p className="mt-1.5 text-center text-xs text-text-muted">
        Environment-configured administrator only. There is no self-service way to create an admin
        account; readers use{" "}
        <Link href="/auth/register" className="text-gold-400/90 underline-offset-4 hover:underline">
          normal registration
        </Link>
        .
      </p>

      <form action={signInAsAdmin} className="mt-6 flex flex-col gap-3">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Email</span>
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-text-muted">Password</span>
          <input
            name="password"
            type="password"
            required
            className="rounded-md border border-border-subtle bg-elevated px-3 py-2 text-sm text-text-primary outline-none focus:border-gold-500/40"
          />
        </label>

        <button
          type="submit"
          className="mt-1 w-full rounded-md border border-gold-500/40 bg-gradient-to-r from-gold-600/90 to-gold-400/90 px-3 py-2.5 text-sm font-semibold text-on-accent transition hover:from-gold-500 hover:to-gold-300"
        >
          Sign in
        </button>

        {errorCode ? (
          <p className="text-center text-xs text-red-300">
            {errorCode === "CredentialsSignin" ? "Invalid admin credentials." : "Sign-in failed."}
          </p>
        ) : null}

        <Link
          href="/"
          className="text-center text-xs text-text-faint underline-offset-4 hover:text-text-muted hover:underline"
        >
          Back to catalog
        </Link>
      </form>
    </div>
  );
}

