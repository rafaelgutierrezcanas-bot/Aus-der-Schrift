import { client } from "@/sanity/client";
import { articleBySlugQuery, allArticleSlugsQuery, relatedArticlesQuery, backlinksQuery, seriesArticlesQuery } from "@/sanity/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { TableOfContents } from "@/components/TableOfContents";
import { ArticleCard } from "@/components/ArticleCard";
import { urlFor } from "@/sanity/image";
import { formatDate, getLocalizedTitle, getLocalizedCategoryTitle, getLocalizedExcerpt, estimateReadingTime } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
import { ShareButton } from "@/components/ShareButton";
import { CiteButton } from "@/components/CiteButton";
import type { Metadata } from "next";
import Script from "next/script";
import { absoluteUrl, getLocaleAlternates, localePath, SITE_NAME } from "@/lib/site";
import { formatChicago, type Source } from "@/lib/formatChicago";
import { injectBibleReferences } from "@/lib/injectBibleReferences";
import { PaperLayout } from "@/components/PaperLayout";
import { CommentsSection } from "@/components/CommentsSection";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AuthorCard } from "@/components/AuthorCard";
import { BackToTop } from "@/components/BackToTop";
import { MobileTableOfContents } from "@/components/MobileTableOfContents";
import { FontSizeControls } from "@/components/FontSizeControls";
import { SeriesNavigation } from "@/components/SeriesNavigation";

