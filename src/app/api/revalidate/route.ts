import { revalidatePath } from "next/cache";
import { timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (!expectedSecret || !secret || !safeCompare(secret, expectedSecret)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    revalidatePath("/", "layout");
    return Response.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch {
    return Response.json({ error: "Revalidation failed" }, { status: 500 });
  }
}
