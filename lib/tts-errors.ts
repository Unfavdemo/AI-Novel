export type TtsErrorCode = "quota" | "rate_limit" | "auth" | "config" | "unknown";

export class TtsSynthesisError extends Error {
  readonly code: TtsErrorCode;

  constructor(message: string, code: TtsErrorCode) {
    super(message);
    this.name = "TtsSynthesisError";
    this.code = code;
  }
}

export function classifyTtsErrorMessage(raw: string): TtsErrorCode {
  const lower = raw.toLowerCase();
  if (
    lower.includes("quota") ||
    lower.includes("credits remaining") ||
    lower.includes("credit") && lower.includes("exceed")
  ) {
    return "quota";
  }
  if (lower.includes("rate limit") || lower.includes("429")) {
    return "rate_limit";
  }
  if (
    lower.includes("api key") ||
    lower.includes("unauthorized") ||
    lower.includes("invalid elevenlabs")
  ) {
    return "auth";
  }
  if (lower.includes("not configured") || lower.includes("tts provider")) {
    return "config";
  }
  return "unknown";
}

export function userMessageForTtsError(
  raw: string,
  code: TtsErrorCode = classifyTtsErrorMessage(raw),
): string {
  if (code === "quota") {
    const match = raw.match(
      /(\d+)\s+credits?\s+remaining.*?(\d+)\s+credits?(\s+are)?\s+required/i,
    );
    if (match) {
      return `ElevenLabs credits are almost used up (${match[1]} left, this line needs ${match[2]}). Add credits in your ElevenLabs account or try a shorter passage.`;
    }
    return "ElevenLabs credits are exhausted or this passage is too long for your plan. Add credits at elevenlabs.io or shorten the text.";
  }
  if (code === "rate_limit") {
    return "ElevenLabs rate limit reached. Wait a moment and try again.";
  }
  if (code === "auth") {
    return "ElevenLabs API key is missing or invalid. Check ELEVENLABS_API_KEY in your environment.";
  }
  if (code === "config") {
    return raw;
  }
  return raw.length > 200 ? `${raw.slice(0, 200)}…` : raw;
}

export function toTtsSynthesisError(raw: string): TtsSynthesisError {
  const code = classifyTtsErrorMessage(raw);
  return new TtsSynthesisError(userMessageForTtsError(raw, code), code);
}
