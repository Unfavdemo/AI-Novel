"use client";

import { deleteAccountAction } from "@/app/actions/account";
import { signOutAction } from "@/app/actions/auth";
import { MobileBackBar } from "@/components/layout/mobile-back-bar";
import { PageShell } from "@/components/page-shell";
import { useAppDialog } from "@/components/ui/app-dialog-provider";
import { useState, useTransition } from "react";

type AccountClientProps = {
  name: string | null | undefined;
  email: string | null | undefined;
  isAdmin: boolean;
};

export function AccountClient({ name, email, isAdmin }: AccountClientProps) {
  const { confirm, prompt } = useAppDialog();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onDelete = () => {
    setError(null);
    void (async () => {
      const agreed = await confirm({
        title: "Delete account permanently?",
        description:
          "This removes your profile, library, manuscripts, comments, unlocks, and studio data from our servers. This cannot be undone.",
        confirmLabel: "Continue",
        cancelLabel: "Cancel",
        destructive: true,
      });
      if (!agreed) return;

      const typed = await prompt({
        title: "Confirm deletion",
        description: 'Type the word DELETE in capital letters to confirm.',
        placeholder: "DELETE",
        submitLabel: "Delete my account",
        cancelLabel: "Cancel",
      });
      if (typed !== "DELETE") {
        setError("Deletion cancelled — confirmation text did not match.");
        return;
      }

      startTransition(() => {
        void (async () => {
          const result = await deleteAccountAction();
          if (result && "ok" in result && result.ok === false) {
            setError(result.error);
          }
        })();
      });
    })();
  };

  return (
    <PageShell max="content">
      <MobileBackBar href="/" label="Home" className="mb-6" />

      <h1 className="text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
        Account
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Signed in as{" "}
        <span className="font-medium text-text-primary">{name ?? email ?? "Reader"}</span>
        {email ? (
          <>
            {" "}
            (<span className="select-text">{email}</span>)
          </>
        ) : null}
      </p>

      <div className="mt-8 space-y-4 border-t border-border-subtle pt-6">
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-border-subtle bg-elevated px-4 py-2.5 text-sm font-medium text-text-primary transition hover:border-gold-500/35 active:opacity-90"
          >
            Sign out
          </button>
        </form>

        <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-4">
          <h2 className="text-sm font-semibold text-red-200">Delete account</h2>
          <p className="mt-1 text-xs leading-relaxed text-text-muted">
            Required for app store compliance when the app supports account creation. Your data
            is removed from our database; see the privacy inventory doc for categories of data
            affected.
          </p>
          {isAdmin ? (
            <p className="mt-2 text-xs text-amber-200/90">
              Administrator accounts cannot be self-deleted here.
            </p>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={onDelete}
              className="mt-3 rounded-lg border border-red-500/40 bg-red-600/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-600/30 disabled:opacity-50 active:opacity-90"
            >
              {pending ? "Deleting…" : "Delete my account"}
            </button>
          )}
          {error ? <p className="mt-2 text-xs text-red-300">{error}</p> : null}
        </div>
      </div>
    </PageShell>
  );
}
