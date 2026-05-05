import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPrototypePage() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    redirect("/");
  }

  const session = await auth();
  const isAdmin = session?.user?.email?.toLowerCase() === adminEmail;
  if (!isAdmin) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-400">
        Prototype
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
        Admin Side
      </h1>
      <p className="max-w-2xl text-sm text-text-muted">
        Use this static admin entry point for prototype demos. Open studio tools,
        manage content, and review the creator workflow from here.
      </p>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Link
          href="/studio"
          className="rounded-lg border border-border-subtle bg-elevated p-4 transition hover:border-gold-500/40"
        >
          <p className="text-sm font-semibold text-text-primary">Open Studio</p>
          <p className="mt-1 text-xs text-text-muted">
            Creator dashboard for generating and editing stories.
          </p>
        </Link>
        <Link
          href="/library"
          className="rounded-lg border border-border-subtle bg-elevated p-4 transition hover:border-gold-500/40"
        >
          <p className="text-sm font-semibold text-text-primary">Content Library</p>
          <p className="mt-1 text-xs text-text-muted">
            Review saved and public stories in one place.
          </p>
        </Link>
      </div>
    </div>
  );
}
