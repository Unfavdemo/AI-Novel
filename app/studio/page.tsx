import { safeAuth } from "@/lib/server/safe-auth";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { getAdminEmailLowercase, isAdminSession } from "@/lib/server/is-admin";
import { redirect } from "next/navigation";

export default async function StudioPage() {
  const adminEmail = getAdminEmailLowercase();
  if (!adminEmail) {
    redirect("/");
  }

  const session = await safeAuth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/studio");
  }
  if (!isAdminSession(session)) {
    redirect("/admin/login?callbackUrl=/studio");
  }

  return <Dashboard />;
}
