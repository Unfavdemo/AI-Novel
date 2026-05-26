"use client";

import { useAppSession } from "@/lib/hooks/use-app-session";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/** Refreshes server-rendered layout (header) when client session becomes active. */
export function SessionSync() {
  const router = useRouter();
  const { isSignedIn } = useAppSession();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (isSignedIn && !wasSignedIn.current) {
      router.refresh();
    }
    wasSignedIn.current = isSignedIn;
  }, [isSignedIn, router]);

  return null;
}
