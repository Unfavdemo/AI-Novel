import type { StoryGenerationParams } from "@/lib/api/llm";
import type { StudioMessageRole } from "@/db/schema";
import { buildStoryPrompt } from "@/lib/server/prompt-templates";

export type LlmResult = {
  text: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
};

function timeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort("timeout"), ms);
  return controller.signal;
}

export async function generateStoryWithProvider(
  params: StoryGenerationParams,
): Promise<LlmResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "LLM provider not configured: set OPENAI_API_KEY (and optionally OPENAI_MODEL) in your environment.",
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const prompt = buildStoryPrompt(params);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.85,
      messages: [
        {
          role: "system",
          content:
            "You write dramatic serial fiction with scene-level pacing. Produce full chapters suitable for roughly ten minutes of spoken narration when asked to generate new prose.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
    signal: timeoutSignal(20_000),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM provider error (${res.status}): ${body.slice(0, 200)}`);
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = body.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("LLM provider returned empty output");

  return {
    text,
    provider: "openai",
    model,
    promptTokens: body.usage?.prompt_tokens ?? 0,
    completionTokens: body.usage?.completion_tokens ?? 0,
  };
}

export type ChatCompletionMessage = {
  role: StudioMessageRole;
  content: string;
};

export async function generateChatWithProvider(input: {
  systemPrompt: string;
  messages: ChatCompletionMessage[];
  /** Raise for long chapter JSON (default leaves model limit). */
  maxTokens?: number;
}): Promise<LlmResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "LLM provider not configured: set OPENAI_API_KEY (and optionally OPENAI_MODEL) in your environment.",
    );
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const openAiMessages = [
    { role: "system" as const, content: input.systemPrompt },
    ...input.messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
  ];

  const payload: Record<string, unknown> = {
    model,
    temperature: 0.85,
    messages: openAiMessages,
  };
  if (input.maxTokens != null && Number.isFinite(input.maxTokens)) {
    payload.max_tokens = Math.min(16_384, Math.max(256, Math.floor(input.maxTokens)));
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: timeoutSignal(120_000),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`LLM provider error (${res.status}): ${errBody.slice(0, 200)}`);
  }

  const completion = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const text = completion.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("LLM provider returned empty output");

  return {
    text,
    provider: "openai",
    model,
    promptTokens: completion.usage?.prompt_tokens ?? 0,
    completionTokens: completion.usage?.completion_tokens ?? 0,
  };
}
