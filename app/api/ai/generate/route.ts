import { auth } from "@/auth";
import { generateStoryWithProvider } from "@/lib/server/llm-provider";
import {
  passesStoryQualityChecks,
  STORY_PROMPT_TEMPLATE_VERSION,
} from "@/lib/server/prompt-templates";
import { recordUsageEvent } from "@/lib/server/usage-accounting";
import { NextResponse } from "next/server";

type GenerateBody = {
  genre?: unknown;
  complexity?: unknown;
  targetCharacterCount?: unknown;
  mood?: unknown;
  literarySophistication?: unknown;
  narrativeTension?: unknown;
};

function parseNumber(v: unknown, fallback: number): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

export async function POST(req: Request) {
  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const params = {
    genre: typeof body.genre === "string" ? body.genre : "Literary thriller",
    complexity: typeof body.complexity === "string" ? body.complexity : "High",
    targetCharacterCount: parseNumber(body.targetCharacterCount, 8000),
    mood: typeof body.mood === "string" ? body.mood : "Noir elegance",
    literarySophistication: parseNumber(body.literarySophistication, 58),
    narrativeTension: parseNumber(body.narrativeTension, 62),
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const session = await auth();
      const result = await generateStoryWithProvider(params);
      const quality = passesStoryQualityChecks(result.text);
      if (!quality.ok) {
        return NextResponse.json(
          {
            error: "Generated output failed quality checks",
            qualityReasons: quality.reasons,
            promptTemplateVersion: STORY_PROMPT_TEMPLATE_VERSION,
          },
          { status: 422 },
        );
      }

      await recordUsageEvent({
        userId: session?.user?.id ?? null,
        capability: "llm_generation",
        provider: result.provider,
        model: result.model,
        units: result.promptTokens + result.completionTokens,
        unitType: "tokens",
        metadata: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          promptTemplateVersion: STORY_PROMPT_TEMPLATE_VERSION,
        },
      });

      return NextResponse.json({
        text: result.text,
        promptTemplateVersion: STORY_PROMPT_TEMPLATE_VERSION,
      });
    } catch (error) {
      lastError = error;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 300));
    }
  }

  return NextResponse.json(
    {
      error: lastError instanceof Error ? lastError.message : "Generation failed",
    },
    { status: 502 },
  );
}
