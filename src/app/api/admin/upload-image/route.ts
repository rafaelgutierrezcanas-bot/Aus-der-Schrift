import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ]);

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });

  if (!file.type || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Ungültiger Dateityp" }, { status: 415 });
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Datei zu groß (max. 10 MB)" }, { status: 413 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let asset;
  try {
    asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });
  } catch (err) {
    console.error("[upload-image] Sanity upload failed:", err);
    return NextResponse.json({ error: "Upload fehlgeschlagen" }, { status: 502 });
  }

  return NextResponse.json({
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  });
}
