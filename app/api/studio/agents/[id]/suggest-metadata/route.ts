import { db } from "@/db";
import { studioAgents } from "@/db/schema";
import { requireAdmin } from "@/lib/server/require-admin";
import { syncAgentListingMetadata } from "@/lib/server/sync-agent-metadata";
import { parseMetadataJson } from "@/lib/server/story-metadata";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
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

  if (!agent.draftBody.trim()) {
    return NextResponse.json({ error: "Draft is empty" }, { status: 400 });
  }

  let generateCover = true;
  try {
    const body = (await req.json()) as { generateCover?: unknown };
    if (body.generateCover === false) generateCover = false;
  } catch {
    /* default */
  }

  const meta = await syncAgentListingMetadata(
    agent.id,
    agent.draftBody,
    agent.controlsJson,
    { generateCover },
  );

  if (!meta) {
    return NextResponse.json(
      {
        error:
          "Could not generate listing metadata. Check OPENAI_API_KEY and try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ metadata: meta });
}

export async function GET(_req: Request, context: RouteContext) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const { id } = await context.params;

  const [agent] = await db
    .select({ metadataJson: studioAgents.metadataJson })
    .from(studioAgents)
    .where(
      and(eq(studioAgents.id, id), eq(studioAgents.userId, adminGate.session.user.id)),
    )
    .limit(1);

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({ metadata: parseMetadataJson(agent.metadataJson) });
}
