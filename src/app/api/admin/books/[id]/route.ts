import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const book = await client.fetch(
    `*[_type == "bookRecommendation" && _id == $id][0]`,
    { id }
  );
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(book);
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
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json({ deleted: true });
}
