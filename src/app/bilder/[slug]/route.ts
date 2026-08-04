import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const result = await client.fetch<{ url: string } | null>(
    `*[_type == "infografik" && slug.current == $slug][0]{
      "url": image.asset->url
    }`,
    { slug }
  );

  if (!result?.url) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Fetch the original image from Sanity CDN at high resolution
  const imageResponse = await fetch(result.url + "?w=2400&fit=max&auto=format");

  if (!imageResponse.ok) {
    return new NextResponse("Image fetch failed", { status: 502 });
  }

  const contentType = imageResponse.headers.get("content-type") || "image/png";
  const body = imageResponse.body;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Disposition": `inline; filename="${slug}.png"`,
    },
  });
}
