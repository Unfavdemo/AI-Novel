import Link from "next/link";
import { RegisterForm } from "./register-form";

type RegisterPageProps = {
  searchParams?: Promise<{ callbackUrl?: string | string[] }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const sp = searchParams ? await searchParams : {};
  const raw = sp.callbackUrl;
  const fromQuery =
    typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const callbackUrl =
    fromQuery?.startsWith("/") && !fromQuery.startsWith("//") ? fromQuery : "/library";

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-sm flex-col justify-center px-3 py-10 sm:px-4">
      <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-500/90">
        Atelier
      </p>
      <h1 className="mt-1.5 text-center text-xl font-semibold tracking-tight text-text-primary">
        Create account
      </h1>
      <p className="mt-1.5 text-center text-xs text-text-muted">
        Normal reader accounts only. Administrator access is assigned separately and cannot be
        self-created.
      </p>

      <RegisterForm callbackUrl={callbackUrl} />

      <Link
        href="/"
        className="mt-4 text-center text-xs text-text-faint underline-offset-4 hover:text-text-muted hover:underline"
      >
        Back to catalog
      </Link>
    </div>
  );
}
