import { auth } from "@/auth";
import { synthesizeWithProvider } from "@/lib/server/tts-provider";
import { recordUsageEvent } from "@/lib/server/usage-accounting";
import { NextResponse } from "next/server";

type PreviewBody = {
  voiceId?: unknown;
};

const PREVIEW_TEXT = "The city held its breath, and the story began again.";

export async function POST(req: Request) {
  let body: PreviewBody;
  try {
    body = (await req.json()) as PreviewBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const voiceId = typeof body.voiceId === "string" ? body.voiceId.trim() : "";
  if (!voiceId) {
    return NextResponse.json({ error: "voiceId is required" }, { status: 400 });
  }

  try {
    const session = await auth();
    const result = await synthesizeWithProvider({ voiceId, text: PREVIEW_TEXT });
    await recordUsageEvent({
      userId: session?.user?.id ?? null,
      capability: "tts_synthesis",
      provider: result.provider,
      model: result.model,
      units: PREVIEW_TEXT.length,
      unitType: "characters",
      metadata: { preview: true, voiceId },
    });
    return NextResponse.json({
      audioBase64: Buffer.from(result.audio).toString("base64"),
      mimeType: "audio/mpeg",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Preview failed" },
      { status: 502 },
    );
  }
}
