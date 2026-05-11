"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

const GUEST_EMAIL = "guest@local.ainovel";
const DEMO_AUTHOR_EMAIL = "demo-author@example.invalid";

export type RegisterState =
  | undefined
  | { ok: false; error: string };

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return "/library";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/library";
  if (raw === "/studio") return "/library";
  return raw;
}

function reservedReason(email: string): string | null {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (admin && email === admin) {
    return "That address is reserved for the site administrator.";
  }
  if (email === GUEST_EMAIL) {
    return "That address is reserved. Choose a different email.";
  }
  if (email === DEMO_AUTHOR_EMAIL) {
    return "That address is reserved for demo catalog data.";
  }
  return null;
}

export async function registerAction(
  _prev: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const nameRaw = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  const redirectTo = safeRedirectPath(formData.get("callbackUrl"));

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (password.length < 10) {
    return { ok: false, error: "Password must be at least 10 characters." };
  }
  if (password !== confirm) {
    return { ok: false, error: "Passwords do not match." };
  }

  const reserved = reservedReason(email);
  if (reserved) {
    return { ok: false, error: reserved };
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const passwordHash = await hashPassword(password);
  const displayName = nameRaw || email.split("@")[0] || "Reader";

  try {
    await db.insert(users).values({
      name: displayName,
      email,
      passwordHash,
    });
  } catch {
    return { ok: false, error: "Could not create account. Try again." };
  }

  redirect(
    `/auth/signin?registered=1&callbackUrl=${encodeURIComponent(redirectTo)}`,
  );
}
