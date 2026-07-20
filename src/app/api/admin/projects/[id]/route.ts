import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const updated = await writeClient.patch(id).set(body).commit();
  revalidatePath("/", "layout");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;

  // Check if any articles reference this project
  const count = await client.fetch(`count(*[_type == "article" && project._ref == $id])`, { id });
  if (count > 0) {
    return NextResponse.json(
      { error: `Dieses Projekt wird von ${count} Artikel(n) verwendet und kann nicht gelöscht werden.` },
      { status: 409 }
    );
  }

  await writeClient.delete(id);
  return NextResponse.json({ ok: true });
}
