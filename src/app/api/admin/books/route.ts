import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const books = await client.fetch(`
    *[_type == "bookRecommendation"] | order(_createdAt desc) {
      _id, title, author, year, difficulty, topics, buyLink, coverImage,
      description
    }
  `);
  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "bookRecommendation", ...body });
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json(doc, { status: 201 });
}
