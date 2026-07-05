import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { groq } from "next-sanity";

const previewQuery = groq`
  *[_type == "article" && slug.current == $slug && (status == "published" || !defined(status))][0] {
    titleDe, titleEn, excerptDe, excerptEn, publishedAt,
    "category": category->{ titleDe, titleEn }
  }
`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const article = await client.fetch(previewQuery, { slug }, { next: { revalidate: 300 } });
    if (!article) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
