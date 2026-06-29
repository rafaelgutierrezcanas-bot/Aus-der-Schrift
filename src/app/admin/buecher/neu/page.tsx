"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIFFICULTY_OPTIONS, TOPIC_OPTIONS, BOOK_TYPE_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

export default function NeuesBuchPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("einsteiger");
  const [topics, setTopics] = useState<string[]>([]);
  const [buyLink, setBuyLink] = useState("");
  const [reviewSlug, setReviewSlug] = useState("");
  const [bookType, setBookType] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function save() {
    if (!title.trim() || !author.trim() || !description.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim(),
        year: year ? parseInt(year) : undefined,
        description: description.trim(),
        difficulty,
        topics,
        buyLink: buyLink.trim() || undefined,
        bookType: bookType || undefined,
        reviewSlug: reviewSlug.trim() || undefined,
      }),
    });
    router.push("/admin/buecher");
  }

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neues Buch</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Buchtitel" autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor(en) *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} placeholder="Vorname Nachname" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Jahr</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="2024" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kurzbeschreibung *</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " resize-none"} placeholder="Warum empfiehlst du dieses Buch?" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Schwierigkeitsgrad *</label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  difficulty === d.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {d.title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Buchtyp (optional)</label>
          <div className="flex flex-wrap gap-2">
            {BOOK_TYPE_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setBookType(bookType === t.value ? "" : t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  bookType === t.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen * (mind. 1)</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kauflink (optional)</label>
          <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Rezensions-Artikel Slug (optional)</label>
          <input type="text" value={reviewSlug} onChange={(e) => setReviewSlug(e.target.value)} className={inputClass} placeholder="meine-rezension-zu-x" />
          <p className="text-[10px] text-[var(--color-muted)] mt-1">Slug des Blog-Artikels mit deiner Rezension</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving || !title.trim() || !author.trim() || !description.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? "Speichern..." : "Buch speichern"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
