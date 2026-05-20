import { db } from "@/db";
import { usageEvents } from "@/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

export type ElevenLabsPlan = "free" | "starter";

const PLAN_CHAR_LIMITS: Record<ElevenLabsPlan, number> = {
  free: 10_000,
  starter: 30_000,
};

export function getElevenLabsPlan(): ElevenLabsPlan {
  const raw = process.env.ELEVENLABS_PLAN?.toLowerCase();
  return raw === "starter" ? "starter" : "free";
}

export function getElevenLabsMonthlyCharLimit(): number {
  const override = process.env.ELEVENLABS_MONTHLY_CHAR_LIMIT;
  if (override) {
    const n = Number(override);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return PLAN_CHAR_LIMITS[getElevenLabsPlan()];
}

export async function getMonthlyTtsCharacters(userId: string | null): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const conditions = [
    eq(usageEvents.capability, "tts_synthesis"),
    gte(usageEvents.createdAt, startOfMonth),
  ];
  if (userId) {
    conditions.push(eq(usageEvents.userId, userId));
  }

  const [row] = await db
    .select({
      total: sql<number>`coalesce(sum(${usageEvents.units}), 0)`.mapWith(Number),
    })
    .from(usageEvents)
    .where(and(...conditions));

  return row?.total ?? 0;
}

export async function assertElevenLabsBudget(
  userId: string | null,
  incomingChars: number,
): Promise<void> {
  const limit = getElevenLabsMonthlyCharLimit();
  const used = await getMonthlyTtsCharacters(userId);
  if (used + incomingChars > limit) {
    const plan = getElevenLabsPlan();
    throw new Error(
      `ElevenLabs ${plan} tier monthly character budget exceeded (${used}/${limit}). Set ELEVENLABS_PLAN=starter or raise ELEVENLABS_MONTHLY_CHAR_LIMIT for production.`,
    );
  }
}
