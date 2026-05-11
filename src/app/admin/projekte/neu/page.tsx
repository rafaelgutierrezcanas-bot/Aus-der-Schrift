"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NeuesProjektPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const slug = title
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, slug: { _type: "slug", current: slug } }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/projekte");
    } catch {
      setError("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Neues Projekt</h1>
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity disabled:opacity-40"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm" style={{ fontFamily: "var(--font-sans)" }}>{error}</p>}

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 space-y-4">
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Titel *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            style={{ fontFamily: "var(--font-sans)" }}
            placeholder="z.B. Paulinische Briefe"
            autoFocus
          />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Beschreibung</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
            style={{ fontFamily: "var(--font-sans)" }}
            placeholder="Kurze Beschreibung der Reihe..."
          />
        </div>
      </div>
    </div>
  );
}
