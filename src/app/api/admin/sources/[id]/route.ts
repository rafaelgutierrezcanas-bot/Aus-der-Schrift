import { NextRequest, NextResponse } from "next/server";
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
  // Strip empty strings — Sanity url fields reject them
  const cleaned = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  const doc = await writeClient.patch(id).set(cleaned).commit();
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
  return NextResponse.json({ ok: true });
}
