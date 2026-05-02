import Link from "next/link";
import { client } from "@/sanity/client";

interface ArticleSummary {
  _id: string;
  titleDe: string;
  slug: { current: string };
  publishedAt: string;
  language: string;
  category?: { titleDe: string };
}

export default async function AdminDashboard() {
  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, language,
      "category": category->{ titleDe }
    }
  `);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Alle Artikel</h1>
      {articles.length === 0 && (
        <p className="text-stone-500">Noch keine Artikel vorhanden.</p>
      )}
      <div className="space-y-2">
        {articles.map((article) => (
          <Link
            key={article._id}
            href={`/admin/${article.slug.current}`}
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-stone-200 hover:border-stone-400 transition-colors group"
          >
            <div>
              <p className="font-medium text-stone-800 group-hover:text-stone-600">
                {article.titleDe}
              </p>
              <p className="text-sm text-stone-400 mt-0.5">
                {article.category?.titleDe ?? "Keine Kategorie"} ·{" "}
                {new Date(article.publishedAt).toLocaleDateString("de-DE")} ·{" "}
                <span className="uppercase">{article.language}</span>
              </p>
            </div>
            <span className="text-stone-400 text-sm">Bearbeiten →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
