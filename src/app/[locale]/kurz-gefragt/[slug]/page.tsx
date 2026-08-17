import { client } from "@/sanity/client";
import { kurzGefragtBySlugQuery, allKurzGefragtSlugsQuery } from "@/sanity/queries";
import { PortableTextRenderer } from "@/components/PortableTextRenderer";
import { ArticleCard } from "@/components/ArticleCard";
import { formatDate, getLocalizedQuestion, getLocalizedShortAnswer, getLocalizedCategoryTitle, estimateReadingTime, getLocalizedSlug } from "@/lib/utils";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ShareButton } from "@/components/ShareButton";
import { CiteButton } from "@/components/CiteButton";
import type { Metadata } from "next";
import Script from "next/script";
import { absoluteUrl, localePath, SITE_NAME } from "@/lib/site";
import { injectBibleReferences } from "@/lib/injectBibleReferences";
import { Breadcrumb } from "@/components/Breadcrumb";
import { AuthorCard } from "@/components/AuthorCard";


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

const verdictLabels: Record<string, { de: string; en: string }> = {
  ja: { de: "Ja", en: "Yes" },
  nein: { de: "Nein", en: "No" },
  teilweise: { de: "Teilweise", en: "Partially" },
  umstritten: { de: "Umstritten", en: "Debated" },
};

