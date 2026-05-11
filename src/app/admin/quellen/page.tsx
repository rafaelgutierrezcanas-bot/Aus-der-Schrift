"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Source {
  _id: string;
  type: string;
  authors: string;
  title: string;
  year: number;
  publisher?: string;
  notes?: string;
}

const TYPE_ICON: Record<string, string> = {
  book: "📖", journal: "📄", dissertation: "🎓", website: "🌐", bible: "✝️",
};
const TYPE_LABEL: Record<string, string> = {
  book: "Buch", journal: "Artikel", dissertation: "Dissertation", website: "Website", bible: "Bibel",
};

export default function QuellenPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sources")
      .then((r) => r.json())
      .then((data) => { setSources(data); setLoading(false); });
  }, []);

  const filtered = sources.filter((s) =>
    `${s.title} ${s.authors}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Quellen</h1>
        <Link
          href="/admin/quellen/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neue Quelle
        </Link>
      </div>

      <input
        type="search"
        placeholder="Suche nach Titel oder Autor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
        style={{ fontFamily: "var(--font-sans)" }}
      />

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {filtered.map((s) => (
          <Link
            key={s._id}
            href={`/admin/quellen/${s._id}`}
            className="flex items-start gap-4 bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
          >
            <span className="text-xl leading-none mt-0.5">{TYPE_ICON[s.type] ?? "📄"}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] text-sm leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
                {s.title}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {s.authors} · {s.year} · {TYPE_LABEL[s.type] ?? s.type}
              </p>
              {s.notes && (
                <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-1 italic" style={{ fontFamily: "var(--font-sans)" }}>
                  {s.notes}
                </p>
              )}
            </div>
            <span className="text-[var(--color-muted)] text-sm shrink-0">→</span>
          </Link>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Keine Quellen gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
