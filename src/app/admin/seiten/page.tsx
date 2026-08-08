"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface PageItem {
  _id: string;
  slug: string;
  titleDe: string;
  titleEn?: string;
}

export default function SeitenPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        setPages(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Seiten</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Statische Seiten wie Impressum, Über mich, etc. — Inhalte hier bearbeiten.
      </p>
      <div className="space-y-2">
        {pages.map((page) => (
          <Link
            key={page._id}
            href={`/admin/seiten/${page._id}`}
            className="flex items-center justify-between p-4 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">{page.titleDe}</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">/{page.slug}</p>
            </div>
            <span className="text-xs text-[var(--color-muted)]">Bearbeiten →</span>
          </Link>
        ))}
        {pages.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">Keine Seiten vorhanden.</p>
        )}
      </div>
    </div>
  );
}
