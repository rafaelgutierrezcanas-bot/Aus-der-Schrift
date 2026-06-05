"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatChicago } from "@/lib/formatChicago";

const EMPTY = {
  type: "book",
  authors: "",
  title: "",
  year: new Date().getFullYear(),
  publisher: "",
  volume: "",
  issue: "",
  city: "",
  edition: "",
  doi: "",
  isbn: "",
  url: "",
  pages: "",
  notes: "",
  fileLink: "",
};

/**
 * Parse APA-formatted reference string into structured fields.
 * Handles:
 *   McBrayer, J. P., & Swenson, P. (2012). Title. Journal, 48(2), 129–150. https://doi.org/...
 *   Pannenberg, W. (1988). Systematische Theologie. Göttingen: Vandenhoeck & Ruprecht.
 */
function parseApa(raw: string): Partial<typeof EMPTY> {
  const result: Partial<typeof EMPTY> = {};

  // Extract DOI
  const doiMatch = raw.match(/https?:\/\/doi\.org\/([\S]+)/i) || raw.match(/\b(10\.\d{4,}\/[\S]+)/);
  if (doiMatch) result.doi = doiMatch[1] ?? doiMatch[0];

  // Extract year — first (YYYY) pattern
  const yearMatch = raw.match(/\((\d{4})\)/);
  if (yearMatch) result.year = parseInt(yearMatch[1]);

  // Split into "before year" and "after year"
  const yearIdx = yearMatch ? raw.indexOf(yearMatch[0]) : -1;
  if (yearIdx > 0) {
    result.authors = raw.slice(0, yearIdx).trim().replace(/,\s*$/, "").trim();
  }

  const afterYear = yearIdx > 0 ? raw.slice(yearIdx + yearMatch![0].length).trim() : raw;

  // Split remaining by ". " to get title, journal/publisher, etc.
  const parts = afterYear.split(/\.\s+/).map((p) => p.trim()).filter(Boolean);

  if (parts.length >= 1) {
    // First part is the article/book title (remove trailing period)
    result.title = parts[0].replace(/\.$/, "").trim();
  }

  if (parts.length >= 2) {
    const rest = parts[1];

    // Check for volume(issue) pattern → journal article
    const volIssueMatch = rest.match(/,\s*(\d+)\((\d+)\)/);
    const volOnlyMatch = rest.match(/,\s*(\d+),\s*(\d+[–-]\d+)/); // volume, pages without issue

    if (volIssueMatch) {
      result.type = "journal";
      const journalName = rest.slice(0, volIssueMatch.index).replace(/,$/, "").trim();
      result.publisher = journalName;
      result.volume = volIssueMatch[1];
      result.issue = volIssueMatch[2];
      // Pages: after "volume(issue),"
      const afterVolIssue = rest.slice((volIssueMatch.index ?? 0) + volIssueMatch[0].length);
      const pagesMatch = afterVolIssue.match(/[\s,]+(\d+[–-]\d+|\d+)/);
      if (pagesMatch) result.pages = pagesMatch[1].replace("-", "–");
    } else if (volOnlyMatch) {
      result.type = "journal";
      const journalName = rest.slice(0, volOnlyMatch.index).replace(/,$/, "").trim();
      result.publisher = journalName;
      result.volume = volOnlyMatch[1];
      result.pages = volOnlyMatch[2].replace("-", "–");
    } else {
      // Book: check for "City: Publisher" pattern
      const cityPubMatch = rest.match(/^(.+?):\s*(.+)$/);
      if (cityPubMatch) {
        result.type = "book";
        result.city = cityPubMatch[1].trim();
        result.publisher = cityPubMatch[2].replace(/\.$/, "").trim();
      } else {
        result.type = "book";
        result.publisher = rest.replace(/\.$/, "").trim();
      }
    }
  }

  return result;
}

