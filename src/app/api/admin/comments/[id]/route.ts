import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status?: string };

  if (!status || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const updated = await writeClient.patch(id).set({ status }).commit();
  revalidatePath("/", "layout");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
