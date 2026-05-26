import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function getAdminEmailFromEnv(): string | null {
  const raw = process.env.ADMIN_EMAIL?.trim();
  return raw || null;
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = getAdminEmailFromEnv();
  if (!adminEmail) return false;
  return email.trim().toLowerCase() === adminEmail.toLowerCase();
}

/** Validates ADMIN_EMAIL + ADMIN_PASSWORD and returns a persisted user row. */
export async function authorizeAdminEnvCredentials(
  emailRaw: string,
  passwordRaw: string,
): Promise<{ id: string; name: string; email: string } | null> {
  const adminEmail = getAdminEmailFromEnv();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPassword) return null;

  if (emailRaw.trim().toLowerCase() !== adminEmail.toLowerCase()) return null;
  if (passwordRaw !== adminPassword) return null;

  try {
    const [existing] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    if (existing) {
      return {
        id: existing.id,
        name: existing.name ?? "Admin",
        email: existing.email ?? adminEmail,
      };
    }

    const [created] = await db
      .insert(users)
      .values({
        name: "Admin",
        email: adminEmail,
      })
      .returning({ id: users.id, name: users.name, email: users.email });

    if (!created) return null;
    return {
      id: created.id,
      name: created.name ?? "Admin",
      email: created.email ?? adminEmail,
    };
  } catch (err) {
    console.error("[auth] database error during admin sign-in:", err);
    return null;
  }
}
