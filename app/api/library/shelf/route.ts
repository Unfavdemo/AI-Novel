import {
  fetchPurchasedBooks,
  fetchSavedBooks,
} from "@/lib/server/library-shelf";
import { safeAuth } from "@/lib/server/safe-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await safeAuth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [purchased, saved] = await Promise.all([
    fetchPurchasedBooks(session.user.id),
    fetchSavedBooks(session.user.id),
  ]);

  return NextResponse.json({ purchased, saved });
}
