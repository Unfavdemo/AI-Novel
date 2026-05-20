import { db } from "@/db";
import {
  studioAgents,
  studioMessages,
  studioThreads,
  type StudioMessageRole,
} from "@/db/schema";
import { generateChatWithProvider } from "@/lib/server/llm-provider";
import {
  buildAgentSystemPrompt,
  buildInitialGenerationUserMessage,
  buildRefineUserMessage,
} from "@/lib/server/studio-chat";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import { requireAdmin } from "@/lib/server/require-admin";
import {
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

  const systemPrompt = buildAgentSystemPrompt(agentId, threadId);

  let lastError: unknown;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const result = await generateChatWithProvider({
        systemPrompt,
        messages: llmMessages,
      });

      let text = result.text;
      let quality = passesStoryQualityChecks(text);

      if (!quality.ok && attempt < 2) {
        const retry = await generateChatWithProvider({
          systemPrompt: `${systemPrompt}\nRevise for uniqueness and quality. Reasons: ${quality.reasons.join(", ")}.`,
          messages: [
            ...llmMessages,
            {
              role: "assistant",
              content: text,
            },
            {
              role: "user",
              content:
                "Revise the draft to fix quality issues and ensure it is distinct from other books.",
            },
          ],
        });
        text = retry.text;
        quality = passesStoryQualityChecks(text);
        result.promptTokens += retry.promptTokens;
        result.completionTokens += retry.completionTokens;
      }

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
      if (attempt < 2) await new Promise((r) => setTimeout(r, 300));
    }
  }

  return NextResponse.json(
    {
      error: lastError instanceof Error ? lastError.message : "Chat generation failed",
    },
    { status: 502 },
  );
}
