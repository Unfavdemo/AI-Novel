import type { StoryGenerationParams } from "@/lib/api/llm";
import { minChapterLengthForTarget } from "@/lib/chapter-length";
import { generateChatWithProvider } from "@/lib/server/llm-provider";
import { passesChapterQualityChecks } from "@/lib/server/prompt-templates";

export type ChapterDraft = {
  title: string;
  body: string;
};

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object in model output");
  }
  return JSON.parse(candidate.slice(start, end + 1));
}

export async function generateNextChapterWithProvider(input: {
  storyTitle: string;
  storyDescription?: string | null;
  controls: StoryGenerationParams;
  previousChapters: { title: string; body: string; sortIndex: number }[];
  userDirection?: string;
}): Promise<ChapterDraft> {
  const prior = input.previousChapters
    .sort((a, b) => a.sortIndex - b.sortIndex)
    .map((ch, i) => {
      const excerpt =
        ch.body.length > 3500 ? `${ch.body.slice(0, 3500)}\n[...]` : ch.body;
      return `Chapter ${i + 1} (${ch.title}):\n${excerpt}`;
    })
    .join("\n\n---\n\n");

  const direction =
    input.userDirection?.trim() ||
    "Continue the serial with the next chapter. Advance plot and character arcs.";

  const targetChars = input.controls.targetCharacterCount;
  const minLength = minChapterLengthForTarget(targetChars);
  let lastReasons: string[] = [];

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const retryNote =
      attempt === 0
        ? ""
        : `\nRETRY: Previous draft was too short or failed checks (${lastReasons.join(", ")}). The body MUST be at least ${minLength} characters with [Speaker] tags throughout.`;

    const result = await generateChatWithProvider({
      maxTokens: 16_384,
      systemPrompt: [
        "You write serialized audiobook fiction with [Speaker] voice tags.",
        "Return ONLY valid JSON with keys: title (string), body (string).",
        "The body must be a full chapter with at least 3 [Speaker] tagged turns.",
        `Target length: about ${targetChars} characters (roughly ten minutes of spoken narration).`,
        `Minimum body length: ${minLength} characters.`,
        "Use multiple scenes, sustained pacing, and natural dialogue — not a short vignette.",
        "Do not repeat prior chapters verbatim; continue the story forward.",
        retryNote,
      ]
        .filter(Boolean)
        .join(" "),
      messages: [
        {
          role: "user",
          content: [
            `Series: ${input.storyTitle}`,
            input.storyDescription
              ? `Description: ${input.storyDescription}`
              : "",
            `Genre: ${input.controls.genre}`,
            `Mood: ${input.controls.mood}`,
            `Target character count: ${targetChars}`,
            `Author direction: ${direction}`,
            "",
            "--- Previous chapters ---",
            prior || "(This is the first chapter.)",
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    });

    const parsed = extractJsonObject(result.text) as Partial<ChapterDraft>;
    const title =
      typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title.trim().slice(0, 200)
        : `Chapter ${input.previousChapters.length + 1}`;
    const body =
      typeof parsed.body === "string" && parsed.body.trim()
        ? parsed.body.trim()
        : result.text;

    const quality = passesChapterQualityChecks(body, minLength);
    if (quality.ok) {
      return { title, body };
    }
    lastReasons = quality.reasons;
  }

  throw new Error(`Chapter failed quality checks: ${lastReasons.join(", ")}`);
}
