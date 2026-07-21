import Link from "next/link";
import { client } from "@/sanity/client";
import KanbanBoard from "@/components/admin/KanbanBoard";

export default async function ArtikelPage() {
  const allArticles = await client.fetch(`
    *[_type == "article" && status in ["idea", "draft", "ready", "published"]] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, status, category->{ titleDe }
    }
  `);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Artikel</h1>
        <Link
          href="/admin/neu"
          className="text-xs px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neuer Artikel
        </Link>
      </div>

      {/* Article list with filter tabs */}
      <KanbanBoard initialArticles={allArticles} />
    </div>
  );
}
