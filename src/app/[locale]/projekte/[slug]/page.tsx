import { client } from "@/sanity/client";
import { projectBySlugQuery, allProjectsQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const revalidate = 60;
export const dynamicParams = true;

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
  articles: Record<string, unknown>[];
}

export async function generateStaticParams() {
  try {
    const projects = await client.fetch(allProjectsQuery);
    return (projects as Project[])
      .filter((p) => p.slug?.current)
      .map((p) => ({ slug: p.slug.current }));
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
    const project = await client.fetch(projectBySlugQuery, { slug });
    if (!project) return { title: "Projekt nicht gefunden" };
    const title =
      locale === "en" && project.titleEn ? project.titleEn : project.title;
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

const STATUS_LABEL: Record<string, { de: string; en: string; color: string }> =
  {
    laufend: {
      de: "Laufend",
      en: "Ongoing",
      color:
        "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950",
    },
    abgeschlossen: {
      de: "Abgeschlossen",
      en: "Completed",
      color: "text-muted bg-surface",
    },
    pausiert: {
      de: "Pausiert",
      en: "Paused",
      color:
        "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950",
    },
  };

function formatStartDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(
    locale === "de" ? "de-DE" : "en-US",
    { year: "numeric", month: "long" }
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const project: Project | null = await client
    .fetch(projectBySlugQuery, { slug }, { next: { tags: ["projects"], revalidate: 60 } })
    .catch(() => null);

  if (!project) notFound();

  const t = project.status
    ? STATUS_LABEL[project.status]
    : STATUS_LABEL.laufend;
  const displayTitle =
    locale === "en" && project.titleEn ? project.titleEn : project.title;
  const displayDesc =
    locale === "en" && project.descriptionEn
      ? project.descriptionEn
      : project.description;
  const displayQ =
    locale === "en" && project.researchQuestionEn
      ? project.researchQuestionEn
      : project.researchQuestionDe;

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
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
      <header className="mb-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1
            className="text-3xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {displayTitle}
          </h1>
          <span
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide mt-1.5 ${t.color}`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? t.de : t.en}
          </span>
        </div>

        {project.startedAt && (
          <p
            className="text-xs text-muted mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Begonnen:" : "Started:"}{" "}
            {formatStartDate(project.startedAt, locale)}
          </p>
        )}

        {displayDesc && (
          <p
            className="text-base leading-relaxed text-foreground/80 mb-6"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {displayDesc}
          </p>
        )}

        {displayQ && (
          <div className="border-l-2 border-accent/30 pl-4 mb-6">
            <p
              className="text-[10px] uppercase tracking-widest text-muted mb-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? "Leitfrage" : "Research Question"}
            </p>
            <p
              className="text-base italic leading-relaxed"
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

      {/* Articles */}
      <section>
        <div className="border-t border-border pt-8">
          <h2
            className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted mb-6"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de"
              ? project.articles.length === 0
                ? "Noch keine Artikel erschienen"
                : `${project.articles.length} ${project.articles.length === 1 ? "Artikel" : "Artikel"} in diesem Projekt`
              : project.articles.length === 0
              ? "No articles published yet"
              : `${project.articles.length} ${project.articles.length === 1 ? "article" : "articles"} in this project`}
          </h2>

          {project.articles.length === 0 ? (
            <p
              className="text-sm text-muted italic"
              style={{ fontFamily: "var(--font-body-serif)" }}
            >
              {locale === "de"
                ? "Beiträge zu diesem Projekt sind in Vorbereitung."
                : "Articles for this project are in preparation."}
            </p>
          ) : (
            <div className="space-y-8">
              {project.articles.map((article) => (
                <ArticleCard
                  key={article._id as string}
                  article={article}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
