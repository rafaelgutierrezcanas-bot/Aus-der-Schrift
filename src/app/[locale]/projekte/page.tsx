import { client } from "@/sanity/client";
import { allProjectsQuery } from "@/sanity/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "de"
        ? "Forschungsprojekte – Theologik"
        : "Research Projects – Theologik",
    description:
      locale === "de"
        ? "Aktuelle und abgeschlossene Forschungsprojekte von Theologik."
        : "Current and completed research projects by Theologik.",
  };
}

interface Project {
  _id: string;
  title: string;
  titleEn?: string;
  slug?: { current: string };
  status?: "laufend" | "abgeschlossen" | "pausiert";
  startedAt?: string;
  description?: string;
  descriptionEn?: string;
  researchQuestionDe?: string;
  researchQuestionEn?: string;
  plannedOutput?: string;
  articleCount?: number;
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
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
  });
}

function ProjectCard({
  project,
  locale,
}: {
  project: Project;
  locale: string;
}) {
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
    <div className="border border-border rounded-sm p-6 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <h2
          className="text-base font-semibold leading-snug"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {displayTitle}
        </h2>
        <span
          className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${t.color}`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? t.de : t.en}
        </span>
      </div>

      {/* Start date */}
      {project.startedAt && (
        <p
          className="text-xs text-muted"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {locale === "de" ? "Begonnen:" : "Started:"}{" "}
          {formatStartDate(project.startedAt, locale)}
        </p>
      )}

      {/* Description */}
      {displayDesc && (
        <p
          className="text-sm leading-relaxed text-foreground/80"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {displayDesc}
        </p>
      )}

      {/* Research question */}
      {displayQ && (
        <div className="border-l-2 border-accent/30 pl-3">
          <p
            className="text-[10px] uppercase tracking-widest text-muted mb-1"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Leitfrage" : "Research Question"}
          </p>
          <p
            className="text-sm italic leading-relaxed"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {displayQ}
          </p>
        </div>
      )}

      {/* Footer row */}
      <div
        className="flex items-center gap-4 pt-1"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {project.plannedOutput && (
          <p className="text-xs text-muted">
            <span className="font-medium">
              {locale === "de" ? "Geplante Beiträge:" : "Planned output:"}
            </span>{" "}
            {project.plannedOutput}
          </p>
        )}
        {typeof project.articleCount === "number" &&
          project.articleCount > 0 &&
          project.slug?.current && (
            <Link
              href={`/${locale}/blog?projekt=${project.slug.current}`}
              className="text-xs text-accent hover:underline ml-auto"
            >
              {project.articleCount}{" "}
              {locale === "de" ? "Artikel" : project.articleCount === 1 ? "article" : "articles"}
              {" →"}
            </Link>
          )}
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  locale,
}: {
  title: string;
  items: Project[];
  locale: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2
        className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {title}
      </h2>
      <div className="space-y-4">
        {items.map((p) => (
          <ProjectCard key={p._id} project={p} locale={locale} />
        ))}
      </div>
    </section>
  );
}

export default async function ProjektePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let projects: Project[] = [];
  try {
    projects = await client.fetch(allProjectsQuery, {}, { next: { tags: ["projects"], revalidate: 60 } });
  } catch {
    projects = [];
  }

  const ongoing   = projects.filter((p) => p.status === "laufend" || !p.status);
  const paused    = projects.filter((p) => p.status === "pausiert");
  const completed = projects.filter((p) => p.status === "abgeschlossen");

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Theologik
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {locale === "de" ? "Forschungsprojekte" : "Research Projects"}
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Hier dokumentiert Theologik seine laufenden und abgeschlossenen Forschungsprojekte. Jedes Projekt bündelt Artikel, die eine übergeordnete theologische Frage verfolgen."
          : "Theologik documents its ongoing and completed research projects here. Each project gathers articles pursuing a common theological question."}
      </p>

      {projects.length === 0 ? (
        <p
          className="text-muted text-sm italic"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de"
            ? "Noch keine Projekte vorhanden."
            : "No projects available yet."}
        </p>
      ) : (
        <div className="space-y-12">
          <Section
            title={locale === "de" ? "Laufende Projekte" : "Ongoing Projects"}
            items={ongoing}
            locale={locale}
          />
          <Section
            title={locale === "de" ? "Pausierte Projekte" : "Paused Projects"}
            items={paused}
            locale={locale}
          />
          <Section
            title={
              locale === "de"
                ? "Abgeschlossene Projekte"
                : "Completed Projects"
            }
            items={completed}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
