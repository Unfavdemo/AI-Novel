"use server";

import { signOut } from "@/auth";
import { db } from "@/db";
import { usageEvents, users } from "@/db/schema";
import { clearAuthSessionCookies } from "@/lib/server/auth-cookies";
import { isAdminSession } from "@/lib/server/is-admin";
import { safeAuth } from "@/lib/server/safe-auth";
import { eq } from "drizzle-orm";

export type DeleteAccountResult = { ok: false; error: string };

/**
 * Permanently deletes the signed-in user and related rows (DB cascades).
 * Clears session cookies and signs out (redirects to home).
 */
export async function deleteAccountAction(): Promise<DeleteAccountResult | void> {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return { ok: false, error: "You are not signed in." };
  }
  if (isAdminSession(session)) {
    return {
      ok: false,
      error:
        "Administrator accounts cannot be deleted from the app. Change or remove ADMIN_EMAIL on the server first.",
    };
  }

  const userId = session.user.id;

  try {
    await db.delete(usageEvents).where(eq(usageEvents.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  } catch (e) {
    console.error("[account] delete failed", e);
    return {
      ok: false,
      error: "Could not delete your account. Try again or contact support.",
    };
  }

  await clearAuthSessionCookies();
  await signOut({ redirectTo: "/" });
}
