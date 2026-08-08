import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const pages = await client.fetch(`
    *[_type == "page"] | order(titleDe asc) {
      _id, "slug": slug.current, titleDe, titleEn
    }
  `);
  return NextResponse.json(pages);
}
