import { cookies } from "next/headers";

/** Auth.js session cookie names (including chunked `.0`, `.1`, …). */
const SESSION_COOKIE_PATTERN =
  /^(?:__Secure-|__Host-)?authjs\.session-token(?:\.\d+)?$/;

export function isAuthSessionCookieName(name: string): boolean {
  return SESSION_COOKIE_PATTERN.test(name);
}

/** Remove broken or stale Auth.js session cookies (RSC does not apply Auth Set-Cookie). */
export async function clearAuthSessionCookies(): Promise<void> {
  const jar = await cookies();
  for (const cookie of jar.getAll()) {
    if (isAuthSessionCookieName(cookie.name)) {
      jar.delete(cookie.name);
    }
  }
}
