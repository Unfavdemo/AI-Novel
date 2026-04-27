"use server";

import { signIn } from "@/auth";

function safeRedirectPath(raw: unknown): string {
  if (typeof raw !== "string") return "/library";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/library";
  return raw;
}

export async function signInWithGithub(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("callbackUrl"));
  await signIn("github", { redirectTo });
}
