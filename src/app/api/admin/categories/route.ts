import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const categories = await client.fetch(`
    *[_type == "category"] | order(titleDe asc) {
      _id,
      titleDe,
      slug
    }
  `);
  return NextResponse.json(categories);
}
