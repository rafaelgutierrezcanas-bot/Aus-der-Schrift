"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Quote {
  _id: string;
  text: string;
  author: string;
  topics: string[];
  source?: { _id: string; title: string; author: string; year?: number };
}

export default function ZitatePage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then((r) => r.json())
      .then((data) => { setQuotes(data); setLoading(false); });
  }, []);

  async function deleteQuote(id: string) {
    if (!confirm("Zitat löschen?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    setQuotes((prev) => prev.filter((q) => q._id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Zitate</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            Theologische Zitate, thematisch geordnet.
          </p>
        </div>
        <Link
          href="/admin/zitate/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neues Zitat
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {quotes.map((quote) => (
          <div key={quote._id} className="flex items-start justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--color-foreground)] line-clamp-2 italic" style={{ fontFamily: "var(--font-sans)" }}>
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                — {quote.author}{quote.source ? `, ${quote.source.title}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/zitate/${quote._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Bearbeiten
              </Link>
              <button onClick={() => deleteQuote(quote._id)} className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && quotes.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Zitate. Füge dein erstes Zitat hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
