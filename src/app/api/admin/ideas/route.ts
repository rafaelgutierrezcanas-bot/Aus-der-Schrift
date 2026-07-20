import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const ideas = await client.fetch(`
    *[_type == "idea"] | order(createdAt desc) {
      _id, title, notes, createdAt
    }
  `);
  return NextResponse.json(ideas);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({
    _type: "idea",
    ...body,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(doc, { status: 201 });
}
