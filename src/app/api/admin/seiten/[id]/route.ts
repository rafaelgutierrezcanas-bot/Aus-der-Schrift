import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const item = await client.fetch(`
    *[_type == "page" && _id == $id][0] {
      _id, titleDe, titleEn, slug, bodyDe, bodyEn
    }
  `, { id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();

  const existing = await client.fetch(
    `*[_type == "page" && _id == $id][0]{ _id }`,
    { id }
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(existing._id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();

  revalidateTag("pages", "default");

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const existing = await client.fetch(
    `*[_type == "page" && _id == $id][0]{ _id }`,
    { id }
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeClient.delete(existing._id);

  revalidateTag("pages", "default");

  return NextResponse.json({ deleted: true });
}
