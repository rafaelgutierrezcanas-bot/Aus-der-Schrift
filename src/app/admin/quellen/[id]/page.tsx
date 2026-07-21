"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatChicago } from "@/lib/formatChicago";

interface Passage {
  chapter?: string;
  pages?: string;
  text: string;
}

interface Source {
  _id: string;
  type: string;
  authors: string;
  title: string;
  year: number;
  publisher?: string;
  volume?: string;
  issue?: string;
  city?: string;
  edition?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  pages?: string;
  notes?: string;
  fileLink?: string;
  passages?: Passage[];
}

export default function QuelleEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<Source | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [doiLoading, setDoiLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  async function lookupDoi() {
    if (!form?.doi) return;
    setDoiLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/doi-lookup?doi=${encodeURIComponent(form.doi)}`);
      if (!res.ok) { setError("DOI nicht gefunden."); return; }
      const data = await res.json();
      setForm((f) => f ? {
        ...f,
        title: data.title || f.title,
        authors: data.authors || f.authors,
        year: data.year || f.year,
        publisher: data.publisher || f.publisher,
        type: data.type || f.type,
        volume: data.volume || f.volume,
        issue: data.issue || f.issue,
        pages: data.pages || f.pages,
      } : f);
    } catch {
      setError("DOI-Lookup fehlgeschlagen.");
    } finally {
      setDoiLoading(false);
    }
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/sources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin/quellen");
    } catch {
      setError("Fehler beim Speichern.");
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
      router.push("/admin/quellen");
    } catch {
      setError("Fehler beim Löschen.");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  if (!form) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]";
  const labelClass = "block text-xs font-medium text-[var(--color-muted)] mb-1";

  const isJournal = form.type === "journal";
  const isBook = form.type === "book";
  const isDissertation = form.type === "dissertation";

  const preview = form.title && form.authors ? formatChicago(form) : null;

  return (
    <div className="max-w-2xl" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Quelle bearbeiten</h1>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-red-700 font-medium">Wirklich löschen?</span>
            <button onClick={remove} disabled={deleting} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
              {deleting ? "…" : "Ja, löschen"}
            </button>
            <button onClick={() => setShowDeleteConfirm(false)} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
              Abbrechen
            </button>
          </div>
        ) : (
          <button onClick={() => setShowDeleteConfirm(true)} className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-600 border border-transparent hover:border-red-200 transition-colors">
            Quelle löschen
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

      <div className="space-y-4">
        {/* Type */}
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

        {/* Authors + Year */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className={labelClass}>Autor(en) <span className="font-normal">(z. B. McBrayer, J. P., &amp; Swenson, P.)</span></label>
            <input type="text" value={form.authors} onChange={(e) => set("authors", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jahr</label>
            <input type="number" value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} className={inputClass} />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className={labelClass}>Titel</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>

        {/* Journal fields */}
        {isJournal && (
          <>
            <div>
              <label className={labelClass}>Zeitschrift</label>
              <input type="text" placeholder="Religious Studies" value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Band (Volume)</label>
                <input type="text" placeholder="48" value={form.volume ?? ""} onChange={(e) => set("volume", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Heft (Issue)</label>
                <input type="text" placeholder="2" value={form.issue ?? ""} onChange={(e) => set("issue", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Seiten</label>
                <input type="text" placeholder="129–150" value={form.pages ?? ""} onChange={(e) => set("pages", e.target.value)} className={inputClass} />
              </div>
            </div>
            {/* DOI Lookup for existing */}
            <div>
              <label className={labelClass}>DOI</label>
              <div className="flex gap-2">
                <input type="text" value={form.doi ?? ""} onChange={(e) => set("doi", e.target.value)} className={inputClass + " flex-1 font-mono text-xs"} />
                {form.doi && (
                  <button onClick={lookupDoi} disabled={doiLoading} className="px-3 py-2 rounded-lg bg-[var(--color-accent)] text-white text-xs hover:opacity-90 disabled:opacity-50 shrink-0">
                    {doiLoading ? "…" : "Neu laden"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Book fields */}
        {isBook && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Verlagsort</label>
                <input type="text" placeholder="Göttingen" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Verlag</label>
                <input type="text" value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Auflage</label>
                <input type="text" placeholder="2" value={form.edition ?? ""} onChange={(e) => set("edition", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ISBN</label>
                <input type="text" value={form.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} className={inputClass} />
              </div>
            </div>
          </>
        )}

        {/* Dissertation */}
        {isDissertation && (
          <div>
            <label className={labelClass}>Universität / Institution</label>
            <input type="text" value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
          </div>
        )}

        {/* Website */}
        {form.type === "website" && (
          <>
            <div>
              <label className={labelClass}>Website-Name</label>
              <input type="text" value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL</label>
              <input type="url" value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} className={inputClass} />
            </div>
          </>
        )}

        {/* Common */}
        <div>
          <label className={labelClass}>Link zur Datei</label>
          <input type="url" value={form.fileLink ?? ""} onChange={(e) => set("fileLink", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Eigene Notizen</label>
          <textarea rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={inputClass + " resize-none"} />
        </div>

        {/* Passages */}
        <div className="border-t border-[var(--color-border)] pt-4 mt-2">
          <div className="flex items-center justify-between mb-3">
            <label className={labelClass + " mb-0"}>Textabschnitte / Passagen</label>
            <button
              onClick={() => {
                const passages = [...(form.passages ?? []), { chapter: "", pages: "", text: "" }];
                setForm((f) => f ? { ...f, passages } : f);
              }}
              className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-foreground)] transition-colors"
            >
              + Passage hinzufügen
            </button>
          </div>
          <p className="text-xs text-[var(--color-muted)] mb-3">
            Füge Abschnitte aus dem Buch hinzu, damit die KI darauf eingehen kann.
          </p>
          {(form.passages ?? []).length === 0 && (
            <p className="text-xs text-[var(--color-muted)] italic py-2">Keine Passagen hinzugefügt.</p>
          )}
          <div className="space-y-3">
            {(form.passages ?? []).map((p, i) => (
              <div key={i} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--color-muted)]">Passage {i + 1}</span>
                  <button
                    onClick={() => {
                      const passages = (form.passages ?? []).filter((_, j) => j !== i);
                      setForm((f) => f ? { ...f, passages } : f);
                    }}
                    className="text-xs text-[var(--color-muted)] hover:text-red-600 transition-colors"
                  >
                    Entfernen
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Kapitel / Abschnitt"
                    value={p.chapter ?? ""}
                    onChange={(e) => {
                      const passages = [...(form.passages ?? [])];
                      passages[i] = { ...passages[i], chapter: e.target.value };
                      setForm((f) => f ? { ...f, passages } : f);
                    }}
                    className={inputClass + " text-xs"}
                  />
                  <input
                    type="text"
                    placeholder="Seite(n), z. B. 42–45"
                    value={p.pages ?? ""}
                    onChange={(e) => {
                      const passages = [...(form.passages ?? [])];
                      passages[i] = { ...passages[i], pages: e.target.value };
                      setForm((f) => f ? { ...f, passages } : f);
                    }}
                    className={inputClass + " text-xs"}
                  />
                </div>
                <textarea
                  rows={4}
                  placeholder="Textpassage hier einfügen..."
                  value={p.text ?? ""}
                  onChange={(e) => {
                    const passages = [...(form.passages ?? [])];
                    passages[i] = { ...passages[i], text: e.target.value };
                    setForm((f) => f ? { ...f, passages } : f);
                  }}
                  className={inputClass + " resize-none text-xs leading-relaxed"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live preview */}
        {preview && (
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <p className="text-xs font-medium text-stone-500 mb-1.5">Vorschau (APA)</p>
            <p className="text-sm text-stone-700 leading-relaxed">{preview}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
