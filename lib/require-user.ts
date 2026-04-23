import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function requireUser(): Promise<
  | { userId: string; error: null }
  | { userId: null; error: NextResponse }
> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return {
      userId: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { userId, error: null };
}
