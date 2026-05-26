"use client";

import { ListenButton } from "@/components/book/ListenButton";
import { SignInLink } from "@/components/auth/sign-in-link";
import { useAppSession } from "@/lib/hooks/use-app-session";

type StoreListenButtonProps = {
  text?: string;
  chapters?: { title: string; body: string }[];
  voiceCastJson?: string | null;
  storySeed?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
};

/**
 * ElevenLabs listen control for the public store. Requires sign-in so TTS usage is attributed.
 */
export function StoreListenButton({
  text,
  chapters,
  voiceCastJson,
  storySeed,
  label = "Listen",
  className = "",
  size = "md",
}: StoreListenButtonProps) {
  const { isSignedIn, isLoading } = useAppSession();

  if (isLoading) {
    return (
      <span className={`text-[11px] text-text-faint ${className}`}>Loading audio…</span>
    );
  }

  if (!isSignedIn) {
    return (
      <div className={className}>
        <SignInLink
          className={`inline-flex rounded-md border border-gold-500/35 bg-gold-500/10 font-medium text-accent hover:bg-gold-500/15 ${
            size === "md" ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[11px]"
          }`}
        >
          Sign in to listen
        </SignInLink>
        <p className="mt-1 text-[10px] text-text-faint">
          Audiobook narration powered by ElevenLabs
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ListenButton
        text={text}
        chapters={chapters}
        voiceCastJson={voiceCastJson}
        storySeed={storySeed}
        label={label}
        size={size}
      />
      <p className="mt-1 text-[10px] text-text-faint">
        Multi-voice narration · ElevenLabs
      </p>
    </div>
  );
}
