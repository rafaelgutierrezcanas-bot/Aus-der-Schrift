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

  const projects = await client.fetch(`
    *[_type == "project"] | order(title asc) {
      _id, title, description, slug
    }
  `);
  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "project", ...body });
  return NextResponse.json(doc, { status: 201 });
}
