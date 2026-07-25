import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

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
      status,
      "category": category->{ _id, titleDe, slug },
      "project": project->{ _id, title }
    }
  `);
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "article", ...body });

  revalidateTag("articles", "default");
  revalidatePath("/de/blog");
  revalidatePath("/en/blog");
  revalidatePath("/de");
  revalidatePath("/en");

  return NextResponse.json(doc, { status: 201 });
}
