"use client";

import { AuthSessionProvider } from "@/components/auth/auth-session-provider";
import { SessionSync } from "@/components/auth/session-sync";
import { AppDialogProvider } from "@/components/ui/app-dialog-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { Session } from "next-auth";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <ThemeProvider>
      <AuthSessionProvider session={session}>
        <SessionSync />
        <AppDialogProvider>{children}</AppDialogProvider>
      </AuthSessionProvider>
    </ThemeProvider>
  );
}
