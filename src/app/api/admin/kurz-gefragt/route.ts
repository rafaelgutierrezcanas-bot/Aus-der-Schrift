import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const items = await client.fetch(`
    *[_type == "kurzGefragt"] | order(publishedAt desc) {
      _id,
      questionDe,
      questionEn,
      slug,
      slugEn,
      publishedAt,
      status,
      verdict,
      "category": category->{ _id, titleDe, slug }
    }
  `);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "kurzGefragt", ...body });

  revalidateTag("kurzGefragt", "default");
  revalidatePath("/de/kurz-gefragt");
  revalidatePath("/en/kurz-gefragt");

  return NextResponse.json(doc, { status: 201 });
}
