"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
  slug: { current: string };
}
interface Project {
  _id: string;
  title: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [language, setLanguage] = useState("de");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [excerptDe, setExcerptDe] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
    ]).then(([cats, projs]) => {
      setCategories(cats);
      setProjects(projs);
    });
  }, []);

  useEffect(() => {
    setSlug(
      titleDe
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }, [titleDe]);

  async function handleSave(publish: boolean) {
    setSaving(true);
    setError("");
    try {
      const doc: Record<string, unknown> = {
        titleDe, titleEn,
        slug: { _type: "slug", current: slug },
        language,
        status,
        publishedAt: new Date(publishedAt).toISOString(),
        excerptDe, excerptEn,
        bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : [],
        bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : [],
      };
      if (categoryId) doc.category = { _type: "reference", _ref: categoryId };
      if (projectId) doc.project = { _type: "reference", _ref: projectId };

      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Neuer Artikel</h1>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
            {saving ? "Speichert..." : "Entwurf speichern"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity" style={{ fontFamily: "var(--font-sans)" }}>
            Publizieren
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Titel (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
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
        <div>
          <label className={labelClass}>Veröffentlicht am</label>
          <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Vorschautext (DE)</label>
          <textarea value={excerptDe} onChange={(e) => setExcerptDe(e.target.value)} rows={2} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Excerpt (EN)</label>
          <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} rows={2} className={inputClass} />
        </div>
      </div>

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
