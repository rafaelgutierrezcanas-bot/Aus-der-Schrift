import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const item = await client.fetch(
    `*[_type == "ausarbeitung" && _id == $id][0]{ _id, title, description, publishedAt, topics, "fileUrl": file.asset->url, file }`,
    { id }
  );
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const { fileAssetId, ...rest } = body;
  const processed = {
    ...rest,
    ...(fileAssetId ? {
      file: { _type: "file", asset: { _type: "reference", _ref: fileAssetId } },
    } : {}),
  };
  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(processed)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();
  revalidatePath("/de/ressourcen/ausarbeitungen");
  revalidatePath("/en/ressourcen/ausarbeitungen");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/de/ressourcen/ausarbeitungen");
  revalidatePath("/en/ressourcen/ausarbeitungen");
  return NextResponse.json({ deleted: true });
}
