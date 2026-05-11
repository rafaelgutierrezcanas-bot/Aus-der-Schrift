"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMPTY = {
  type: "book",
  authors: "",
  title: "",
  year: new Date().getFullYear(),
  publisher: "",
  doi: "",
  isbn: "",
  url: "",
  pages: "",
  notes: "",
  fileLink: "",
};

export default function NeueQuelleePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [doiLoading, setDoiLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function lookupDoi() {
    if (!form.doi) return;
    setDoiLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/doi-lookup?doi=${encodeURIComponent(form.doi)}`);
      if (!res.ok) { setError("DOI nicht gefunden."); return; }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        authors: data.authors || f.authors,
        year: data.year || f.year,
        publisher: data.publisher || f.publisher,
        type: data.type || f.type,
      }));
    } catch {
      setError("DOI-Lookup fehlgeschlagen.");
    } finally {
      setDoiLoading(false);
    }
  }

  async function save() {
    if (!form.title || !form.authors || !form.year) {
      setError("Titel, Autor und Jahr sind Pflichtfelder.");
      return;
    }
    setSaving(true);
    await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/quellen");
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";
  const labelClass = "block text-xs font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="max-w-2xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neue Quelle</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* DOI Lookup */}
      <div className="mb-6 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <p className="text-xs font-medium text-[var(--color-muted)] mb-2">
          DOI-Schnellimport (optional)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="z.B. 10.1234/example"
            value={form.doi}
            onChange={(e) => set("doi", e.target.value)}
            className={inputClass + " flex-1"}
          />
          <button
            onClick={lookupDoi}
            disabled={doiLoading || !form.doi}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {doiLoading ? "..." : "Laden"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Typ *</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputClass}>
            <option value="book">Buch</option>
            <option value="journal">Zeitschriftenartikel</option>
            <option value="dissertation">Dissertation / Hochschulschrift</option>
            <option value="website">Website</option>
            <option value="bible">Bibelausgabe</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Autor(en) *</label>
            <input type="text" placeholder="Pannenberg, Wolfhart" value={form.authors} onChange={(e) => set("authors", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jahr *</label>
            <input type="number" value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Titel *</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Verlag / Zeitschrift</label>
            <input type="text" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Seiten</label>
            <input type="text" placeholder="143–158" value={form.pages} onChange={(e) => set("pages", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>ISBN</label>
            <input type="text" value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Link zur Datei (Google Drive, JSTOR etc.)</label>
          <input type="url" value={form.fileLink} onChange={(e) => set("fileLink", e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Eigene Notizen</label>
          <textarea rows={4} placeholder="Wichtige Argumente, Seitenverweise..." value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inputClass + " resize-none"} />
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Quelle speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
