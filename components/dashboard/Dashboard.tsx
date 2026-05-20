"use client";

import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { AgentSaveModal } from "@/components/admin/AgentSaveModal";
import { SplitTrackTimeline } from "@/components/timeline/SplitTrackTimeline";
import { ThemeToggle } from "@/components/theme-toggle";
import { VoiceConsole } from "@/components/voice/VoiceConsole";
import type { StoryListingMetadata } from "@/lib/api/story-listing";
import { useVoiceSegments } from "@/hooks/useVoiceSegments";
import { CREATOR_PRODUCT_NAME } from "@/lib/brand";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Dashboard() {
  const router = useRouter();
  const [saveOpen, setSaveOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [cast, setCast] = useState<Record<string, string>>({});
  const [timelineText, setTimelineText] = useState("");
  const [draftForSave, setDraftForSave] = useState("");
  const [agentIdForSave, setAgentIdForSave] = useState("");
  const [metadataForSave, setMetadataForSave] = useState<StoryListingMetadata | null>(
    null,
  );
  const segments = useVoiceSegments(timelineText);

  return (
    <div className="studio-page-bg flex min-h-screen flex-col">
      <div className="border-b border-border-subtle bg-elevated/80 px-3 py-2.5 sm:px-4 md:px-5">
        <div className="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-500/90">
              Production
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-text-primary md:text-xl">
              {CREATOR_PRODUCT_NAME}
            </h1>
            <p className="mt-0.5 text-xs text-text-muted md:text-sm">
              Draft with AI chat, review each book in its own agent, and publish to your
              catalog.{" "}
              <Link href="/library" className="text-accent hover:underline">
                Library
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setVoiceOpen(true)}
              className="rounded-lg border border-border-subtle px-3 py-2 text-sm font-medium text-text-primary transition hover:border-gold-500/35"
            >
              Narration
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-4 px-3 py-4 sm:px-4 md:px-5">
        <AdminWorkspace
          onDraftChange={setTimelineText}
          onRequestSave={({ agentId, draftBody, metadata }) => {
            setAgentIdForSave(agentId);
            setDraftForSave(draftBody);
            setMetadataForSave(metadata);
            setSaveOpen(true);
          }}
        />
        {timelineText.trim() ? (
          <SplitTrackTimeline segments={segments} castMapping={cast} />
        ) : null}
      </main>

      <VoiceConsole
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        segments={segments}
        cast={cast}
        onCastChange={(speakerId, voiceId) =>
          setCast((c) => ({ ...c, [speakerId]: voiceId }))
        }
      />

      <AgentSaveModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        agentId={agentIdForSave}
        draftBody={draftForSave}
        initialMetadata={metadataForSave}
        onSaved={(id) => router.push(`/library/${id}`)}
      />
    </div>
  );
}
