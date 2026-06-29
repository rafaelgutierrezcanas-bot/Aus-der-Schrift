"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

interface Book { _id: string; title: string; author: string; year?: number }

export default function EditZitatPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/quotes/${id}`).then((r) => r.json()),
      fetch("/api/admin/books").then((r) => r.json()),
    ]).then(([quote, bookList]) => {
      setText(quote.text ?? "");
      setAuthor(quote.author ?? "");
      setTopics(quote.topics ?? []);
      setSourceId(quote.source?._id ?? "");
      setBooks(bookList);
      setLoading(false);
    });
  }, [id]);

  function toggleTopic(value: string) {
    setTopics((prev) => prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]);
  }

  async function save() {
    if (!text.trim() || !author.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.trim(),
        author: author.trim(),
        topics,
        source: sourceId ? { _type: "reference", _ref: sourceId } : null,
      }),
    });
    setSaving(false);
    router.push("/admin/zitate");
  }

  async function deleteQuote() {
    if (!confirm("Zitat löschen?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    router.push("/admin/zitate");
  }

  if (loading) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Zitat bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Zitattext *</label>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Quelle (optional)</label>
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className={inputClass}>
            <option value="">— Kein Buch verknüpft —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>{b.title} – {b.author}{b.year ? ` (${b.year})` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen *</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button key={t.value} type="button" onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}>
                {t.title}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !text.trim() || !author.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}>
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            Abbrechen
          </button>
          <button onClick={deleteQuote} className="ml-auto text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
