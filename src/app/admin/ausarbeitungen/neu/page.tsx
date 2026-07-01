"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

export default function NeueAusarbeitungPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishedAt, setPublishedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [topics, setTopics] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function save() {
    if (!title.trim() || !publishedAt || topics.length === 0 || !file) return;
    setSaving(true);

    // Step 1: Upload PDF file
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/admin/ausarbeitungen/upload", {
      method: "POST",
      body: formData,
    });
    const { _id: fileAssetId } = await uploadRes.json();

    // Step 2: Create Ausarbeitung document
    await fetch("/api/admin/ausarbeitungen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        publishedAt,
        topics,
        fileAssetId,
      }),
    });

    router.push("/admin/ausarbeitungen");
  }

  const canSave = !saving && title.trim() && publishedAt && topics.length > 0 && file !== null;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neue Ausarbeitung</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Titel der Ausarbeitung"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Beschreibung (optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass + " resize-none"}
            placeholder="Kurze Beschreibung des Inhalts"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Datum *</label>
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputClass}
          />
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
        <div className="border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs font-medium text-[var(--color-foreground)] mb-3">PDF-Datei *</p>

          {file && (
            <div className="flex items-center gap-3 mb-3 p-3 rounded-lg bg-[var(--color-accent)]/10 border border-[var(--color-accent)]">
              <span className="text-lg">📄</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--color-accent)] font-medium">Datei ausgewählt</p>
                <p className="text-xs text-[var(--color-foreground)] truncate">{file.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors shrink-0"
              >
                ✕
              </button>
            </div>
          )}

          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-accent)] transition-colors">
            <span>📎</span>
            {file ? "Andere Datei wählen" : "PDF hochladen"}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={!canSave}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? "Speichern..." : "Ausarbeitung speichern"}
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
