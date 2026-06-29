"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DIFFICULTY_OPTIONS, TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

export default function EditBuchPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("einsteiger");
  const [topics, setTopics] = useState<string[]>([]);
  const [buyLink, setBuyLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setAuthor(data.author ?? "");
        setYear(data.year ? String(data.year) : "");
        setDescription(data.description ?? "");
        setDifficulty(data.difficulty ?? "einsteiger");
        setTopics(data.topics ?? []);
        setBuyLink(data.buyLink ?? "");
        setLoading(false);
      });
  }, [id]);

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function save() {
    if (!title.trim() || !author.trim() || !description.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim(),
        year: year ? parseInt(year) : null,
        description: description.trim(),
        difficulty,
        topics,
        buyLink: buyLink.trim() || null,
      }),
    });
    setSaving(false);
    router.push("/admin/buecher");
  }

  async function deleteBook() {
    if (!confirm("Buch löschen?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    router.push("/admin/buecher");
  }

  if (loading) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Buch bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor(en) *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Jahr</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="2024" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kurzbeschreibung *</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Schwierigkeitsgrad *</label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  difficulty === d.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}>
                {d.title}
              </button>
            ))}
          </div>
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
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kauflink (optional)</label>
          <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !title.trim() || !author.trim() || !description.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}>
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            Abbrechen
          </button>
          <button onClick={deleteBook} className="ml-auto text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}>
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
