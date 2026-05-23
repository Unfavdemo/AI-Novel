/** OpenAI Images API helpers (gpt-image-1+ vs legacy DALL·E). */

export function isGptImageModel(model: string): boolean {
  return model.startsWith("gpt-image") || model.startsWith("chatgpt-image");
}

export function isDalleModel(model: string): boolean {
  return model.startsWith("dall-e");
}

export function defaultImageModel(): string {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
}

export function resolveImageSize(model: string, requested?: string): string {
  const raw = requested?.trim();
  if (raw) {
    if (isGptImageModel(model) && (raw === "256x256" || raw === "512x512")) {
      return "1024x1024";
    }
    return raw;
  }
  if (isGptImageModel(model)) return "1024x1024";
  if (model === "dall-e-3") return "1024x1024";
  return "512x512";
}

export type ImageGenerationBody = Record<string, unknown>;

export function buildImageGenerationBody(
  model: string,
  prompt: string,
  size: string,
): ImageGenerationBody {
  const body: ImageGenerationBody = {
    model,
    prompt: prompt.slice(0, 900),
    n: 1,
    size,
  };

  if (isGptImageModel(model)) {
    body.output_format = process.env.OPENAI_IMAGE_OUTPUT_FORMAT?.trim() || "png";
    const quality = process.env.OPENAI_IMAGE_QUALITY?.trim();
    if (quality === "low" || quality === "medium" || quality === "high") {
      body.quality = quality;
    } else {
      body.quality = "low";
    }
  } else if (isDalleModel(model)) {
    body.response_format = "b64_json";
    if (model === "dall-e-3") {
      body.quality = "standard";
    }
  }

  return body;
}

export async function imageResponseToDataUrl(
  data: { b64_json?: string; url?: string } | undefined,
): Promise<string | null> {
  if (!data) return null;

  if (data.b64_json) {
    const mime =
      process.env.OPENAI_IMAGE_OUTPUT_FORMAT?.trim() === "jpeg"
        ? "image/jpeg"
        : "image/png";
    return `data:${mime};base64,${data.b64_json}`;
  }

  if (data.url) {
    const imgRes = await fetch(data.url);
    if (!imgRes.ok) return null;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") ?? "image/png";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  }

  return null;
}
