"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { createContext, useContext } from "react";

const InitialSessionContext = createContext<Session | null>(null);

export function useInitialSession(): Session | null {
  return useContext(InitialSessionContext);
}

/** Bridges the server session from the root layout into client hooks. */
export function AuthSessionProvider({
  session,
  children,
}: {
  session: Session | null;
  children: React.ReactNode;
}) {
  return (
    <InitialSessionContext.Provider value={session}>
      <SessionProvider session={session} refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </InitialSessionContext.Provider>
  );
}
