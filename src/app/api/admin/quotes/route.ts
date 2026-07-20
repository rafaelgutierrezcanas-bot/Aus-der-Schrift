import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const quotes = await client.fetch(`
    *[_type == "quote"] | order(_createdAt desc) {
      _id, text, author, topics, customSource,
      "source": source->{ _id, title, author, year }
    }
  `);
  return NextResponse.json(quotes);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "quote", ...body });
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json(doc, { status: 201 });
}
