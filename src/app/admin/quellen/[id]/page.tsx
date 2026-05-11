"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Source {
  _id: string;
  type: string;
  authors: string;
  title: string;
  year: number;
  publisher?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  pages?: string;
  notes?: string;
  fileLink?: string;
}

export default function QuelleEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<Source | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sources")
      .then((r) => r.json())
      .then((sources: Source[]) => {
        const s = sources.find((s) => s._id === id);
        if (s) setForm(s);
      });
  }, [id]);

  const set = (field: string, value: string | number) =>
    setForm((f) => f ? { ...f, [field]: value } : f);

  async function save() {
    if (!form) return;
    setSaving(true);
    await fetch(`/api/admin/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/quellen");
  }

  async function remove() {
    if (!confirm("Quelle wirklich löschen?")) return;
    setDeleting(true);
    await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
    router.push("/admin/quellen");
  }

  if (!form) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]";
  const labelClass = "block text-xs font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="max-w-2xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Quelle bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Typ</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputClass}>
            <option value="book">Buch</option>
            <option value="journal">Zeitschriftenartikel</option>
            <option value="dissertation">Dissertation / Hochschulschrift</option>
            <option value="website">Website</option>
            <option value="bible">Bibelausgabe</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Autor(en)</label>
            <input type="text" value={form.authors} onChange={(e) => set("authors", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jahr</label>
            <input type="number" value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Titel</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Verlag / Zeitschrift</label>
            <input type="text" value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Seiten</label>
            <input type="text" value={form.pages ?? ""} onChange={(e) => set("pages", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>DOI</label>
            <input type="text" value={form.doi ?? ""} onChange={(e) => set("doi", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>ISBN</label>
            <input type="text" value={form.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>URL</label>
          <input type="url" value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Link zur Datei</label>
          <input type="url" value={form.fileLink ?? ""} onChange={(e) => set("fileLink", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Eigene Notizen</label>
          <textarea rows={4} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={inputClass + " resize-none"} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
          <button onClick={remove} disabled={deleting} className="ml-auto px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            {deleting ? "..." : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
