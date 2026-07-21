import Link from "next/link";
import { client } from "@/sanity/client";

async function getDashboardData() {
  const [
    articles,
    drafts,
    sources,
    ideas,
    books,
    quotes,
    papers,
    projects,
    pendingComments,
    recentArticles,
  ] = await Promise.all([
    client.fetch(`count(*[_type == "article"])`),
    client.fetch(`count(*[_type == "article" && status in ["idea", "draft", "ready"]])`),
    client.fetch(`count(*[_type == "source"])`),
    client.fetch(`count(*[_type == "idea"])`),
    client.fetch(`count(*[_type == "bookRecommendation"])`),
    client.fetch(`count(*[_type == "quote"])`),
    client.fetch(`count(*[_type == "ausarbeitung"])`),
    client.fetch(`count(*[_type == "project"])`),
    client.fetch(`count(*[_type == "comment" && status == "pending"])`),
    client.fetch(`*[_type == "article" && status in ["idea", "draft", "ready", "published"]] | order(_updatedAt desc)[0...5] {
      _id, titleDe, slug, status, _updatedAt, category->{ titleDe }
    }`),
  ]);
  return { articles, drafts, sources, ideas, books, quotes, papers, projects, pendingComments, recentArticles };
}

const STATUS_DOT: Record<string, string> = {
  idea: "bg-purple-400",
  draft: "bg-amber-400",
  ready: "bg-blue-400",
  published: "bg-green-400",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "Idee",
  draft: "Entwurf",
  ready: "Bereit",
  published: "Veröffentlicht",
};

const SECTIONS = [
  {
    label: "Artikel",
    href: "/admin/artikel",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    label: "Quellen",
    href: "/admin/quellen",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    label: "Ideen",
    href: "/admin/ideen",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6" /><path d="M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    ),
  },
  {
    label: "Projekte",
    href: "/admin/projekte",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Bücher",
    href: "/admin/buecher",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
  },
  {
    label: "Zitate",
    href: "/admin/zitate",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
  },
  {
    label: "Ausarbeitungen",
    href: "/admin/ausarbeitungen",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "Kommentare",
    href: "/admin/kommentare",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

export default async function AdminDashboard() {
  const data = await getDashboardData();

  const counts: Record<string, number> = {
    Artikel: data.articles,
    Quellen: data.sources,
    Ideen: data.ideas,
    Projekte: data.projects,
    "Bücher": data.books,
    Zitate: data.quotes,
    Ausarbeitungen: data.papers,
    Kommentare: data.pendingComments,
  };

  const subtitles: Record<string, string> = {
    Artikel: `${data.drafts} Entwürfe`,
    Kommentare: data.pendingComments > 0 ? "ausstehend" : "keine neuen",
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Dashboard</h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">Überblick über alle Bereiche</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/neu"
            className="text-xs px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium"
          >
            + Neuer Artikel
          </Link>
        </div>
      </div>

      {/* Section grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SECTIONS.map((section) => {
          const count = counts[section.label] ?? 0;
          const subtitle = subtitles[section.label];
          const isHighlight = section.label === "Kommentare" && data.pendingComments > 0;
          return (
            <Link
              key={section.label}
              href={section.href}
              className={`group flex flex-col gap-3 rounded-xl px-4 py-4 border transition-all ${
                isHighlight
                  ? "bg-amber-50 border-amber-200 hover:border-amber-400"
                  : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`${isHighlight ? "text-amber-600" : "text-[var(--color-muted)]"} group-hover:text-[var(--color-accent)] transition-colors`}>
                  {section.icon}
                </span>
                <span className={`text-2xl font-semibold tabular-nums ${isHighlight ? "text-amber-700" : "text-[var(--color-foreground)]"}`}>
                  {count}
                </span>
              </div>
              <div>
                <p className={`text-sm font-medium ${isHighlight ? "text-amber-800" : "text-[var(--color-foreground)]"}`}>
                  {section.label}
                </p>
                {subtitle && (
                  <p className={`text-xs mt-0.5 ${isHighlight ? "text-amber-600" : "text-[var(--color-muted)]"}`}>
                    {subtitle}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest">Zuletzt bearbeitet</h2>
          <Link href="/admin/artikel" className="text-xs text-[var(--color-accent)] hover:underline">
            Alle Artikel
          </Link>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
          {data.recentArticles.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
              Noch keine Artikel vorhanden.
            </div>
          )}
          {data.recentArticles.map((article: any) => (
            <Link
              key={article._id}
              href={`/admin/${article.slug.current}`}
              className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] transition-colors group"
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[article.status] ?? "bg-stone-300"}`} />
              <span className="text-sm text-[var(--color-foreground)] font-medium truncate flex-1 group-hover:text-[var(--color-accent)] transition-colors">
                {article.titleDe || "Ohne Titel"}
              </span>
              <span className="text-xs text-[var(--color-muted)] shrink-0">
                {STATUS_LABEL[article.status] ?? article.status}
              </span>
              <span className="text-xs text-[var(--color-muted)] shrink-0 tabular-nums">
                {article._updatedAt
                  ? new Date(article._updatedAt).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/quellen/neu"
          className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
        >
          + Neue Quelle
        </Link>
        <Link
          href="/admin/ideen/neu"
          className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
        >
          + Neue Idee
        </Link>
        <Link
          href="/admin/projekte/neu"
          className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
        >
          + Neues Projekt
        </Link>
        <Link
          href="/admin/buecher/neu"
          className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
        >
          + Neues Buch
        </Link>
      </div>
    </div>
  );
}
