import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

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

  const articles = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      language,
      "category": category->{ _id, titleDe, slug }
    }
  `);
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "article", ...body });
  return NextResponse.json(doc, { status: 201 });
}