export const revalidate = 3600;
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

  function processBlocks(blocks: Record<string, unknown>[]): Record<string, unknown>[] {
    return blocks.map((block) => {
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
      if (block._type === "excursus" && Array.isArray(block.content)) {
        return { ...block, content: processBlocks(block.content as Record<string, unknown>[]) };
      }
      return block;
    });
  }

  const annotated = processBlocks(body as Record<string, unknown>[]);
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
    const article = await client.fetch(articleBySlugQuery, { slug }, { next: { tags: ["articles", `article-${slug}`], revalidate: 60 } });
    if (!article) {
      return {
        title: "Artikel nicht gefunden",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const displayTitle = getLocalizedTitle(article, locale);
    const seoTitle = (locale === "en" && article.seoTitleEn
      ? article.seoTitleEn
      : article.seoTitleDe || displayTitle) as string;
    const description =
      getLocalizedExcerpt(article, locale) ||
      (locale === "de"
        ? "Artikel auf Theologik zu Theologie, Bibelauslegung und Kirchengeschichte."
        : "Article on Theologik about theology, biblical interpretation, and church history.");
    const imageUrl = article.featuredImage
      ? urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(1200).height(630).url()
      : undefined;
    const path = localePath(locale, `/blog/${slug}`);

    const authorName = (article.author as { name?: string } | null)?.name ?? "Rafael Gutierrez";

    return {
      title: seoTitle,
      description,
      authors: [{ name: authorName, url: absoluteUrl(`/${locale}/zu-meiner-person`) }],
      alternates: {
        canonical: path,
        ...getLocaleAlternates(`/blog/${slug}`),
      },
      openGraph: {
        type: "article",
        title: seoTitle,
        description,
        url: absoluteUrl(path),
        siteName: SITE_NAME,
        locale: locale === "de" ? "de_DE" : "en_US",
        publishedTime: article.publishedAt as string | undefined,
        modifiedTime: (article._updatedAt ?? article.publishedAt) as string | undefined,
        authors: [authorName],
      },
      twitter: {
        card: "summary_large_image",
        title: seoTitle,
        description,
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
    article = await client.fetch(articleBySlugQuery, { slug }, { next: { tags: ["articles", `article-${slug}`], revalidate: 60 } });
  } catch {
    notFound();
  }
  if (!article) {
    // Check if this slug was previously used by an article that was renamed
    const redirect = await client.fetch<{ slug: { current: string } } | null>(
      `*[_type == "article" && $slug in coalesce(oldSlugs, []) && (status == "published" || !defined(status))][0]{ slug }`,
      { slug }
    );
    if (redirect) permanentRedirect(localePath(locale, `/blog/${redirect.slug.current}`));
    notFound();
  }

  const t = await getTranslations("article");
  const title = getLocalizedTitle(article, locale);
  const rawBody = (locale === "en" && article.bodyEn
    ? article.bodyEn
    : article.bodyDe) as unknown[];
  const { annotated: bodyWithFootnotes, footnotes } = annotateFootnotes(rawBody ?? []);
  const body = injectBibleReferences(bodyWithFootnotes);
  const footnotesMap = new Map<number, string>();
  for (const fn of footnotes) {
    if (fn.text) {
      footnotesMap.set(fn._fnIndex!, fn.text);
    } else if (fn.sourceId) {
      const source = (article.sources as Source[] | undefined)?.find((s) => s._id === fn.sourceId);
      if (source) {
        footnotesMap.set(fn._fnIndex!, formatChicago(source, fn.pages));
      }
    }
  }
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
  const difficulty = article.difficulty as string | undefined;
  const difficultyConfig: Record<string, { de: string; en: string; color: string }> = {
    einfach: { de: "Einfach", en: "Beginner", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    mittel: { de: "Mittel", en: "Intermediate", color: "text-amber-700 bg-amber-50 border-amber-200" },
    anspruchsvoll: { de: "Anspruchsvoll", en: "Advanced", color: "text-rose-700 bg-rose-50 border-rose-200" },
  };
  const readingTime = estimateReadingTime(body || []);

  const project = article.project as { _id: string; title: string; titleEn?: string; slug: { current: string } } | null;

  let related: Record<string, unknown>[] = [];
  let backlinks: Record<string, unknown>[] = [];
  let seriesArticles: Record<string, unknown>[] = [];
  try {
    const catSlug = (category?.slug as { current: string })?.current;
    const [relatedResult, backlinksResult, seriesResult] = await Promise.all([
      catSlug
        ? client.fetch(relatedArticlesQuery, {
            categorySlug: catSlug,
            currentSlug: slug,
          }, { next: { tags: ["articles"], revalidate: 60 } })
        : Promise.resolve([]),
      client.fetch(backlinksQuery, { slug }, { next: { tags: ["articles"], revalidate: 3600 } }),
      project
        ? client.fetch(seriesArticlesQuery, { projectId: project._id }, { next: { tags: ["articles"], revalidate: 60 } })
        : Promise.resolve([]),
    ]);
    related = relatedResult as Record<string, unknown>[];
    backlinks = (backlinksResult as Record<string, unknown>[]) ?? [];
    seriesArticles = (seriesResult as Record<string, unknown>[]) ?? [];
  } catch {
    related = [];
    backlinks = [];
    seriesArticles = [];
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt || title,
    datePublished: article.publishedAt,
    dateModified: article._updatedAt ?? article.publishedAt,
    mainEntityOfPage: absoluteUrl(`/${locale}/blog/${slug}`),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    timeRequired: `PT${readingTime}M`,
    articleSection: categoryTitle || undefined,
    author: (article.author as Record<string, unknown> | null)?.name
      ? {
          "@type": "Person",
          name: (article.author as Record<string, unknown>).name,
          url: absoluteUrl(`/${locale}/zu-meiner-person`),
          sameAs: [
            "https://www.instagram.com/theologik.org",
          ],
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl(),
    },
    image: imageUrl
      ? [
          {
            "@type": "ImageObject",
            url: imageUrl,
            license: "https://creativecommons.org/licenses/by/4.0/",
            acquireLicensePage: absoluteUrl(`/${locale}/infografiken/lizenz`),
            creditText: "Rafael Gutierrez, theologik.org",
            creator: {
              "@type": "Person",
              name: "Rafael Gutierrez",
            },
          },
        ]
      : undefined,
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

  // Paper mode: render academic journal layout
  if (article.isPaper) {
    return (
      <div>
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
        <div className="max-w-2xl mx-auto px-4 pt-6 flex justify-end">
          <a
            href={`/api/pdf/${slug}?locale=${locale}`}
            download
            className="text-xs px-3 py-1.5 rounded border border-border text-muted hover:text-foreground hover:border-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Als PDF herunterladen" : "Download as PDF"}
          </a>
        </div>
        <PaperLayout
          article={article}
          locale={locale}
          body={body}
          footnotes={footnotes}
          sourcesMap={sourcesMap}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
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
      <BackToTop />
      {body && body.length > 0 && (
        <MobileTableOfContents
          body={body as Parameters<typeof MobileTableOfContents>[0]["body"]}
          label={locale === "de" ? "Inhalt" : "Contents"}
        />
      )}
      <Breadcrumb
        items={[
          { label: locale === "de" ? "Startseite" : "Home", href: `/${locale}` },
          { label: locale === "de" ? "Alle Artikel" : "All Articles", href: `/${locale}/blog` },
        ]}
      />
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
          {difficulty && difficultyConfig[difficulty] && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyConfig[difficulty].color}`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "en" ? difficultyConfig[difficulty].en : difficultyConfig[difficulty].de}
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
          className="text-3xl md:text-4xl font-bold leading-tight mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {title}
        </h1>
        {Array.isArray(article.tags) && (article.tags as string[]).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(article.tags as string[]).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        {Array.isArray(article.bibleReferences) && (article.bibleReferences as string[]).length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Bibelstellen" : "Scripture"}
            </span>
            {(article.bibleReferences as string[]).map((ref) => (
              <span
                key={ref}
                className="text-[10px] px-2 py-0.5 rounded-full border border-accent/30 text-accent"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {ref}
              </span>
            ))}
          </div>
        )}
        <div className="mb-6 flex items-center gap-4">
          <ShareButton
            url={absoluteUrl(localePath(locale, `/blog/${slug}`))}
            title={title}
          />
          <CiteButton
            author={(article.author as { name?: string } | null)?.name ?? "Theologik"}
            title={getLocalizedTitle(article, locale)}
            locale={locale}
          />
          <FontSizeControls />
        </div>
        {!!article.featuredImage && (
          <figure className="mb-8">
            <div className="aspect-[16/9] overflow-hidden rounded-sm">
              <Image
                src={urlFor(article.featuredImage).width(1200).url()}
                alt={(article.featuredImage as Record<string, unknown>).alt as string || title}
                width={1200}
                height={675}
                className="object-cover w-full h-full"
              />
            </div>
          </figure>
        )}
      </header>

      {/* Series Navigation (top) */}
      {project && seriesArticles.length > 1 && (
        <SeriesNavigation
          seriesTitle={locale === "en" && project.titleEn ? project.titleEn : project.title}
          articles={seriesArticles as unknown as Parameters<typeof SeriesNavigation>[0]["articles"]}
          currentSlug={slug}
          locale={locale}
        />
      )}

      {/* Article Body with ToC */}
      <div className="flex items-start">
        <div id="article-body" className="prose dark:prose-invert max-w-prose mx-auto flex-1 min-w-0">
          {body && body.length > 0 && <PortableTextRenderer value={body} locale={locale} footnotesMap={footnotesMap} />}
        </div>
        <div className="shrink-0">
          {body && body.length > 0 && (
            <TableOfContents
              body={body as Parameters<typeof TableOfContents>[0]["body"]}
              label={locale === "de" ? "Inhalt" : "Contents"}
            />
          )}
        </div>
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
                <li key={fn._key} id={`fn-${fn._fnIndex}`} className="flex gap-3 text-sm text-muted leading-relaxed">
                  <span className="shrink-0 text-accent font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                    <a href={`#fnref-${fn._fnIndex}`} aria-label={locale === "de" ? "Zurück zum Text" : "Back to text"}>
                      [{fn._fnIndex}]
                    </a>
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)" }}>{citation}</span>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Series Navigation (bottom) */}
      {project && seriesArticles.length > 1 && (
        <SeriesNavigation
          seriesTitle={locale === "en" && project.titleEn ? project.titleEn : project.title}
          articles={seriesArticles as unknown as Parameters<typeof SeriesNavigation>[0]["articles"]}
          currentSlug={slug}
          locale={locale}
        />
      )}

      <AuthorCard locale={locale} />

      {/* Backlinks */}
      {backlinks.length > 0 && (
        <section className="mt-12 pt-8 border-t border-border max-w-prose mx-auto">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Referenziert in" : "Referenced in"}
          </p>
          <ul className="space-y-2">
            {backlinks.map((ref) => (
              <li key={ref._id as string}>
                <Link
                  href={`/${locale}/blog/${(ref.slug as { current: string }).current}`}
                  className="text-sm text-accent hover:underline"
                  style={{ fontFamily: "var(--font-body-serif)" }}
                >
                  {getLocalizedTitle(ref, locale)}
                </Link>
                {typeof ref.publishedAt === "string" && (
                  <span className="text-[11px] text-muted ml-2" style={{ fontFamily: "var(--font-sans)" }}>
                    {formatDate(ref.publishedAt as string, locale)}
                  </span>
                )}
              </li>
            ))}
          </ul>
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

      {/* Comments */}
      <CommentsSection articleId={article._id as string} locale={locale} />
    </div>
  );
}
