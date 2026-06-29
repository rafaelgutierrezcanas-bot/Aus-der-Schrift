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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const asset = await writeClient.assets.upload("file", buffer, {
    filename: file.name,
    contentType: file.type || "application/pdf",
  });

  return NextResponse.json({ _id: asset._id, url: asset.url });
}
