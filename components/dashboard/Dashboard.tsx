"use client";

import { IntrigueMeter } from "@/components/dashboard/IntrigueMeter";
import { SaveStoryModal } from "@/components/dashboard/SaveStoryModal";
import { ManuscriptEngine } from "@/components/dashboard/ManuscriptEngine";
import { SplitTrackTimeline } from "@/components/timeline/SplitTrackTimeline";
import { VoiceConsole } from "@/components/voice/VoiceConsole";
import { useManuscriptState } from "@/hooks/useManuscriptState";
import { useVoiceSegments } from "@/hooks/useVoiceSegments";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Dashboard() {
  const router = useRouter();
  const { status } = useSession();
  const [saveOpen, setSaveOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [cast, setCast] = useState<Record<string, string>>({});
  const {
    controls,
    setPartial,
    storyText,
    setStoryText,
    isGenerating,
    error,
    generate,
  } = useManuscriptState();
  const segments = useVoiceSegments(storyText);

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(1200px_circle_at_20%_-10%,rgba(212,175,55,0.08),transparent_55%),radial-gradient(900px_circle_at_100%_0%,rgba(90,110,180,0.07),transparent_50%)]">
      <div className="border-b border-border-subtle bg-obsidian-950/30 px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
              Novel &amp; Audiobook studio
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Manuscript engine and split-track casting.{" "}
              <Link href="/library" className="text-gold-400/90 hover:underline">
                Open library
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => setSaveOpen(true)}
                disabled={!storyText.trim()}
                className="rounded-lg border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm font-semibold text-gold-200 transition hover:bg-gold-500/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Save to library
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-muted transition hover:border-gold-500/35 hover:text-text-primary"
              >
                Sign in to save
              </Link>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-6 md:px-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-start">
          <IntrigueMeter storyText={storyText} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setVoiceOpen(true)}
              className="rounded-lg border border-border-subtle px-4 py-2 text-sm font-medium text-text-primary transition hover:border-gold-500/35"
            >
              Voice console
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-4">
          <ManuscriptEngine
            controls={controls}
            onControlsChange={setPartial}
            storyText={storyText}
            onStoryTextChange={setStoryText}
            onGenerate={generate}
            isGenerating={isGenerating}
            error={error}
          />
          <SplitTrackTimeline segments={segments} castMapping={cast} />
        </div>
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

      <SaveStoryModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        storyText={storyText}
        controls={controls}
        onSaved={(id) => router.push(`/library/${id}`)}
      />
    </div>
  );
}
