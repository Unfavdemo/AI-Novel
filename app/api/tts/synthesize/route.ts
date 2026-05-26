import { safeAuth } from "@/lib/server/safe-auth";
import { parseVoiceCastJson, resolveSpeakerToPreset } from "@/lib/speaker-voice";
import { resolveElevenLabsVoiceId } from "@/lib/server/resolve-voice-id";
import { synthesizeWithProvider } from "@/lib/server/tts-provider";
import { classifyTtsErrorMessage } from "@/lib/tts-errors";
import { recordUsageEvent } from "@/lib/server/usage-accounting";
import { NextResponse } from "next/server";

type SynthesizeBody = {
  voiceId?: unknown;
  speakerId?: unknown;
  text?: unknown;
  castJson?: unknown;
};

export async function POST(req: Request) {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SynthesizeBody;
  try {
    body = (await req.json()) as SynthesizeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const speakerId =
    typeof body.speakerId === "string" ? body.speakerId.trim() : "";
  const rawVoice = typeof body.voiceId === "string" ? body.voiceId.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const castJson =
    typeof body.castJson === "string" ? body.castJson.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  if (text.length > 3000) {
    return NextResponse.json(
      { error: "text is too long for sync synthesis" },
      { status: 413 },
    );
  }

  try {
    const cast = parseVoiceCastJson(castJson || undefined);
    const preset = speakerId
      ? resolveSpeakerToPreset(speakerId, cast)
      : rawVoice;
    const voiceKey = preset || rawVoice;
    if (!voiceKey) {
      return NextResponse.json(
        { error: "speakerId or voiceId is required" },
        { status: 400 },
      );
    }

    const voiceId = resolveElevenLabsVoiceId(voiceKey);
    const result = await synthesizeWithProvider({
      voiceId,
      text,
      userId: session.user.id,
    });
    await recordUsageEvent({
      userId: session.user.id,
      capability: "tts_synthesis",
      provider: result.provider,
      model: result.model,
      units: text.length,
      unitType: "characters",
      metadata: { preview: false, voiceId, speakerId: speakerId || null },
    });

    return new Response(result.audio, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "private, max-age=600",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Synthesis failed";
    const code = classifyTtsErrorMessage(message);
    const status =
      code === "quota"
        ? 402
        : code === "auth"
          ? 401
          : code === "rate_limit"
            ? 429
            : 502;
    return NextResponse.json({ error: message, code }, { status });
  }
}
