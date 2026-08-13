import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const item = await client.fetch(`
    *[_type == "kurzGefragt" && _id == $id][0] {
      _id,
      questionDe,
      questionEn,
      slug,
      slugEn,
      publishedAt,
      status,
      verdict,
      shortAnswerDe,
      shortAnswerEn,
      bodyDe,
      bodyEn,
      language,
      "category": category->{ _id, titleDe, slug },
      "relatedArticles": relatedArticles[]->{ _id, titleDe, slug },
      "relatedQuestions": relatedQuestions[]->{ _id, questionDe, slug }
    }
  `, { id });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();

  const existing = await client.fetch(
    `*[_type == "kurzGefragt" && _id == $id][0]{ _id }`,
    { id }
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(existing._id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();

  const slug = (updated as Record<string, unknown>).slug as { current?: string } | undefined;
  revalidateTag("kurzGefragt", "default");
  revalidatePath("/de/kurz-gefragt");
  revalidatePath("/en/kurz-gefragt");
  if (slug?.current) {
    revalidatePath(`/de/kurz-gefragt/${slug.current}`);
    revalidatePath(`/en/kurz-gefragt/${slug.current}`);
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const existing = await client.fetch(
    `*[_type == "kurzGefragt" && _id == $id][0]{ _id }`,
    { id }
  );
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeClient.delete(existing._id);

  revalidateTag("kurzGefragt", "default");
  revalidatePath("/de/kurz-gefragt");
  revalidatePath("/en/kurz-gefragt");

  return NextResponse.json({ deleted: true });
}
