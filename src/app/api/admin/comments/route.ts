import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const articleId = request.nextUrl.searchParams.get("articleId");

  const filter = articleId
    ? `_type == "comment" && article._ref == $articleId`
    : `_type == "comment"`;

  const params = articleId ? { articleId } : {};

  const comments = await client.fetch(
    `*[${filter}] | order(_createdAt desc) {
      _id, "articleId": article._ref, authorName, authorEmail, body, status, _createdAt
    }`,
    params
  );

  return NextResponse.json(comments);
}
