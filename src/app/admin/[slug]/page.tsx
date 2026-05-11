"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
}
interface Project {
  _id: string;
  title: string;
}
interface Source {
  _id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allSources, setAllSources] = useState<Source[]>([]);

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [language, setLanguage] = useState("de");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [excerptDe, setExcerptDe] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/articles/${slug}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch("/api/admin/sources").then((r) => r.json()),
    ]).then(([article, cats, projs, srcs]) => {
      setTitleDe(article.titleDe ?? "");
      setTitleEn(article.titleEn ?? "");
      setLanguage(article.language ?? "de");
      setStatus(article.status ?? "draft");
      setPublishedAt(article.publishedAt?.slice(0, 16) ?? "");
      setExcerptDe(article.excerptDe ?? "");
      setExcerptEn(article.excerptEn ?? "");
      setCategoryId(article.category?._id ?? "");
      setProjectId(article.project?._id ?? "");
      setSelectedSourceIds((article.sources ?? []).map((s: Source) => s._id));
      if (article.bodyDe) setBodyDe(portableTextToTiptap(article.bodyDe));
      if (article.bodyEn) setBodyEn(portableTextToTiptap(article.bodyEn));
      setCategories(cats);
      setProjects(projs);
      setAllSources(srcs);
      setLoaded(true);
    });
  }, [slug]);

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const patch: Record<string, unknown> = {
        titleDe, titleEn, language, status,
        publishedAt: new Date(publishedAt).toISOString(),
        excerptDe, excerptEn,
        bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : [],
        bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : [],
        sources: selectedSourceIds.map((id) => ({ _type: "reference", _ref: id, _key: id })),
      };
      if (categoryId) patch.category = { _type: "reference", _ref: categoryId };
      else patch.category = null;
      if (projectId) patch.project = { _type: "reference", _ref: projectId };
      else patch.project = null;

      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  if (!loaded) return <div className="text-[var(--color-muted)] py-12 text-center text-sm" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Artikel bearbeiten</h1>
        <button onClick={handleSave} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity" style={{ fontFamily: "var(--font-sans)" }}>
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm" style={{ fontFamily: "var(--font-sans)" }}>{error}</p>}

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Titel (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Kategorie</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }}>
            <option value="">— Keine —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.titleDe}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Projekt / Reihe</label>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }}>
            <option value="">— Kein Projekt —</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Sprache</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }}>
            <option value="de">Nur Deutsch</option>
            <option value="en">Only English</option>
            <option value="both">Beide / Both</option>
          </select>
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }}>
            <option value="idea">Idee</option>
            <option value="draft">Entwurf</option>
            <option value="ready">Bereit</option>
            <option value="published">Veröffentlicht</option>
            <option value="archived">Archiviert</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Veröffentlicht am</label>
          <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
        <div className="col-span-2">
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Vorschautext (DE)</label>
          <textarea value={excerptDe} onChange={(e) => setExcerptDe(e.target.value)} rows={2} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
        <div className="col-span-2">
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Excerpt (EN)</label>
          <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} rows={2} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
      </div>

      {/* Sources picker */}
      {allSources.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Quellen</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {allSources.map((s) => (
              <label key={s._id} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedSourceIds.includes(s._id)}
                  onChange={() => toggleSource(s._id)}
                  className="accent-[var(--color-accent)]"
                />
                <span className="text-sm text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-sans)" }}>
                  {s.authors} ({s.year}) — <em>{s.title}</em>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {(language === "de" || language === "both") && (
        <div>
          <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Inhalt (DE)</h2>
          <TiptapEditor content={bodyDe} onChange={setBodyDe} placeholder="Schreibe auf Deutsch..." />
        </div>
      )}

      {(language === "en" || language === "both") && (
        <div>
          <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Content (EN)</h2>
          <TiptapEditor content={bodyEn} onChange={setBodyEn} placeholder="Write in English..." />
        </div>
      )}
    </div>
  );
}
