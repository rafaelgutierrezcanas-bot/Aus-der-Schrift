import Link from "next/link";
import { client } from "@/sanity/client";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

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

const DRAFT_STATUSES = new Set(["idea", "draft", "ready", "archived"]);

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isDraftTab = tab === "entwuerfe";

  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, language, status,
      "category": category->{ titleDe }
    }
  `);

  const published = articles.filter((a) => !DRAFT_STATUSES.has(a.status ?? "published"));
  const drafts = articles.filter((a) => DRAFT_STATUSES.has(a.status ?? "published"));
  const visible = isDraftTab ? drafts : published;

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

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[var(--color-border)]">
        <Link
          href="/admin/artikel"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            !isDraftTab
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Veröffentlicht ({published.length})
        </Link>
        <Link
          href="/admin/artikel?tab=entwuerfe"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            isDraftTab
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Entwürfe ({drafts.length})
        </Link>
      </div>

      {visible.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center" style={{ fontFamily: "var(--font-sans)" }}>
          {isDraftTab ? "Keine Entwürfe vorhanden." : "Noch keine veröffentlichten Artikel."}
        </p>
      )}

      <div className="space-y-2">
        {visible.map((article) => {
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
                  {isDraftTab
                    ? <span className={`px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    : new Date(article.publishedAt).toLocaleDateString("de-DE")
                  }{" "}
                  · <span className="uppercase">{article.language}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {!isDraftTab && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {badge.label}
                  </span>
                )}
                <DeleteArticleButton slug={article.slug.current} title={article.titleDe} />
                <span className="text-[var(--color-muted)] text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
