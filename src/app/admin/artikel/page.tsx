import Link from "next/link";
import { client } from "@/sanity/client";

interface ArticleSummary {
  _id: string;
  titleDe: string;
  slug: { current: string };
  publishedAt: string;
  language: string;
  status?: string;
  category?: { titleDe: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  idea:      { label: "Idee",           color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  draft:     { label: "Entwurf",        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  ready:     { label: "Bereit",         color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  published: { label: "Veröffentlicht", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  archived:  { label: "Archiviert",     color: "bg-[var(--color-surface)] text-[var(--color-muted)]" },
};

export default async function ArtikelPage() {
  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, language, status,
      "category": category->{ titleDe }
    }
  `);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Artikel</h1>
        <Link
          href="/admin/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neuer Artikel
        </Link>
      </div>

      {articles.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm" style={{ fontFamily: "var(--font-sans)" }}>
          Noch keine Artikel vorhanden.
        </p>
      )}

      <div className="space-y-2">
        {articles.map((article) => {
          const st = article.status ?? "published";
          const badge = STATUS_LABELS[st] ?? STATUS_LABELS.published;
          return (
            <Link
              key={article._id}
              href={`/admin/${article.slug.current}`}
              className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                  {article.titleDe}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                  {article.category?.titleDe ?? "Keine Kategorie"} ·{" "}
                  {new Date(article.publishedAt).toLocaleDateString("de-DE")} ·{" "}
                  <span className="uppercase">{article.language}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`} style={{ fontFamily: "var(--font-sans)" }}>
                  {badge.label}
                </span>
                <span className="text-[var(--color-muted)] text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
