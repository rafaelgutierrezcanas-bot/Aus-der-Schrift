import { client } from "@/sanity/client";
import { projectBySlugQuery } from "@/sanity/queries";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatDate, getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Project {
  _id: string;
  title: string;
  titleEn?: string;
  slug: { current: string };
  status?: "laufend" | "abgeschlossen" | "pausiert";
  startedAt?: string;
  description?: string;
  descriptionEn?: string;
  researchQuestionDe?: string;
  researchQuestionEn?: string;
  plannedOutput?: string;
  articles?: Record<string, unknown>[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const project = await client.fetch(projectBySlugQuery, { slug });
    if (!project) return { title: "Projekt nicht gefunden" };
    const title = locale === "en" && project.titleEn ? project.titleEn : project.title;
    return {
      title: `${title} – Theologik`,
      description:
        locale === "en" && project.descriptionEn
          ? project.descriptionEn
          : project.description,
    };
  } catch {
    return { title: "Projekt nicht gefunden" };
  }
}

const STATUS_CONFIG: Record<string, { de: string; en: string; dot: string }> = {
  laufend: { de: "Laufend", en: "Ongoing", dot: "bg-emerald-500" },
  abgeschlossen: { de: "Abgeschlossen", en: "Completed", dot: "bg-border" },
  pausiert: { de: "Pausiert", en: "Paused", dot: "bg-amber-400" },
};

function formatStartDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  let project: Project | null = null;
  try {
    project = await client.fetch(projectBySlugQuery, { slug }, { next: { tags: ["projects"], revalidate: 60 } });
  } catch {
    notFound();
  }
  if (!project) notFound();

  const s = project.status ? STATUS_CONFIG[project.status] : STATUS_CONFIG.laufend;
  const displayTitle = locale === "en" && project.titleEn ? project.titleEn : project.title;
  const displayDesc = locale === "en" && project.descriptionEn ? project.descriptionEn : project.description;
  const displayQ = locale === "en" && project.researchQuestionEn ? project.researchQuestionEn : project.researchQuestionDe;
  const articles = project.articles ?? [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Breadcrumb */}
      <div
        className="text-xs text-muted mb-8 flex items-center gap-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <Link
          href={`/${locale}/projekte`}
          className="hover:text-foreground transition-colors"
        >
          {locale === "de" ? "Forschungsprojekte" : "Research Projects"}
        </Link>
        <span>/</span>
        <span className="text-foreground">{displayTitle}</span>
      </div>

      {/* Project header */}
      <header className="mb-10 pb-10 border-b border-border">
        <div className="w-8 h-0.5 bg-accent mb-6" />

        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {displayTitle}
        </h1>

        {/* Status + date */}
        <div
          className="flex items-center gap-2 mb-6"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
          <span className="text-[11px] text-muted uppercase tracking-[0.12em]">
            {locale === "de" ? s.de : s.en}
          </span>
          {project.startedAt && (
            <>
              <span className="text-muted text-[11px]">·</span>
              <span className="text-[11px] text-muted">
                {locale === "de" ? "Begonnen" : "Started"}{" "}
                {formatStartDate(project.startedAt, locale)}
              </span>
            </>
          )}
        </div>

        {/* Description */}
        {displayDesc && (
          <p
            className="text-lg leading-relaxed text-muted mb-6 max-w-prose"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {displayDesc}
          </p>
        )}

        {/* Research question */}
        {displayQ && (
          <div className="border-l-2 border-accent pl-5 mb-6 max-w-prose">
            <p
              className="text-[10px] uppercase tracking-widest text-muted mb-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Leitfrage" : "Research Question"}
            </p>
            <p
              className="text-lg italic leading-relaxed"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {displayQ}
            </p>
          </div>
        )}

        {project.plannedOutput && (
          <p
            className="text-xs text-muted"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span className="font-medium">
              {locale === "de" ? "Geplante Beiträge:" : "Planned output:"}
            </span>{" "}
            {project.plannedOutput}
          </p>
        )}
      </header>

      {/* Articles section */}
      <section>
        {/* Section label */}
        <div className="flex items-center gap-4 mb-8">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent shrink-0"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de"
              ? articles.length === 0
                ? "Artikel"
                : `${articles.length} ${articles.length === 1 ? "Artikel" : "Artikel"}`
              : articles.length === 0
              ? "Articles"
              : `${articles.length} ${articles.length === 1 ? "Article" : "Articles"}`}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {articles.length === 0 ? (
          <p
            className="text-sm text-muted italic"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {locale === "de"
              ? "Beiträge zu diesem Projekt sind in Vorbereitung."
              : "Articles for this project are in preparation."}
          </p>
        ) : (
          <div>
            {articles.map((article) => {
              const artTitle = getLocalizedTitle(article, locale);
              const artExcerpt = getLocalizedExcerpt(article, locale);
              const artCategoryTitle = getLocalizedCategoryTitle(
                article.category as Record<string, unknown> | null,
                locale
              );
              const artCategorySlug = ((article.category as Record<string, unknown>)?.slug as { current: string })?.current;
              const artSlug = (article.slug as { current: string })?.current;
              const artDate = article.publishedAt as string | undefined;
              return (
                <article
                  key={article._id as string}
                  className="group py-6 border-b border-border last:border-0 md:grid md:grid-cols-[180px_1fr] md:gap-8"
                >
                  {/* Metadata */}
                  <div
                    className="flex items-center gap-2 mb-2 md:flex-col md:items-start md:gap-1 md:pt-0.5 md:mb-0"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {artCategoryTitle && (
                      artCategorySlug ? (
                        <Link
                          href={`/${locale}/kategorien/${artCategorySlug}`}
                          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
                        >
                          {artCategoryTitle}
                        </Link>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent">
                          {artCategoryTitle}
                        </span>
                      )
                    )}
                    {artDate && (
                      <span className="text-[11px] text-muted">
                        <span className="md:hidden">· </span>
                        {formatDate(artDate, locale)}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0">
                    <Link href={`/${locale}/blog/${artSlug}`}>
                      <h3
                        className="font-bold leading-snug mb-1 group-hover:text-accent transition-colors text-lg md:text-xl"
                        style={{ fontFamily: "var(--font-serif)" }}
                      >
                        {artTitle}
                      </h3>
                      {artExcerpt && (
                        <p
                          className="text-muted text-sm leading-relaxed line-clamp-2"
                          style={{ fontFamily: "var(--font-body-serif)" }}
                        >
                          {artExcerpt}
                        </p>
                      )}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
