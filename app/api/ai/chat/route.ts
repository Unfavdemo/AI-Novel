import { db } from "@/db";
import {
  studioAgents,
  studioMessages,
  studioThreads,
  type StudioMessageRole,
} from "@/db/schema";
import { minChapterLengthForTarget } from "@/lib/chapter-length";
import { generateChatWithProvider } from "@/lib/server/llm-provider";
import {
  buildAgentSystemPrompt,
  buildInitialGenerationUserMessage,
  buildRefineUserMessage,
} from "@/lib/server/studio-chat";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import { requireAdmin } from "@/lib/server/require-admin";
import {
  passesChapterQualityChecks,
  passesStoryQualityChecks,
  STORY_PROMPT_TEMPLATE_VERSION,
} from "@/lib/server/prompt-templates";
import { syncAgentListingMetadata } from "@/lib/server/sync-agent-metadata";
import { recordUsageEvent } from "@/lib/server/usage-accounting";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type ChatBody = {
  threadId?: unknown;
  agentId?: unknown;
  userMessage?: unknown;
  mode?: unknown;
};

function formatQualityError(reasons: string[]): string {
  const detail = reasons.length ? `: ${reasons.join(", ")}` : "";
  return `Generated output failed quality checks${detail}`;
}

export async function POST(req: Request) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const userId = adminGate.session.user.id;

  let body: ChatBody;
  try {
    body = (await req.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const threadId = typeof body.threadId === "string" ? body.threadId : "";
  const agentId = typeof body.agentId === "string" ? body.agentId : "";
  const userMessage =
    typeof body.userMessage === "string" ? body.userMessage.trim() : "";
  const mode = body.mode === "refine" ? "refine" : "generate";

  if (!threadId || !agentId) {
    return NextResponse.json(
      { error: "threadId and agentId are required" },
      { status: 400 },
    );
  }

  const [agent] = await db
    .select()
    .from(studioAgents)
    .where(
      and(
        eq(studioAgents.id, agentId),
        eq(studioAgents.userId, userId),
        eq(studioAgents.threadId, threadId),
      ),
    )
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found for thread" }, { status: 404 });
  }

  const [thread] = await db
    .select({ id: studioThreads.id })
    .from(studioThreads)
    .where(and(eq(studioThreads.id, threadId), eq(studioThreads.userId, userId)))
    .limit(1);

  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const controls = parseControlsJson(agent.controlsJson);
  const minChapterLength =
    mode === "generate"
      ? minChapterLengthForTarget(controls.targetCharacterCount)
      : 0;

  const history = await db
    .select({
      role: studioMessages.role,
      content: studioMessages.content,
    })
    .from(studioMessages)
    .where(eq(studioMessages.threadId, threadId))
    .orderBy(asc(studioMessages.createdAt));

  const promptForModel =
    mode === "refine" && agent.draftBody.trim()
      ? buildRefineUserMessage(
          userMessage || "Polish prose and deepen tension.",
          agent.draftBody,
        )
      : buildInitialGenerationUserMessage(controls, userMessage);

  if (userMessage) {
    await db.insert(studioMessages).values({
      threadId,
      role: "user",
      content: userMessage,
    });
  }

  const llmMessages: { role: StudioMessageRole; content: string }[] = [
    ...history.filter((m) => m.role !== "system"),
    { role: "user", content: promptForModel },
  ];

  const baseSystemPrompt = buildAgentSystemPrompt(agentId, threadId);
  const maxAttempts = mode === "generate" ? 3 : 2;

  let lastError: unknown;
  let lastQualityReasons: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const retryHint =
        attempt > 1 && lastQualityReasons.length
          ? ` Previous draft failed checks (${lastQualityReasons.join(", ")}). Rewrite a longer draft with at least ${minChapterLength} characters and [Speaker] tags throughout.`
          : "";

      const systemPrompt =
        mode === "generate"
          ? `${baseSystemPrompt}${retryHint} Minimum chapter length: ${minChapterLength} characters.`
          : baseSystemPrompt;

      const result = await generateChatWithProvider({
        systemPrompt,
        messages: llmMessages,
        maxTokens: mode === "generate" ? 16_384 : undefined,
      });

      const text = result.text;
      const quality =
        mode === "generate"
          ? passesChapterQualityChecks(text, minChapterLength)
          : passesStoryQualityChecks(text);

      if (!quality.ok) {
        lastQualityReasons = quality.reasons;
        if (attempt < maxAttempts) continue;
        return NextResponse.json(
          {
            error: formatQualityError(quality.reasons),
            qualityReasons: quality.reasons,
            promptTemplateVersion: STORY_PROMPT_TEMPLATE_VERSION,
          },
          { status: 422 },
        );
      }

      const now = new Date();
      await db.transaction(async (tx) => {
        await tx.insert(studioMessages).values({
          threadId,
          role: "assistant",
          content: text,
        });
        await tx
          .update(studioAgents)
          .set({ draftBody: text, updatedAt: now })
          .where(eq(studioAgents.id, agentId));
        await tx
          .update(studioThreads)
          .set({ updatedAt: now })
          .where(eq(studioThreads.id, threadId));
      });

      await recordUsageEvent({
        userId,
        capability: "llm_generation",
        provider: result.provider,
        model: result.model,
        units: result.promptTokens + result.completionTokens,
        unitType: "tokens",
        metadata: {
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          promptTemplateVersion: STORY_PROMPT_TEMPLATE_VERSION,
          threadId,
          agentId,
          mode,
        },
      });

      const listingMeta = await syncAgentListingMetadata(
        agentId,
        text,
        agent.controlsJson,
      );

      return NextResponse.json({
        text,
        agentId,
        threadId,
        promptTemplateVersion: STORY_PROMPT_TEMPLATE_VERSION,
        listingMetadata: listingMeta,
      });
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 300));
    }
  }

  return NextResponse.json(
    {
      error: lastError instanceof Error ? lastError.message : "Chat generation failed",
    },
    { status: 502 },
  );
}
