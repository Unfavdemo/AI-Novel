import { auth } from "@/auth";
import { db } from "@/db";
import { usageEvents } from "@/db/schema";
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const month = Number(url.searchParams.get("month") ?? "");
  const year = Number(url.searchParams.get("year") ?? "");
  const now = new Date();
  const targetYear = Number.isFinite(year) ? year : now.getUTCFullYear();
  const targetMonth = Number.isFinite(month) ? month : now.getUTCMonth() + 1;

  const from = new Date(Date.UTC(targetYear, targetMonth - 1, 1));
  const to = new Date(Date.UTC(targetYear, targetMonth, 1));

  const rows = await db
    .select({
      capability: usageEvents.capability,
      unitType: usageEvents.unitType,
      units: sql<number>`sum(${usageEvents.units})`,
    })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.userId, userId),
        gte(usageEvents.createdAt, from),
        lt(usageEvents.createdAt, to),
      ),
    )
    .groupBy(usageEvents.capability, usageEvents.unitType);

  return NextResponse.json({
    period: {
      year: targetYear,
      month: targetMonth,
    },
    totals: rows,
  });
}
