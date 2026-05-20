import type { StoryGenerationParams } from "@/lib/api/llm";
import type { StudioMessageRole } from "@/db/schema";
import { buildStoryPrompt } from "@/lib/server/prompt-templates";

export type ChatMessageInput = {
  role: StudioMessageRole;
  content: string;
};

export function buildAgentSystemPrompt(agentId: string, threadId: string): string {
  return [
    "You write dramatic serial fiction with concise scene-level pacing.",
    `Agent context id: ${agentId}. Thread id: ${threadId}.`,
    "This draft is isolated: do not copy titles, plots, or prose from other agents or books.",
    "When asked to refine, revise the manuscript while preserving speaker [Name] tags.",
    "Output only story prose (with [Speaker] tags), never meta commentary about being an AI.",
  ].join(" ");
}

export function buildInitialGenerationUserMessage(
  params: StoryGenerationParams,
  userPrompt?: string,
): string {
  const base = buildStoryPrompt(params);
  if (userPrompt?.trim()) {
    return `${base}\n\nAdditional direction from the author:\n${userPrompt.trim()}`;
  }
  return base;
}

export function buildRefineUserMessage(userPrompt: string, currentDraft: string): string {
  const excerpt =
    currentDraft.length > 6000
      ? `${currentDraft.slice(0, 6000)}\n\n[...draft truncated for context...]`
      : currentDraft;
  return [
    "Refine the following manuscript draft per the author's instruction.",
    `Author instruction: ${userPrompt.trim()}`,
    "Return the full revised draft with [Speaker] tags.",
    "--- Current draft ---",
    excerpt,
  ].join("\n\n");
}
