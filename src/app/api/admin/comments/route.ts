import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

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
