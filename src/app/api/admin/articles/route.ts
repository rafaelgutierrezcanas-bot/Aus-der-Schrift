import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

export async function GET() {
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
  const body = await request.json();
  const doc = await writeClient.create({ _type: "article", ...body });
  return NextResponse.json(doc, { status: 201 });
}
