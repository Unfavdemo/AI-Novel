import { auth } from "@/auth";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { redirect } from "next/navigation";

export default async function StudioPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/studio");
  }
  return <Dashboard />;
}
