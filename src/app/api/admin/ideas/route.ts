import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

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
