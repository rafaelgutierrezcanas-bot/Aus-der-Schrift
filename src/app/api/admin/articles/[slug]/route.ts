import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      language,
      excerptDe,
      excerptEn,
      featuredImage,
      bodyDe,
      bodyEn,
      "category": category->{ _id, titleDe, slug },
      "author": author->{ _id, name }
    }
  `, { slug });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json();

  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await writeClient.patch(article._id).set(body).commit();
  return NextResponse.json(updated);
}
