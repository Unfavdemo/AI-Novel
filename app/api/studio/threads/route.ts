import { db } from "@/db";
import { studioAgents, studioThreads } from "@/db/schema";
import { DEFAULT_STUDIO_CONTROLS } from "@/lib/server/studio-defaults";
import { requireAdmin } from "@/lib/server/require-admin";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const userId = adminGate.session.user.id;

  const rows = await db
    .select({
      id: studioThreads.id,
      title: studioThreads.title,
      createdAt: studioThreads.createdAt,
      updatedAt: studioThreads.updatedAt,
      agentId: studioAgents.id,
      draftPreview: studioAgents.draftBody,
      status: studioAgents.status,
      storyId: studioAgents.storyId,
    })
    .from(studioThreads)
    .leftJoin(studioAgents, eq(studioAgents.threadId, studioThreads.id))
    .where(eq(studioThreads.userId, userId))
    .orderBy(desc(studioThreads.updatedAt));

  return NextResponse.json({
    threads: rows.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      agent: r.agentId
        ? {
            id: r.agentId,
            status: r.status,
            storyId: r.storyId,
            draftPreview: r.draftPreview?.slice(0, 120) ?? "",
          }
        : null,
    })),
  });
}

export async function POST(req: Request) {
  const adminGate = await requireAdmin();
  if (adminGate.error) return adminGate.error;
  const userId = adminGate.session.user.id;

  let title = "New chat";
  try {
    const body = (await req.json()) as { title?: unknown };
    if (typeof body.title === "string" && body.title.trim()) {
      title = body.title.trim().slice(0, 120);
    }
  } catch {
    /* optional body */
  }

  const now = new Date();
  const result = await db.transaction(async (tx) => {
    const [thread] = await tx
      .insert(studioThreads)
      .values({ userId, title, updatedAt: now })
      .returning({
        id: studioThreads.id,
        title: studioThreads.title,
        createdAt: studioThreads.createdAt,
        updatedAt: studioThreads.updatedAt,
      });

    const [agent] = await tx
      .insert(studioAgents)
      .values({
        userId,
        threadId: thread.id,
        controlsJson: JSON.stringify(DEFAULT_STUDIO_CONTROLS),
        updatedAt: now,
      })
      .returning({
        id: studioAgents.id,
        threadId: studioAgents.threadId,
        draftBody: studioAgents.draftBody,
        status: studioAgents.status,
      });

    return { thread, agent };
  });

  return NextResponse.json(
    {
      thread: result.thread,
      agent: result.agent,
    },
    { status: 201 },
  );
}
