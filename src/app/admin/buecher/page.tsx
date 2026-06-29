"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIFFICULTY_OPTIONS, TOPIC_OPTIONS } from "@/lib/ressourcen";

interface Book {
  _id: string;
  title: string;
  author: string;
  year?: number;
  difficulty: string;
  topics: string[];
  description: string;
}

const difficultyColor: Record<string, string> = {
  einsteiger: "text-emerald-600 bg-emerald-50 border-emerald-200",
  mittel: "text-amber-700 bg-amber-50 border-amber-200",
  fortgeschritten: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function BuecherPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/books")
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); });
  }, []);

  async function deleteBook(id: string) {
    if (!confirm("Buch löschen?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Bücher</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            Empfehlenswerte theologische Literatur für die Ressourcen-Seite.
          </p>
        </div>
        <Link
          href="/admin/buecher/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neues Buch
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {books.map((book) => (
          <div
            key={book._id}
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-foreground)] text-sm truncate" style={{ fontFamily: "var(--font-sans)" }}>
                {book.title}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {book.author}{book.year ? ` · ${book.year}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              {book.difficulty && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyColor[book.difficulty] ?? ""}`} style={{ fontFamily: "var(--font-sans)" }}>
                  {DIFFICULTY_OPTIONS.find((d) => d.value === book.difficulty)?.title ?? book.difficulty}
                </span>
              )}
              <Link
                href={`/admin/buecher/${book._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Bearbeiten
              </Link>
              <button
                onClick={() => deleteBook(book._id)}
                className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && books.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Bücher. Füge dein erstes Buch hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
