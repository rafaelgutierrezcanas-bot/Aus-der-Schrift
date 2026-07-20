import Link from "next/link";
import { client } from "@/sanity/client";
import KanbanBoard from "@/components/admin/KanbanBoard";

async function getDashboardData() {
  const [articles, allArticles, sources, ideas, totalArticles, drafts] = await Promise.all([
    client.fetch(`*[_type == "article"] | order(publishedAt desc)[0...5] {
      _id, titleDe, slug, publishedAt, status
    }`),
    client.fetch(`*[_type == "article" && status in ["idea", "draft", "ready", "published"]] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, status, category->{ titleDe }
    }`),
    client.fetch(`count(*[_type == "source"])`),
    client.fetch(`count(*[_type == "idea"])`),
    client.fetch(`count(*[_type == "article"])`),
    client.fetch(`count(*[_type == "article" && status in ["idea", "draft", "ready", "archived"]])`),
  ]);
  return { articles, allArticles, totalArticles, drafts, sources, ideas };
}

export default async function AdminDashboard() {
  const { articles, allArticles, totalArticles, drafts, sources, ideas } = await getDashboardData();

  const stats = [
    { label: "Artikel gesamt", value: totalArticles, href: "/admin/artikel" },
    { label: "Entwürfe", value: drafts, href: "/admin/artikel?tab=entwuerfe" },
    { label: "Quellen", value: sources, href: "/admin/quellen" },
    { label: "Ideen", value: ideas, href: "/admin/ideen" },
  ];

  const quickActions = [
    { label: "Neuer Artikel", href: "/admin/neu" },
    { label: "Neue Quelle", href: "/admin/quellen/neu" },
    { label: "Neue Idee", href: "/admin/ideen/neu" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Theological quote */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
        <p className="font-serif italic text-sm text-[var(--color-accent)] leading-relaxed">
          &ldquo;We need a generation of Christians who are gentle toward people and fierce toward ideas.&rdquo;
        </p>
        <p className="text-xs text-[var(--color-muted)] mt-2" style={{ fontFamily: "var(--font-sans)" }}>
          — Gavin Ortlund
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <p className="text-2xl font-semibold text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-sans)" }}>{s.value}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Kanban Board */}
      <div>
        <h2 className="font-serif text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">
          Artikelübersicht
        </h2>
        <KanbanBoard initialArticles={allArticles} />
      </div>
    </div>
  );
}
