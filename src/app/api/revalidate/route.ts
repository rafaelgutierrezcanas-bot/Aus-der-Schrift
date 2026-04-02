import { revalidatePath } from "next/cache";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  // Optional: verify a secret to prevent abuse
  const secret = req.nextUrl.searchParams.get("secret");
  const expectedSecret = process.env.REVALIDATE_SECRET;

  if (expectedSecret && secret !== expectedSecret) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    // Revalidate all pages
    revalidatePath("/", "layout");
    return Response.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch (err) {
    return Response.json(
      { error: "Revalidation failed", details: String(err) },
      { status: 500 }
    );
  }
}

// Also allow GET for easy testing
export async function GET(req: NextRequest) {
  return POST(req);
}
