import { db } from "@/db";
import { usageEvents } from "@/db/schema";

type UsageInput = {
  userId: string | null;
  capability: "llm_generation" | "tts_synthesis";
  provider: string;
  model?: string | null;
  units: number;
  unitType: "tokens" | "characters" | "seconds";
  metadata?: Record<string, unknown>;
};

export async function recordUsageEvent(input: UsageInput): Promise<void> {
  await db.insert(usageEvents).values({
    userId: input.userId,
    capability: input.capability,
    provider: input.provider,
    model: input.model ?? null,
    units: Math.max(0, Math.round(input.units)),
    unitType: input.unitType,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}