export default function NeueQuelleePage() {
  const router = useRouter();
  const [mode, setMode] = useState<"structured" | "freetext">("structured");
  const [freetext, setFreetext] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [doiLoading, setDoiLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  // Live preview of the formatted citation
  const preview = form.title && form.authors
    ? formatChicago({ _id: "", ...form } as Parameters<typeof formatChicago>[0])
    : null;

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
        volume: data.volume || f.volume,
        issue: data.issue || f.issue,
        pages: data.pages || f.pages,
      }));
    } catch {
      setError("DOI-Lookup fehlgeschlagen.");
    } finally {
      setDoiLoading(false);
    }
  }

  function applyFreetext() {
    if (!freetext.trim()) return;
    const parsed = parseApa(freetext.trim());
    setForm((f) => ({ ...f, ...parsed, notes: freetext }));
    setMode("structured");
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (mode === "freetext") {
        if (!freetext.trim()) {
          setError("Bitte gib eine Quellenangabe ein.");
          setSaving(false);
          return;
        }
        const parsed = parseApa(freetext.trim());
        const payload = { ...EMPTY, ...parsed, notes: freetext };
        await fetch("/api/admin/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        if (!form.title || !form.authors || !form.year) {
          setError("Titel, Autor und Jahr sind Pflichtfelder.");
          setSaving(false);
          return;
        }
        await fetch("/api/admin/sources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      router.push("/admin/quellen");
    } catch {
      setError("Fehler beim Speichern.");
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";
  const labelClass = "block text-xs font-medium text-[var(--color-muted)] mb-1";

  const isJournal = form.type === "journal";
  const isBook = form.type === "book";
  const isDissertation = form.type === "dissertation";

  return (
    <div className="max-w-2xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neue Quelle</h1>

      {/* Mode toggle */}
      <div className="flex gap-1 mb-6 p-1 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] w-fit">
        <button
          onClick={() => setMode("structured")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === "structured" ? "bg-white text-[var(--color-foreground)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}
        >
          Strukturiert
        </button>
        <button
          onClick={() => setMode("freetext")}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${mode === "freetext" ? "bg-white text-[var(--color-foreground)] shadow-sm" : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]"}`}
        >
          APA einfügen
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
      )}

      {/* Freetext / APA paste mode */}
      {mode === "freetext" && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--color-muted)]">
            Füge eine vollständige APA-Quellenangabe ein. Die Felder werden automatisch erkannt.
          </p>
          <textarea
            rows={5}
            placeholder={"McBrayer, J. P., & Swenson, P. (2012). Scepticism about the argument from divine hiddenness. Religious Studies, 48(2), 129–150. https://doi.org/10.1017/S003441251100014X"}
            value={freetext}
            onChange={(e) => setFreetext(e.target.value)}
            className={inputClass + " resize-none"}
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={applyFreetext}
              disabled={!freetext.trim()}
              className="px-5 py-2 rounded-lg border border-[var(--color-accent)] text-[var(--color-accent)] text-sm hover:bg-[var(--color-accent)]/5 disabled:opacity-40 transition-colors"
            >
              Felder automatisch ausfüllen
            </button>
            <button
              onClick={save}
              disabled={saving || !freetext.trim()}
              className="px-6 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Speichern..." : "Direkt speichern"}
            </button>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Structured mode */}
      {mode === "structured" && (
        <>
          {/* DOI Lookup */}
          <div className="mb-6 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
            <p className="text-xs font-medium text-[var(--color-muted)] mb-2">
              DOI-Schnellimport — alle Felder werden automatisch ausgefüllt
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="z.B. 10.1017/S003441251100014X"
                value={form.doi}
                onChange={(e) => set("doi", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") lookupDoi(); }}
                className={inputClass + " flex-1 font-mono text-xs"}
              />
              <button
                onClick={lookupDoi}
                disabled={doiLoading || !form.doi}
                className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
              >
                {doiLoading ? "Lädt…" : "Laden"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Type */}
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

            {/* Authors + Year */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>Autor(en) * <span className="font-normal">(z. B. McBrayer, J. P., &amp; Swenson, P.)</span></label>
                <input
                  type="text"
                  placeholder="Nachname, I., & Nachname2, I."
                  value={form.authors}
                  onChange={(e) => set("authors", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Jahr *</label>
                <input type="number" value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} className={inputClass} />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className={labelClass}>Titel *</label>
              <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
            </div>

            {/* Journal-specific fields */}
            {isJournal && (
              <>
                <div>
                  <label className={labelClass}>Zeitschrift *</label>
                  <input type="text" placeholder="Religious Studies" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Band (Volume)</label>
                    <input type="text" placeholder="48" value={form.volume} onChange={(e) => set("volume", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Heft (Issue)</label>
                    <input type="text" placeholder="2" value={form.issue} onChange={(e) => set("issue", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Seiten</label>
                    <input type="text" placeholder="129–150" value={form.pages} onChange={(e) => set("pages", e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>DOI</label>
                  <input type="text" placeholder="10.1017/S003441251100014X" value={form.doi} onChange={(e) => set("doi", e.target.value)} className={inputClass + " font-mono text-xs"} />
                </div>
              </>
            )}

            {/* Book-specific fields */}
            {isBook && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Verlagsort</label>
                    <input type="text" placeholder="Göttingen" value={form.city} onChange={(e) => set("city", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Verlag</label>
                    <input type="text" placeholder="Vandenhoeck & Ruprecht" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Auflage</label>
                    <input type="text" placeholder="2" value={form.edition} onChange={(e) => set("edition", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>ISBN</label>
                    <input type="text" value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {/* Dissertation-specific */}
            {isDissertation && (
              <div>
                <label className={labelClass}>Universität / Institution</label>
                <input type="text" placeholder="Universität München" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
              </div>
            )}

            {/* Website */}
            {form.type === "website" && (
              <>
                <div>
                  <label className={labelClass}>Website-Name</label>
                  <input type="text" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>URL</label>
                  <input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} className={inputClass} />
                </div>
              </>
            )}

            {/* Common: fileLink, notes */}
            <div>
              <label className={labelClass}>Link zur Datei (Google Drive, JSTOR etc.)</label>
              <input type="url" value={form.fileLink} onChange={(e) => set("fileLink", e.target.value)} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Eigene Notizen</label>
              <textarea rows={3} placeholder="Wichtige Argumente, Seitenverweise..." value={form.notes} onChange={(e) => set("notes", e.target.value)} className={inputClass + " resize-none"} />
            </div>

            {/* Live preview */}
            {preview && (
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <p className="text-xs font-medium text-stone-500 mb-1.5">Vorschau (APA)</p>
                <p className="text-sm text-stone-700 leading-relaxed">{preview}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
                {saving ? "Speichern..." : "Quelle speichern"}
              </button>
              <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
                Abbrechen
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
