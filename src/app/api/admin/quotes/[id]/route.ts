import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const quote = await client.fetch(
    `*[_type == "quote" && _id == $id][0]{ _id, text, author, topics, customSource, "source": source->{ _id, title, author, year } }`,
    { id }
  );
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
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
