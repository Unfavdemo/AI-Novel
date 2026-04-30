type UnlockEvent =
  | "unlock_attempt"
  | "unlock_denied"
  | "unlock_success"
  | "unlock_error";

type UnlockPayload = Record<string, string | number | boolean | null | undefined>;

export function logUnlockEvent(event: UnlockEvent, payload: UnlockPayload): void {
  console.info("[chapter_unlock]", JSON.stringify({ event, ...payload }));
}
