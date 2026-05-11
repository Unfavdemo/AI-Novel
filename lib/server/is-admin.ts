import type { Session } from "next-auth";

/** Lowercase configured admin email, or null if studio/admin UI is disabled. */
export function getAdminEmailLowercase(): string | null {
  const raw = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return raw || null;
}

/** True when the signed-in user matches `ADMIN_EMAIL` (case-insensitive). */
export function isAdminSession(session: Session | null | undefined): boolean {
  const adminEmail = getAdminEmailLowercase();
  const userEmail = session?.user?.email?.trim().toLowerCase();
  return Boolean(adminEmail && userEmail && userEmail === adminEmail);
}
