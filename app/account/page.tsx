import { AccountClient } from "@/app/account/account-client";
import { safeAuth } from "@/lib/server/safe-auth";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const session = await safeAuth();
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  return (
    <AccountClient
      name={session.user.name}
      email={session.user.email}
      isAdmin={session.user.isAdmin === true}
    />
  );
}
