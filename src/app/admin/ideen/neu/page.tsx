"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NeueIdeePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/admin/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), notes: notes.trim() }),
    });
    router.push("/admin/ideen");
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neue Idee</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input
            type="text"
            placeholder="Worum geht es?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Gedanken / Notizen</label>
          <textarea
            rows={6}
            placeholder="Erste Gedanken, Kernthesen, offene Fragen..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass + " resize-none"}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Idee speichern"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
