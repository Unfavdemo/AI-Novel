"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return "/library";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/library";
  // Studio is admin-only; guests must not land there after sign-in.
  if (raw === "/studio") return "/library";
  return raw;
}

export async function signInAsGuest(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("callbackUrl"));
  const guestAllowed =
    process.env.ALLOW_GUEST_AUTH === "true" || process.env.NODE_ENV !== "production";
  if (!guestAllowed) {
    redirect("/auth/signin?error=guest_disabled");
  }
  await signIn("guest", { redirectTo });
}

export async function signInWithUserPassword(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("callbackUrl"));
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) {
    redirect("/auth/signin?error=missing_credentials");
  }
  await signIn("user", {
    redirectTo,
    email,
    password,
  });
}
