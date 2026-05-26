import { redirect } from "next/navigation";

type AdminLoginPageProps = {
  searchParams?: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
};

/** Legacy URL — studio admins use the main sign-in page. */
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

  const params = new URLSearchParams({ callbackUrl });
  if (errorCode) params.set("error", errorCode);
  redirect(`/auth/signin?${params.toString()}`);
}
