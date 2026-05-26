import { safeAuth } from "@/lib/server/safe-auth";
import { getAdminEmailLowercase, isAdminSession } from "@/lib/server/is-admin";
import { redirect } from "next/navigation";

export default async function AdminEntryPage() {
  const adminEmail = getAdminEmailLowercase();
  if (!adminEmail) {
    redirect("/");
  }

  const session = await safeAuth();
  const isAdmin = isAdminSession(session);
  if (!isAdmin) {
    redirect("/auth/signin?callbackUrl=/studio");
  }

  redirect("/studio");
}
