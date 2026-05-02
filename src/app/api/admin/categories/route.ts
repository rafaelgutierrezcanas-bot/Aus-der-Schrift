import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

export async function GET() {
  const categories = await client.fetch(`
    *[_type == "category"] | order(titleDe asc) {
      _id,
      titleDe,
      slug
    }
  `);
  return NextResponse.json(categories);
}
