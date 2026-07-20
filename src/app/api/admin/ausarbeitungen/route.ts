import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const items = await client.fetch(`
    *[_type == "ausarbeitung"] | order(publishedAt desc) {
      _id, title, description, publishedAt, topics,
      "fileUrl": file.asset->url
    }
  `);
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const { fileAssetId, ...rest } = body;
  const doc = await writeClient.create({
    _type: "ausarbeitung",
    ...rest,
    ...(fileAssetId ? {
      file: { _type: "file", asset: { _type: "reference", _ref: fileAssetId } },
    } : {}),
  });
  revalidatePath("/de/ressourcen/ausarbeitungen");
  revalidatePath("/en/ressourcen/ausarbeitungen");
  return NextResponse.json(doc, { status: 201 });
}
