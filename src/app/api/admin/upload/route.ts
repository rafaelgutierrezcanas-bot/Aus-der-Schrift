import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.type || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Ungültiger Dateityp" }, { status: 415 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Datei zu groß (max. 10 MB)" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let asset;
  try {
    asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });
  } catch (err) {
    console.error("[upload] Sanity upload failed:", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 502 });
  }

  return NextResponse.json({ _ref: asset._id, url: asset.url });
}
