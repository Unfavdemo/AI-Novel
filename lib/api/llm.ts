export type StoryGenerationParams = {
  genre: string;
  complexity: string;
  targetCharacterCount: number;
  mood: string;
  literarySophistication: number;
  narrativeTension: number;
};

/**
 * Placeholder for your LLM provider (OpenAI, Anthropic, etc.).
 * Replace the body with a fetch() to your API route or server action.
 */
export async function generateStory(
  params: StoryGenerationParams,
): Promise<string> {
  await new Promise((r) => setTimeout(r, 650));

  const tone =
    params.literarySophistication > 66
      ? "ornate, layered clauses"
      : params.literarySophistication > 33
        ? "balanced, cinematic prose"
        : "lean, propulsive sentences";

  const tension =
    params.narrativeTension > 66
      ? "The silence between them felt charged, inevitable."
      : params.narrativeTension > 33
        ? "Something unspoken tightened the air."
        : "The room exhaled; danger felt distant, for now.";

  return (
    `[Narrator] ${params.genre} — ${params.mood}. Complexity ${params.complexity}; target ~${params.targetCharacterCount} characters.\n\n` +
    `[Narrator] The manuscript engine prefers ${tone}. ${tension}\n\n` +
    `[Aria] "You came back for the ledger," she said, voice low, precise. "Not for me."\n\n` +
    `[Marcus] He adjusted his cuff — a tell, old as time. "I came back because the story isn't finished."\n\n` +
    `[Narrator] Outside, rain drew gold threads down the obsidian glass. Somewhere below, a door closed — soft, final.`
  );
}
