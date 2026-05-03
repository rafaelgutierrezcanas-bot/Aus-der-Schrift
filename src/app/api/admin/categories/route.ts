import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const categories = await client.fetch(`
    *[_type == "category"] | order(titleDe asc) {
      _id,
      titleDe,
      slug
    }
  `);
  return NextResponse.json(categories);
}
