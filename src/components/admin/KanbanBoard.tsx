"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Article {
  _id: string;
  titleDe: string;
  slug: { current: string };
  status: string;
  publishedAt?: string;
  category?: { titleDe: string } | null;
}

interface Props {
  initialArticles: Article[];
}

const STATUSES = [
  { id: "all", label: "Alle" },
  { id: "idea", label: "Idee", dot: "bg-purple-400" },
  { id: "draft", label: "Entwurf", dot: "bg-amber-400" },
  { id: "ready", label: "Bereit", dot: "bg-blue-400" },
  { id: "published", label: "Veröffentlicht", dot: "bg-green-400" },
] as const;

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

export default function KanbanBoard({ initialArticles }: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const filtered = filter === "all"
    ? articles
    : articles.filter((a) => a.status === filter);

  const counts: Record<string, number> = {};
  for (const a of articles) {
    counts[a.status] = (counts[a.status] ?? 0) + 1;
  }

  async function updateStatus(article: Article, newStatus: string) {
    if (article.status === newStatus) return;
    const oldStatus = article.status;

    // Optimistic update
    setArticles((prev) =>
      prev.map((a) => (a._id === article._id ? { ...a, status: newStatus } : a))
    );

    try {
      const res = await fetch(`/api/admin/articles/${article.slug.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a._id === article._id ? { ...a, status: oldStatus } : a))
        );
      }
    } catch {
      setArticles((prev) =>
        prev.map((a) => (a._id === article._id ? { ...a, status: oldStatus } : a))
      );
    }
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)" }}>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {STATUSES.map((s) => {
          const count = s.id === "all" ? articles.length : (counts[s.id] ?? 0);
          const isActive = filter === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-[var(--color-foreground)] text-white"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {"dot" in s && <span className={`w-2 h-2 rounded-full ${s.dot} ${isActive ? "opacity-80" : ""}`} />}
              <span>{s.label}</span>
              <span className={`tabular-nums ${isActive ? "text-white/60" : "text-[var(--color-muted)]/60"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Article list */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_140px_140px_120px] gap-2 px-4 py-2 border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] font-medium uppercase tracking-wider">
          <span>Titel</span>
          <span>Kategorie</span>
          <span>Datum</span>
          <span>Status</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">
            Keine Artikel in dieser Kategorie.
          </div>
        )}
        {filtered.map((article) => (
          <div
            key={article._id}
            className="grid grid-cols-[1fr_140px_140px_120px] gap-2 items-center px-4 py-2.5 border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-background)] transition-colors group cursor-pointer"
            onClick={() => router.push(`/admin/${article.slug.current}`)}
          >
            {/* Title with status dot */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[article.status] ?? "bg-stone-300"}`} />
              <span className="text-sm text-[var(--color-foreground)] font-medium truncate group-hover:text-[var(--color-accent)] transition-colors">
                {article.titleDe || "Ohne Titel"}
              </span>
            </div>

            {/* Category */}
            <span className="text-xs text-[var(--color-muted)] truncate">
              {article.category?.titleDe ?? "—"}
            </span>

            {/* Date */}
            <span className="text-xs text-[var(--color-muted)] tabular-nums">
              {article.publishedAt
                ? new Date(article.publishedAt).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>

            {/* Status select */}
            <select
              value={article.status}
              onChange={(e) => {
                e.stopPropagation();
                updateStatus(article, e.target.value);
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-xs bg-transparent border border-transparent hover:border-[var(--color-border)] rounded-md px-1.5 py-1 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer focus:outline-none focus:border-[var(--color-accent)]"
            >
              <option value="idea">Idee</option>
              <option value="draft">Entwurf</option>
              <option value="ready">Bereit</option>
              <option value="published">Veröffentlicht</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
