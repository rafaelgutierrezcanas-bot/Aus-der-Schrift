import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const items = await client.fetch(`
    *[_type == "infografik"] | order(publishedAt desc) {
      _id, title, description, publishedAt, topics, articleSlug,
      "imageUrl": image.asset->url
    }
  `);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const { imageRef, ...rest } = body;
  const doc = await writeClient.create({
    _type: "infografik",
    ...rest,
    ...(imageRef ? { image: imageRef } : {}),
  });
  revalidatePath("/de/ressourcen/infografiken");
  revalidatePath("/en/ressourcen/infografiken");
  return NextResponse.json(doc, { status: 201 });
}
