"use server";

import { signIn } from "@/auth";
import { redirect } from "next/navigation";

function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return "/admin";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/admin";
  return raw;
}

export async function signInAsAdmin(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("callbackUrl"));

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=missing_credentials");
  }

  await signIn("admin", {
    redirectTo,
    email,
    password,
  });
}

