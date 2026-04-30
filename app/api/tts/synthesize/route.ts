import { auth } from "@/auth";
import { synthesizeWithProvider } from "@/lib/server/tts-provider";
import { recordUsageEvent } from "@/lib/server/usage-accounting";
import { NextResponse } from "next/server";

type SynthesizeBody = {
  voiceId?: unknown;
  text?: unknown;
};

export async function POST(req: Request) {
  let body: SynthesizeBody;
  try {
    body = (await req.json()) as SynthesizeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const voiceId = typeof body.voiceId === "string" ? body.voiceId.trim() : "";
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!voiceId || !text) {
    return NextResponse.json(
      { error: "voiceId and text are required" },
      { status: 400 },
    );
  }

  if (text.length > 3000) {
    return NextResponse.json(
      { error: "text is too long for sync synthesis" },
      { status: 413 },
    );
  }

  try {
    const session = await auth();
    const result = await synthesizeWithProvider({ voiceId, text });
    await recordUsageEvent({
      userId: session?.user?.id ?? null,
      capability: "tts_synthesis",
      provider: result.provider,
      model: result.model,
      units: text.length,
      unitType: "characters",
      metadata: { preview: false, voiceId },
    });

    return new Response(result.audio, {
      status: 200,
      headers: {
        "content-type": "audio/mpeg",
        "cache-control": "private, max-age=600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Synthesis failed" },
      { status: 502 },
    );
  }
}
