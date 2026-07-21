import Link from "next/link";
import { client } from "@/sanity/client";
import KanbanBoard from "@/components/admin/KanbanBoard";

async function getDashboardData() {
  const [allArticles, sources, ideas, totalArticles, drafts] = await Promise.all([
    client.fetch(`*[_type == "article" && status in ["idea", "draft", "ready", "published"]] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, status, category->{ titleDe }
    }`),
    client.fetch(`count(*[_type == "source"])`),
    client.fetch(`count(*[_type == "idea"])`),
    client.fetch(`count(*[_type == "article"])`),
    client.fetch(`count(*[_type == "article" && status in ["idea", "draft", "ready", "archived"]])`),
  ]);
  return { allArticles, totalArticles, drafts, sources, ideas };
}

export default async function AdminDashboard() {
  const { allArticles, totalArticles, drafts, sources, ideas } = await getDashboardData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Dashboard</h1>
        <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
          <Link
            href="/admin/neu"
            className="text-xs px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium"
          >
            + Neuer Artikel
          </Link>
          <Link
            href="/admin/quellen/neu"
            className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
          >
            Neue Quelle
          </Link>
          <Link
            href="/admin/ideen/neu"
            className="text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
          >
            Neue Idee
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3" style={{ fontFamily: "var(--font-sans)" }}>
        {[
          { label: "Artikel", value: totalArticles, href: "/admin/artikel" },
          { label: "Entwürfe", value: drafts, href: "/admin/artikel?tab=entwuerfe" },
          { label: "Quellen", value: sources, href: "/admin/quellen" },
          { label: "Ideen", value: ideas, href: "/admin/ideen" },
        ].map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-3 bg-[var(--color-surface)] rounded-xl px-4 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <span className="text-xl font-semibold text-[var(--color-foreground)] tabular-nums">{s.value}</span>
            <span className="text-xs text-[var(--color-muted)]">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* Article list */}
      <KanbanBoard initialArticles={allArticles} />
    </div>
  );
}
