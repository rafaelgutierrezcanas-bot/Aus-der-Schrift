import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const item = await client.fetch(
    `*[_type == "infografik" && _id == $id][0] {
      _id, title, description, publishedAt, topics, articleSlug,
      "imageUrl": image.asset->url
    }`,
    { id }
  );
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const { imageRef, ...rest } = body;

  const patch = writeClient.patch(id).set(rest);
  if (imageRef) patch.set({ image: imageRef });
  const doc = await patch.commit();

  revalidatePath("/de/ressourcen/infografiken");
  revalidatePath("/en/ressourcen/infografiken");
  return NextResponse.json(doc);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/de/ressourcen/infografiken");
  revalidatePath("/en/ressourcen/infografiken");
  return NextResponse.json({ deleted: true });
}
