import Link from "next/link";
import { RegisterForm } from "./register-form";
import { AuthCard } from "@/components/layout/auth-card";

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
    <AuthCard
      title="Create your account"
      description="Join as a reader to unlock chapters, react to stories, and comment. Creator access is assigned separately."
      footer={
        <Link
          href="/auth/signin"
          className="block text-center text-xs text-text-faint hover:text-text-muted hover:underline"
        >
          Already have an account? Sign in
        </Link>
      }
    >
      <RegisterForm callbackUrl={callbackUrl} />
    </AuthCard>
  );
}
