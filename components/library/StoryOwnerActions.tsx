"use client";

import { useAppDialog } from "@/components/ui/app-dialog-provider";
import { useAppSession } from "@/lib/hooks/use-app-session";
import {
  deleteStory,
  generateStoryCover,
  refreshStoryListing,
} from "@/lib/api/stories";
import { useRouter } from "next/navigation";
import { useState } from "react";

type StoryOwnerActionsProps = {
  storyId: string;
  hasCover: boolean;
  variant?: "detail" | "card";
  onUpdated?: () => void;
};

export function StoryOwnerActions({
  storyId,
  hasCover,
  variant = "detail",
  onUpdated,
}: StoryOwnerActionsProps) {
  const router = useRouter();
  const { session, isSignedIn } = useAppSession();
  const { confirm } = useAppDialog();
  const [busy, setBusy] = useState<"cover" | "listing" | "delete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (
    action: "cover" | "listing" | "delete",
    fn: () => Promise<void>,
  ) => {
    setBusy(action);
    setError(null);
    try {
      await fn();
      if (action === "delete") {
        const dest =
          isSignedIn && session?.user?.isAdmin === true ? "/studio" : "/library";
        router.push(dest);
        router.refresh();
        return;
      }
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(null);
    }
  };

  const btnClass =
    variant === "card"
      ? "rounded border border-border-subtle px-2 py-1 text-[10px] font-medium text-text-muted hover:border-gold-500/35 hover:text-accent"
      : "rounded border border-gold-500/35 px-2 py-0.5 text-[11px] font-medium text-accent disabled:opacity-50";

  return (
    <div className={variant === "card" ? "flex flex-col gap-1" : "contents"}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            void run("cover", async () => {
              await generateStoryCover(storyId);
            })
          }
          className={btnClass}
        >
          {busy === "cover"
            ? "Generating…"
            : hasCover
              ? "Regenerate cover"
              : "Generate cover"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() =>
            void run("listing", async () => {
              await refreshStoryListing(storyId);
            })
          }
          className={btnClass}
        >
          {busy === "listing" ? "Generating…" : "Cover + listing"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => {
            void (async () => {
              const ok = await confirm({
                title: "Delete story",
                description:
                  "Delete this story permanently? Chapters and listing data will be removed.",
                confirmLabel: "Delete",
                destructive: true,
              });
              if (!ok) return;
              await run("delete", async () => {
                await deleteStory(storyId);
              });
            })();
          }}
          className={
            variant === "card"
              ? "rounded border border-red-500/30 px-2 py-1 text-[10px] font-medium text-red-400 hover:bg-red-500/10"
              : "rounded border border-red-500/35 px-2 py-0.5 text-[11px] font-medium text-red-400 disabled:opacity-50"
          }
        >
          {busy === "delete" ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error ? (
        <p className="text-[10px] text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
