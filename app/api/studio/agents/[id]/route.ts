import { db } from "@/db";
import { studioAgents } from "@/db/schema";
import { parseControlsJson } from "@/lib/server/studio-defaults";
import { parseMetadataJson, serializeMetadataJson } from "@/lib/server/story-metadata";
import { requireAdmin } from "@/lib/server/require-admin";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const { id } = await context.params;

  const [agent] = await db
    .select()
    .from(studioAgents)
    .where(
      and(eq(studioAgents.id, id), eq(studioAgents.userId, adminGate.session.user.id)),
    )
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({
    agent: {
      id: agent.id,
      threadId: agent.threadId,
      storyId: agent.storyId,
      draftBody: agent.draftBody,
      controls: parseControlsJson(agent.controlsJson),
      metadata: parseMetadataJson(agent.metadataJson),
      status: agent.status,
      updatedAt: agent.updatedAt,
    },
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const [existing] = await db
    .select()
    .from(studioAgents)
    .where(
      and(eq(studioAgents.id, id), eq(studioAgents.userId, adminGate.session.user.id)),
    )
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const patch: Partial<typeof studioAgents.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (typeof body.draftBody === "string") {
    patch.draftBody = body.draftBody;
  }
  if (body.controls && typeof body.controls === "object") {
    patch.controlsJson = JSON.stringify({
      ...parseControlsJson(existing.controlsJson),
      ...(body.controls as object),
    });
  }
  if (body.metadata && typeof body.metadata === "object") {
    patch.metadataJson = serializeMetadataJson({
      ...parseMetadataJson(existing.metadataJson),
      ...(body.metadata as object),
    });
  }

  const [agent] = await db
    .update(studioAgents)
    .set(patch)
    .where(eq(studioAgents.id, id))
    .returning();

  return NextResponse.json({
    agent: {
      id: agent.id,
      threadId: agent.threadId,
      storyId: agent.storyId,
      draftBody: agent.draftBody,
      controls: parseControlsJson(agent.controlsJson),
      metadata: parseMetadataJson(agent.metadataJson),
      status: agent.status,
    },
  });
}
