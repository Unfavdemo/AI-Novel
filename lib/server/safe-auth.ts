import { auth } from "@/auth";
import { clearAuthSessionCookies } from "@/lib/server/auth-cookies";
import type { Session } from "next-auth";

function isJwtSessionFailure(error: unknown): boolean {
  if (error && typeof error === "object" && "type" in error) {
    return (error as { type: string }).type === "JWTSessionError";
  }
  return false;
}

/**
 * Returns the current session, or null if unsigned-in or the JWT is invalid.
 * Invalid cookies (wrong AUTH_SECRET, corrupt token) are cleared so the layout
 * does not log JWTSessionError on every request.
 */
export async function safeAuth(): Promise<Session | null> {
  try {
    const session = await auth();
    if (!session) {
      await clearAuthSessionCookies();
    }
    return session ?? null;
  } catch (error) {
    await clearAuthSessionCookies();
    if (process.env.NODE_ENV !== "production" && isJwtSessionFailure(error)) {
      console.warn(
        "[auth] Invalid session cookie cleared. Use a stable AUTH_SECRET in .env and sign in again.",
      );
    } else if (process.env.NODE_ENV !== "production") {
      const type =
        error && typeof error === "object" && "type" in error
          ? String((error as { type: string }).type)
          : "AuthError";
      console.warn(`[auth] ${type}: treated as signed out.`);
    }
    return null;
  }
}
