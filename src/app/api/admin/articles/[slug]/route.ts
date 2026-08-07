import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { requireAuth } from "@/lib/adminAuth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { slug } = await params;
  const article = await client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      language,
      status,
      excerptDe,
      excerptEn,
      featuredImage,
      bodyDe,
      bodyEn,
      "category": category->{ _id, titleDe, slug },
      "author": author->{ _id, name },
      "project": project->{ _id, title },
      "sources": sources[]->{ _id, title, authors, year, type, publisher, volume, issue, city, edition, doi, pages, url },
      entwurf,
      difficulty,
      isPaper,
      abstractDe,
      abstractEn,
      keywords,
      tags,
      bibleReferences
    }
  `, { slug });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { slug } = await params;

  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await writeClient.delete(article._id);

  revalidateTag("articles", "default");
  revalidatePath(`/de/blog/${slug}`);
  revalidatePath(`/en/blog/${slug}`);
  revalidatePath("/de/blog");
  revalidatePath("/en/blog");
  revalidatePath("/de");
  revalidatePath("/en");

  return NextResponse.json({ deleted: true });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { slug } = await params;
  const body = await request.json();

  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{ _id, "hasBodyDe": defined(bodyDe) && count(bodyDe) > 0, "hasBodyEn": defined(bodyEn) && count(bodyEn) > 0 }`,
    { slug }
  );
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Handle slug change: newSlug in body triggers slug rename + old slug tracking
  const { newSlug, ...rest } = body as { newSlug?: string } & Record<string, unknown>;
  if (newSlug && newSlug !== slug) {
    const op = writeClient
      .patch(article._id)
      .setIfMissing({ oldSlugs: [] })
      .append("oldSlugs", [slug])
      .set({ slug: { _type: "slug", current: newSlug } });
    const updated = await op.commit();
    revalidateTag("articles", "default");
    revalidatePath(`/de/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
    revalidatePath(`/de/blog/${newSlug}`);
    revalidatePath(`/en/blog/${newSlug}`);
    revalidatePath("/de/blog");
    revalidatePath("/en/blog");
    revalidatePath("/de");
    revalidatePath("/en");
    return NextResponse.json({ ...updated, newSlug });
  }

  // Guard: never overwrite existing body content with empty/missing data
  for (const field of ["bodyDe", "bodyEn"] as const) {
    const hasExisting = field === "bodyDe" ? article.hasBodyDe : article.hasBodyEn;
    const incoming = rest[field];
    if (hasExisting && (!Array.isArray(incoming) || incoming.length === 0)) {
      delete rest[field]; // keep existing content untouched
    }
  }

  // Separate null values (must use unset) from regular values
  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(rest)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(article._id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();

  // Invalidate page cache immediately
  revalidateTag("articles", "default");
  revalidatePath(`/de/blog/${slug}`);
  revalidatePath(`/en/blog/${slug}`);
  revalidatePath("/de/blog");
  revalidatePath("/en/blog");
  revalidatePath("/de");
  revalidatePath("/en");

  return NextResponse.json(updated);
}
