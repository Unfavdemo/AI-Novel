import { auth } from "@/auth";
import type { Session } from "next-auth";

/**
 * Returns the current session, or null if unsigned-in or the JWT is invalid.
 * Invalid cookies (wrong AUTH_SECRET, corrupt token) are treated as signed-out
 * instead of throwing JWTSessionError and breaking the layout.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    const session = await auth();
    return session ?? null;
  } catch (error) {
    const type =
      error && typeof error === "object" && "type" in error
        ? String((error as { type: string }).type)
        : "AuthError";
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[auth] ${type}: session cookie ignored. Set a stable AUTH_SECRET in .env and sign in again, or clear site cookies.`,
      );
    }
    return null;
  }
}
