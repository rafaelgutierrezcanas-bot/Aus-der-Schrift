import { client } from "@/sanity/client";
import { allProjectsQuery } from "@/sanity/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { buildLocalizedMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/projekte",
    deTitle: "Forschungsprojekte",
    enTitle: "Research Projects",
    deDescription:
      "Aktuelle und abgeschlossene Forschungsprojekte von Theologik zu Theologie, Kirchengeschichte und Bibelauslegung.",
    enDescription:
      "Current and completed research projects by Theologik on theology, church history, and biblical interpretation.",
    keywords: [
      "theologische Forschung",
      "Theologie Projekte",
      "Kirchengeschichte Forschung",
      "Bibelauslegung",
    ],
  });
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

const STATUS_CONFIG: Record<string, { de: string; en: string; dot: string }> = {
  laufend: { de: "Laufend", en: "Ongoing", dot: "bg-emerald-500" },
  abgeschlossen: { de: "Abgeschlossen", en: "Completed", dot: "bg-border" },
  pausiert: { de: "Pausiert", en: "Paused", dot: "bg-amber-400" },
};

function formatStartDate(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
  });
}

function ProjectRow({ project, locale }: { project: Project; locale: string }) {
  const s = project.status ? STATUS_CONFIG[project.status] : STATUS_CONFIG.laufend;
  const displayTitle = locale === "en" && project.titleEn ? project.titleEn : project.title;
  const displayDesc = locale === "en" && project.descriptionEn ? project.descriptionEn : project.description;
  const displayQ = locale === "en" && project.researchQuestionEn ? project.researchQuestionEn : project.researchQuestionDe;
  const href = project.slug?.current ? `/${locale}/projekte/${project.slug.current}` : undefined;

  const content = (
    <article className={`group py-8 border-b border-border${href ? " cursor-pointer" : ""}`}>
      {/* Title + meta */}
      <div className="mb-1">
        <h2
          className={`text-2xl md:text-3xl font-bold leading-tight mb-2${href ? " group-hover:text-accent transition-colors" : ""}`}
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {displayTitle}
        </h2>
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
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
      </div>

      {/* Description */}
      {displayDesc && (
        <p
          className="text-muted leading-relaxed mt-4 mb-4 max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {displayDesc}
        </p>
      )}

      {/* Research question — prominent */}
      {displayQ && (
        <div className="border-l-2 border-accent pl-4 my-4 max-w-prose">
          <p
            className="text-[10px] uppercase tracking-widest text-muted mb-1.5"
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

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-4"
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
        {typeof project.articleCount === "number" && href && (
          <span className="text-xs text-accent ml-auto">
            {project.articleCount > 0
              ? `${project.articleCount} ${locale === "de" ? "Artikel" : project.articleCount === 1 ? "article" : "articles"}`
              : locale === "de"
              ? "Noch keine Artikel"
              : "No articles yet"}{" "}→
          </span>
        )}
      </div>
    </article>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}

function Section({ title, items, locale }: { title: string; items: Project[]; locale: string }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-12">
      {/* Section label */}
      <div className="flex items-center gap-4 mb-0">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent shrink-0"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {title}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      {items.map((p) => (
        <ProjectRow key={p._id} project={p} locale={locale} />
      ))}
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
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Page header — matching blog/category style */}
      <div className="mb-12">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <p
          className="text-xs uppercase tracking-[0.15em] text-accent mb-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Theologik
        </p>
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight mb-5"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {locale === "de" ? "Forschungsprojekte" : "Research Projects"}
        </h1>
        <p
          className="text-muted text-lg leading-relaxed max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de"
            ? "Auf dieser Seite halte ich fest, woran ich gerade arbeite — und was ich abgeschlossen oder zurückgestellt habe. Jedes Projekt verfolgt eine theologische Leitfrage und bündelt die dazugehörigen Artikel."
            : "Here I keep track of what I am currently working on — and what I have completed or set aside. Each project follows a central theological question and gathers the articles that belong to it."}
        </p>
      </div>

      {projects.length === 0 ? (
        <p
          className="text-muted text-sm italic"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {locale === "de" ? "Noch keine Projekte vorhanden." : "No projects available yet."}
        </p>
      ) : (
        <div>
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
            title={locale === "de" ? "Abgeschlossene Projekte" : "Completed Projects"}
            items={completed}
            locale={locale}
          />
        </div>
      )}
    </div>
  );
}
