import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const page = await client.fetch(
    `*[_type == "page" && _id == $id][0]{ _id, "slug": slug.current, titleDe, titleEn, bodyDe, bodyEn }`,
    { id }
  );
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(page);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();

  // Revalidate all page routes
  const slug = (await client.fetch(`*[_type == "page" && _id == $id][0].slug.current`, { id })) as string | null;
  if (slug) {
    revalidatePath(`/de/${slug}`);
    revalidatePath(`/en/${slug}`);
  }
  return NextResponse.json(updated);
}
