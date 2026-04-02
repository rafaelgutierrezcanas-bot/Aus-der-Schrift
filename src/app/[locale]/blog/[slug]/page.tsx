import { client } from "@/sanity/client";
import { articleBySlugQuery, allArticleSlugsQuery, relatedArticlesQuery } from "@/sanity/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { ArticleCard } from "@/components/ArticleCard";
import { urlFor } from "@/sanity/image";
import { formatDate, getLocalizedTitle, getLocalizedCategoryTitle } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { notFound } from "next/navigation";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(allArticleSlugsQuery);
    return (slugs as Array<{ slug: string }>).map(({ slug }) => ({ slug }));
  } catch {
    return [];
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let article: Record<string, unknown> | null = null;
  try {
    article = await client.fetch(articleBySlugQuery, { slug });
  } catch {
    notFound();
  }
  if (!article) notFound();

  const t = await getTranslations("article");
  const title = getLocalizedTitle(article, locale);
  const body = (locale === "en" && article.bodyEn
    ? article.bodyEn
    : article.bodyDe) as unknown[];
  const category = article.category as Record<string, unknown> | null;
  const categoryTitle = getLocalizedCategoryTitle(category, locale);

  let related: Record<string, unknown>[] = [];
  try {
    const catSlug = (category?.slug as { current: string })?.current;
    if (catSlug) {
      related = await client.fetch(relatedArticlesQuery, {
        categorySlug: catSlug,
        currentSlug: slug,
      });
    }
  } catch {
    related = [];
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {/* Article Header */}
      <header className="max-w-prose mx-auto mb-12">
        <div className="flex items-center flex-wrap gap-3 mb-6">
          {categoryTitle && (
            <span
              className="text-xs font-medium text-accent uppercase tracking-wider"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {categoryTitle}
            </span>
          )}
          {!!article.publishedAt && (
            <span
              className="text-xs text-muted"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {formatDate(article.publishedAt as string, locale)}
            </span>
          )}
          {!!(article.author as Record<string, unknown> | null)?.name && (
            <span
              className="text-xs text-muted"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              · {(article.author as Record<string, unknown>).name as string}
            </span>
          )}
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h1>
        {!!article.featuredImage && (
          <div className="aspect-[16/9] overflow-hidden rounded-sm mb-8">
            <Image
              src={urlFor(article.featuredImage).width(1200).url()}
              alt={title}
              width={1200}
              height={675}
              className="object-cover w-full h-full"
            />
          </div>
        )}
      </header>

      {/* Article Body with ToC */}
      <div className="flex items-start">
        <div className="max-w-prose mx-auto flex-1 min-w-0">
          {body && body.length > 0 && <PortableTextRenderer value={body} />}
        </div>
        {body && body.length > 0 && (
          <TableOfContents
            body={body as Parameters<typeof TableOfContents>[0]["body"]}
            label={locale === "de" ? "Inhalt" : "Contents"}
          />
        )}
      </div>

      {/* Related Posts */}
      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border max-w-prose mx-auto">
          <h2
            className="text-xl font-semibold mb-8"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t("relatedPosts")}
          </h2>
          <div className="space-y-8">
            {related.map((r) => (
              <ArticleCard key={r._id as string} article={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
