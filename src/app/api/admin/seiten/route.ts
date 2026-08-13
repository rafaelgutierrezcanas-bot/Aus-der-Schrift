import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const items = await client.fetch(`
    *[_type == "page"] | order(_updatedAt desc) {
      _id, titleDe, titleEn, slug, _updatedAt
    }
  `);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "page", ...body });

  revalidateTag("pages", "default");

  return NextResponse.json(doc, { status: 201 });
}