export async function generateStaticParams() {
  try {
    const slugs = await client.fetch(allKurzGefragtSlugsQuery);
    const params: Array<{ locale: string; slug: string }> = [];
    for (const item of slugs as Array<{ slug: string; slugEn?: string }>) {
      params.push({ locale: "de", slug: item.slug });
      params.push({ locale: "en", slug: item.slugEn || item.slug });
    }
    return params;
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
    const item = await client.fetch(kurzGefragtBySlugQuery, { slug }, { next: { tags: ["kurzGefragt", `kurzGefragt-${slug}`], revalidate: 60 } });
    if (!item) {
      return { title: locale === "de" ? "Frage nicht gefunden" : "Question not found", robots: { index: false, follow: false } };
    }

    const question = getLocalizedQuestion(item, locale);
    const shortAnswer = getLocalizedShortAnswer(item, locale);
    const description = shortAnswer
      ? shortAnswer.length > 155
        ? shortAnswer.slice(0, shortAnswer.lastIndexOf(" ", 155)) + "…"
        : shortAnswer
      : locale === "de"
        ? "Kurze, fundierte Antwort auf eine häufige Bibel- und Theologiefrage."
        : "A short, well-researched answer to a common Bible and theology question.";

    const deSlug = (item.slug as { current: string })?.current || slug;
    const enSlug = (item.slugEn as { current: string })?.current || deSlug;
    const canonicalSlug = locale === "en" ? enSlug : deSlug;
    const path = localePath(locale, `/kurz-gefragt/${canonicalSlug}`);

    return {
      title: `${question} | ${SITE_NAME}`,
      description,
      alternates: {
        canonical: path,
        languages: {
          de: localePath("de", `/kurz-gefragt/${deSlug}`),
          en: localePath("en", `/kurz-gefragt/${enSlug}`),
          "x-default": localePath("de", `/kurz-gefragt/${deSlug}`),
        },
      },
      openGraph: {
        type: "article",
        title: `${question} | ${SITE_NAME}`,
        description,
        url: absoluteUrl(path),
        siteName: SITE_NAME,
        locale: locale === "de" ? "de_DE" : "en_US",
        publishedTime: item.publishedAt as string | undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${question} | ${SITE_NAME}`,
        description,
      },
    };
  } catch {
    return { title: locale === "de" ? "Frage nicht gefunden" : "Question not found", robots: { index: false, follow: false } };
  }
}

export default async function KurzGefragtDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let item: Record<string, unknown> | null = null;
  try {
    item = await client.fetch(kurzGefragtBySlugQuery, { slug }, { next: { tags: ["kurzGefragt", `kurzGefragt-${slug}`], revalidate: 60 } });
  } catch {
    notFound();
  }
  if (!item) notFound();

  // Redirect to canonical slug
  const deSlug = (item.slug as { current: string })?.current;
  const enSlug = (item.slugEn as { current: string })?.current;
  const canonicalSlug = locale === "en" && enSlug ? enSlug : deSlug;
  if (canonicalSlug && canonicalSlug !== slug) {
    permanentRedirect(localePath(locale, `/kurz-gefragt/${canonicalSlug}`));
  }

  const t = await getTranslations("kurzGefragt");
  const question = getLocalizedQuestion(item, locale);
  const shortAnswer = getLocalizedShortAnswer(item, locale);
  const verdict = item.verdict as string | undefined;
  const category = item.category as Record<string, unknown> | null;
  const categoryTitle = getLocalizedCategoryTitle(category, locale);
  const categorySlug = (category?.slug as { current: string })?.current;

  const rawBody = (locale === "en" && Array.isArray(item.bodyEn) && (item.bodyEn as unknown[]).length > 0
    ? item.bodyEn
    : item.bodyDe) as unknown[];
  const { annotated: bodyWithFootnotes, footnotes } = annotateFootnotes(rawBody ?? []);
  const body = injectBibleReferences(bodyWithFootnotes);

  const readingTime = estimateReadingTime(body || []);

  const relatedArticles = (item.relatedArticles as Record<string, unknown>[]) ?? [];
  const relatedQuestions = (item.relatedQuestions as Record<string, unknown>[]) ?? [];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: question,
    description: shortAnswer || question,
    datePublished: item.publishedAt,
    dateModified: item._updatedAt ?? item.publishedAt,
    mainEntityOfPage: absoluteUrl(`/${locale}/kurz-gefragt/${slug}`),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    author: {
      "@type": "Person",
      name: "Rafael Gutierrez",
      url: absoluteUrl(`/${locale}/zu-meiner-person`),
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl(),
    },
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
        name: locale === "de" ? "Kurz gefragt" : "Quick Answers",
        item: absoluteUrl(`/${locale}/kurz-gefragt`),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: question,
        item: absoluteUrl(`/${locale}/kurz-gefragt/${slug}`),
      },
    ],
  };

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

      <Breadcrumb
        items={[
          { label: locale === "de" ? "Startseite" : "Home", href: `/${locale}` },
          { label: locale === "de" ? "Kurz gefragt" : "Quick Answers", href: `/${locale}/kurz-gefragt` },
        ]}
      />

      {/* Header */}
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
          {!!item.publishedAt && (
            <span
              className="text-xs text-muted"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {formatDate(item.publishedAt as string, locale)}
            </span>
          )}
          <span
            className="text-xs text-muted"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            · {readingTime} min
          </span>
        </div>
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {question}
        </h1>
      </header>

      {/* Answer Box */}
      <div className="max-w-prose mx-auto border-l-2 border-accent bg-surface/50 rounded-r-sm px-6 py-5 my-8">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {t("kurzGesagt")}
        </p>
        {verdict && verdictLabels[verdict] && (
          <span
            className={`inline-block text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm mb-3 ${verdict === "teilweise" || verdict === "umstritten" ? "bg-accent text-white" : "bg-navy text-background"}`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "en" ? verdictLabels[verdict].en : verdictLabels[verdict].de}
          </span>
        )}
        <p
          className="text-lg leading-relaxed"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {shortAnswer}
        </p>
      </div>

      {/* Body */}
      <div className="max-w-prose mx-auto">
        <div id="article-body" className="prose dark:prose-invert max-w-prose mx-auto">
          {body && body.length > 0 && <PortableTextRenderer value={body} locale={locale} />}
        </div>

        {/* Footnotes */}
        {footnotes.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-4" style={{ fontFamily: "var(--font-sans)" }}>
              {locale === "de" ? "Fußnoten" : "Footnotes"}
            </p>
            <ol className="space-y-2">
              {footnotes.map((fn) => (
                <li key={fn._key} id={`fn-${fn._fnIndex}`} className="flex gap-3 text-sm text-muted leading-relaxed">
                  <span className="shrink-0 text-accent font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                    <a href={`#fnref-${fn._fnIndex}`} aria-label={locale === "de" ? "Zurück zum Text" : "Back to text"}>
                      [{fn._fnIndex}]
                    </a>
                  </span>
                  <span style={{ fontFamily: "var(--font-sans)" }}>{fn.text || "—"}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <h2
              className="text-xl font-semibold mb-8"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("zurVertiefung")}
            </h2>
            <div className="space-y-8">
              {relatedArticles.map((r) => (
                <ArticleCard key={r._id as string} article={r} />
              ))}
            </div>
          </section>
        )}

        {/* Related Questions */}
        {relatedQuestions.length > 0 && (
          <section className="mt-12 pt-8 border-t border-border">
            <h2
              className="text-xl font-semibold mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {t("weitereFragen")}
            </h2>
            <ul className="space-y-3">
              {relatedQuestions.map((q) => {
                const qSlug = locale === "en" && (q.slugEn as { current: string })?.current
                  ? (q.slugEn as { current: string }).current
                  : (q.slug as { current: string })?.current;
                const qQuestion = getLocalizedQuestion(q, locale);
                const qVerdict = q.verdict as string | undefined;
                return (
                  <li key={q._id as string} className="flex items-center gap-3">
                    <Link
                      href={`/${locale}/kurz-gefragt/${qSlug}`}
                      className="text-sm hover:text-accent transition-colors"
                      style={{ fontFamily: "var(--font-body-serif)" }}
                    >
                      {qQuestion}
                    </Link>
                    {qVerdict && verdictLabels[qVerdict] && (
                      <span
                        className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.15em] px-2.5 py-1 rounded-sm ${qVerdict === "teilweise" || qVerdict === "umstritten" ? "bg-accent text-white" : "bg-navy text-background"}`}
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {locale === "en" ? verdictLabels[qVerdict].en : verdictLabels[qVerdict].de}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="mt-8 flex items-center gap-4">
          <ShareButton
            url={absoluteUrl(localePath(locale, `/kurz-gefragt/${slug}`))}
            title={question}
          />
          <CiteButton
            author="Rafael Gutierrez"
            title={question}
            locale={locale}
          />
        </div>
      </div>

      <AuthorCard locale={locale} />
    </div>
  );
}
