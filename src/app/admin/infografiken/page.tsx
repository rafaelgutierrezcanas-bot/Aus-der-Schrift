"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

interface Infografik {
  _id: string;
  title: string;
  description?: string;
  publishedAt: string;
  topics: string[];
  articleSlug?: string;
  imageUrl?: string;
}

export default function InfografikanPage() {
  const [items, setItems] = useState<Infografik[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/infografiken")
      .then((r) => r.json())
      .then((data) => { setItems(data); setLoading(false); });
  }, []);

  async function deleteItem(id: string) {
    if (!confirm("Infografik löschen?")) return;
    await fetch(`/api/admin/infografiken/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((a) => a._id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Infografiken</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            Theologische Infografiken zum Teilen und Herunterladen.
          </p>
        </div>
        <Link
          href="/admin/infografiken/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neue Infografik
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)]"
          >
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-12 h-12 rounded-lg object-cover border border-[var(--color-border)] shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--color-foreground)] text-sm truncate" style={{ fontFamily: "var(--font-sans)" }}>
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                    {new Date(item.publishedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </span>
                  {item.articleSlug && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]" style={{ fontFamily: "var(--font-sans)" }}>
                      Artikel verlinkt
                    </span>
                  )}
                  {item.topics?.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)]"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {TOPIC_OPTIONS.find((o) => o.value === t)?.title ?? t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <Link
                href={`/admin/infografiken/${item._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Bearbeiten
              </Link>
              <button
                onClick={() => deleteItem(item._id)}
                className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Infografiken. Füge deine erste Infografik hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
