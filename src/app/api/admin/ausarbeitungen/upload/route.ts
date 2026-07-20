import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

const ALLOWED_MIME_TYPES = new Set(["application/pdf"]);
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!file.type || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Nur PDF-Dateien erlaubt" }, { status: 415 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Datei zu groß (max. 50 MB)" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let asset;
  try {
    asset = await writeClient.assets.upload("file", buffer, {
      filename: file.name,
      contentType: "application/pdf",
    });
  } catch (err) {
    console.error("[ausarbeitungen/upload] Sanity upload failed:", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 502 });
  }

  return NextResponse.json({ _id: asset._id, url: asset.url });
}
