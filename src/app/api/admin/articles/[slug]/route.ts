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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { slug } = await params;
  const article = await client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      language,
      status,
      excerptDe,
      excerptEn,
      featuredImage,
      bodyDe,
      bodyEn,
      "category": category->{ _id, titleDe, slug },
      "author": author->{ _id, name },
      "project": project->{ _id, title },
      "sources": sources[]->{ _id, title, authors, year, type }
    }
  `, { slug });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { slug } = await params;
  const body = await request.json();

  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Separate null values (must use unset) from regular values
  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(article._id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();
  return NextResponse.json(updated);
}
