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

  const sources = await client.fetch(`
    *[_type == "source"] | order(authors asc) {
      _id, type, authors, title, year, publisher, doi, isbn, url, pages, notes, fileLink
    }
  `);
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  // Strip empty strings — Sanity url fields reject them
  const cleaned = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  const doc = await writeClient.create({ _type: "source", ...cleaned });
  return NextResponse.json(doc, { status: 201 });
}
