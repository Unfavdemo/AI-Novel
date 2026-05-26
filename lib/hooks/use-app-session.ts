"use client";

import { useInitialSession } from "@/components/auth/auth-session-provider";
import { useSession } from "next-auth/react";

/**
 * Unified client session: merges server session from layout with Auth.js client state.
 * Use `isSignedIn` for UI gates; avoids showing "Sign in" while the session is still loading.
 */
export function useAppSession() {
  const initialSession = useInitialSession();
  const { data: clientSession, status, update } = useSession();

  const session = clientSession ?? initialSession;
  const isSignedIn = Boolean(session?.user);
  const isLoading = status === "loading" && !session?.user;

  return { session, status, isLoading, isSignedIn, refresh: update };
}
