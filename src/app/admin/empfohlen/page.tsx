import { client } from "@/sanity/client";
import { RecommendToggle } from "@/components/admin/RecommendToggle";

interface ArticleSummary {
  _id: string;
  titleDe: string;
  slug: { current: string };
  publishedAt: string;
  isRecommended?: boolean;
  category?: { titleDe: string };
}

export default async function EmpfohlenPage() {
  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article" && (status == "published" || !defined(status))] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, isRecommended,
      "category": category->{ titleDe }
    }
  `);

  const recommended = articles.filter((a) => a.isRecommended);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Empfohlen</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
          Klicke auf ★ um einen Artikel als empfohlen zu markieren. Der neueste Artikel erscheint immer automatisch zuerst.
        </p>
      </div>

      {recommended.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)] mb-3" style={{ fontFamily: "var(--font-sans)" }}>
            Aktuell empfohlen ({recommended.length})
          </p>
          <div className="space-y-2">
            {recommended.map((article) => (
              <div
                key={article._id}
                className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/10 rounded-xl px-5 py-3 border border-amber-200 dark:border-amber-800/40"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-foreground)] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                    {article.titleDe}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                    {article.category?.titleDe ?? "Keine Kategorie"} · {new Date(article.publishedAt).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <RecommendToggle slug={article.slug.current} isRecommended={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-muted)] mb-3" style={{ fontFamily: "var(--font-sans)" }}>
          Alle veröffentlichten Artikel
        </p>
        <div className="space-y-2">
          {articles.map((article) => (
            <div
              key={article._id}
              className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-3 border border-[var(--color-border)]"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                  {article.titleDe}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                  {article.category?.titleDe ?? "Keine Kategorie"} · {new Date(article.publishedAt).toLocaleDateString("de-DE")}
                </p>
              </div>
              <RecommendToggle slug={article.slug.current} isRecommended={!!article.isRecommended} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
