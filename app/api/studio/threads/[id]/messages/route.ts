import { db } from "@/db";
import { studioAgents, studioMessages, studioThreads } from "@/db/schema";
import { parseMetadataJson } from "@/lib/server/story-metadata";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import { requireAdmin } from "@/lib/server/require-admin";
import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

async function loadThreadForAdmin(threadId: string, userId: string) {
  const [thread] = await db
    .select({ id: studioThreads.id })
    .from(studioThreads)
    .where(and(eq(studioThreads.id, threadId), eq(studioThreads.userId, userId)))
    .limit(1);
  return thread ?? null;
}

export async function GET(_req: Request, context: RouteContext) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const { id: threadId } = await context.params;

  const thread = await loadThreadForAdmin(threadId, adminGate.session.user.id);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const messages = await db
    .select({
      id: studioMessages.id,
      role: studioMessages.role,
      content: studioMessages.content,
      createdAt: studioMessages.createdAt,
    })
    .from(studioMessages)
    .where(eq(studioMessages.threadId, threadId))
    .orderBy(asc(studioMessages.createdAt));

  const [agent] = await db
    .select({
      id: studioAgents.id,
      draftBody: studioAgents.draftBody,
      controlsJson: studioAgents.controlsJson,
      metadataJson: studioAgents.metadataJson,
      status: studioAgents.status,
      storyId: studioAgents.storyId,
    })
    .from(studioAgents)
    .where(eq(studioAgents.threadId, threadId))
    .limit(1);

  return NextResponse.json({
    messages,
    agent: agent
      ? {
          id: agent.id,
          threadId,
          storyId: agent.storyId,
          draftBody: agent.draftBody,
          controls: parseControlsJson(agent.controlsJson),
          metadata: parseMetadataJson(agent.metadataJson),
          status: agent.status,
        }
      : null,
  });
}

export async function POST(req: Request, context: RouteContext) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const { id: threadId } = await context.params;
  const userId = adminGate.session.user.id;

  const thread = await loadThreadForAdmin(threadId, userId);
  if (!thread) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  let body: { content?: unknown; role?: unknown };
  try {
    body = (await req.json()) as { content?: unknown; role?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const role = body.role === "system" ? "system" : "user";

  const [message] = await db
    .insert(studioMessages)
    .values({ threadId, role, content })
    .returning({
      id: studioMessages.id,
      role: studioMessages.role,
      content: studioMessages.content,
      createdAt: studioMessages.createdAt,
    });

  await db
    .update(studioThreads)
    .set({ updatedAt: new Date() })
    .where(eq(studioThreads.id, threadId));

  return NextResponse.json({ message }, { status: 201 });
}
