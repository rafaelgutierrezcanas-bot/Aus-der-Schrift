import { client } from "@/sanity/client";
import { articleBySlugQuery, allArticleSlugsQuery, relatedArticlesQuery } from "@/sanity/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { ArticleCard } from "@/components/ArticleCard";
import { urlFor } from "@/sanity/image";
import { formatDate, getLocalizedTitle, getLocalizedCategoryTitle, getLocalizedExcerpt, estimateReadingTime } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import type { Metadata } from "next";
import Script from "next/script";
import { absoluteUrl, getLocaleAlternates, localePath, SITE_NAME } from "@/lib/site";
import { formatChicago, type Source } from "@/lib/formatChicago";

export const revalidate = 60;
export const dynamicParams = true;

interface FootnoteNode {
  _type: "footnote";
  _key: string;
  sourceId?: string | null;
  text?: string;
  pages?: string;
  _fnIndex?: number;
}

function annotateFootnotes(body: unknown[]): { annotated: unknown[]; footnotes: FootnoteNode[] } {
  let count = 0;
  const footnotes: FootnoteNode[] = [];
  const annotated = (body as Record<string, unknown>[]).map((block) => {
    if (block._type === "block" && Array.isArray(block.children)) {
      const children = (block.children as Record<string, unknown>[]).map((child) => {
        if (child._type === "footnote") {
          count++;
          const fn = { ...child, _fnIndex: count } as FootnoteNode;
          footnotes.push(fn);
          return fn;
        }
        return child;
      });
      return { ...block, children };
    }
    return block;
  });
  return { annotated, footnotes };
}

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(allArticleSlugsQuery);
    const locales = ["de", "en"];
    return locales.flatMap((locale) =>
      (slugs as Array<{ slug: string }>).map(({ slug }) => ({ locale, slug }))
    );
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  try {
    const article = await client.fetch(articleBySlugQuery, { slug });
    if (!article) {
      return {
        title: "Artikel nicht gefunden",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const title = getLocalizedTitle(article, locale);
    const description =
      getLocalizedExcerpt(article, locale) ||
      (locale === "de"
        ? "Artikel auf Theologik zu Theologie, Bibelauslegung und Kirchengeschichte."
        : "Article on Theologik about theology, biblical interpretation, and church history.");
    const imageUrl = article.featuredImage
      ? urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(1200).height(630).url()
      : undefined;
    const path = localePath(locale, `/blog/${slug}`);

    return {
      title,
      description,
      keywords: [
        title,
        "Theologik",
        "Theologie",
        "Bibelauslegung",
        "Kirchengeschichte",
      ],
      alternates: {
        canonical: path,
        ...getLocaleAlternates(`/blog/${slug}`),
      },
      openGraph: {
        type: "article",
        title,
        description,
        url: absoluteUrl(path),
        siteName: SITE_NAME,
        locale: locale === "de" ? "de_DE" : "en_US",
        publishedTime: article.publishedAt as string | undefined,
        images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : undefined,
      },
    };
  } catch {
    return {
      title: "Artikel nicht gefunden",
      robots: {
        index: false,
        follow: false,
      },
    };
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
  const rawBody = (locale === "en" && article.bodyEn
    ? article.bodyEn
    : article.bodyDe) as unknown[];
  const { annotated: body, footnotes } = annotateFootnotes(rawBody ?? []);
  const sourcesMap = new Map<string, Source>(
    ((article.sources ?? []) as Source[]).map((s) => [s._id, s])
  );
  const excerpt = getLocalizedExcerpt(article, locale);
  const category = article.category as Record<string, unknown> | null;
  const categoryTitle = getLocalizedCategoryTitle(category, locale);
  const categorySlug = (category?.slug as { current: string })?.current;
  const imageUrl = article.featuredImage
    ? urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(1200).height(675).url()
    : undefined;
  const readingTime = estimateReadingTime(body || []);

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

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt || title,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: absoluteUrl(`/${locale}/blog/${slug}`),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    timeRequired: `PT${readingTime}M`,
    articleSection: categoryTitle || undefined,
    author: (article.author as Record<string, unknown> | null)?.name
      ? {
          "@type": "Person",
          name: (article.author as Record<string, unknown>).name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl(),
    },
    image: imageUrl ? [imageUrl] : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "de" ? "Startseite" : "Home",
        item: absoluteUrl(`/${locale}`),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: absoluteUrl(`/${locale}/blog`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: absoluteUrl(`/${locale}/blog/${slug}`),
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <Script
        id={`schema-article-${locale}-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id={`schema-breadcrumb-${locale}-${slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ReadingProgressBar />
      {/* Article Header */}
      <header className="max-w-prose mx-auto mb-12">
        <div className="flex items-center flex-wrap gap-3 mb-6">
          {categoryTitle && (
            categorySlug ? (
              <Link
                href={`/${locale}/kategorien/${categorySlug}`}
                className="text-xs font-medium text-accent uppercase tracking-wider hover:underline"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {categoryTitle}
              </Link>
            ) : (
              <span
                className="text-xs font-medium text-accent uppercase tracking-wider"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {categoryTitle}
              </span>
            )
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

      {/* Footnotes */}
      {footnotes.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border max-w-prose mx-auto">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-4" style={{ fontFamily: "var(--font-sans)" }}>
            {locale === "de" ? "Fußnoten" : "Footnotes"}
          </p>
          <ol className="space-y-2">
            {footnotes.map((fn) => {
              const src = fn.sourceId ? sourcesMap.get(fn.sourceId) : null;
              const citation = src ? formatChicago(src, fn.pages) : (fn.text || "—");
              return (
                <li key={fn._key} className="flex gap-3 text-sm text-muted leading-relaxed">
                  <span className="shrink-0 text-accent font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                    [{fn._fnIndex}]
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)" }}>{citation}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

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
