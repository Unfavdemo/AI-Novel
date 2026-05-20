import { safeAuth } from "@/lib/server/safe-auth";
import { isAdminSession, getAdminEmailLowercase } from "@/lib/server/is-admin";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";

export type AdminAuthResult =
  | { session: Session; error: null }
  | { session: null; error: NextResponse };

/**
 * For API routes: requires configured admin email and a signed-in admin session.
 */
export async function requireAdmin(): Promise<AdminAuthResult> {
  if (!getAdminEmailLowercase()) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Studio is unavailable: ADMIN_EMAIL is not configured." },
        { status: 503 },
      ),
    };
  }

  const session = await safeAuth();
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!isAdminSession(session)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session, error: null };
}
