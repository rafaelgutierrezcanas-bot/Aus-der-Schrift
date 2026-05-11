import Link from "next/link";
import { client } from "@/sanity/client";

interface Project {
  _id: string;
  title: string;
  description?: string;
  articleCount: number;
}

export default async function ProjektePage() {
  const projects: Project[] = await client.fetch(`
    *[_type == "project"] | order(title asc) {
      _id, title, description,
      "articleCount": count(*[_type == "article" && project._ref == ^._id])
    }
  `);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Projekte</h1>
        <Link
          href="/admin/projekte/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neues Projekt
        </Link>
      </div>

      {projects.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm" style={{ fontFamily: "var(--font-sans)" }}>
          Noch keine Projekte vorhanden.
        </p>
      )}

      <div className="space-y-2">
        {projects.map((p) => (
          <Link
            key={p._id}
            href={`/admin/projekte/${p._id}`}
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
          >
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                {p.title}
              </p>
              {p.description && (
                <p className="text-xs text-[var(--color-muted)] mt-0.5 truncate" style={{ fontFamily: "var(--font-sans)" }}>
                  {p.description}
                </p>
              )}
            </div>
            <span className="text-xs text-[var(--color-muted)] shrink-0 ml-4" style={{ fontFamily: "var(--font-sans)" }}>
              {p.articleCount} {p.articleCount === 1 ? "Artikel" : "Artikel"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
