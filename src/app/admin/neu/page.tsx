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

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("de");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [excerptDe, setExcerptDe] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
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

  const inputClass = "w-full border border-stone-200 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white";
  const labelClass = "block text-sm font-medium text-stone-600 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-800">Neuer Artikel</h1>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="border border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm hover:bg-stone-100 transition-colors">
            {saving ? "Speichert..." : "Entwurf speichern"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="bg-stone-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-stone-700 transition-colors">
            Publizieren
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="bg-white rounded-xl border border-stone-200 p-6 grid grid-cols-2 gap-4">
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
          <label className={labelClass}>Kategorie</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">— Keine —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.titleDe}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sprache</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            <option value="de">Nur Deutsch</option>
            <option value="en">Only English</option>
            <option value="both">Beide / Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
          >
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
          <h2 className="text-lg font-medium text-stone-700 mb-3">Inhalt (DE)</h2>
          <TiptapEditor content={bodyDe} onChange={setBodyDe} placeholder="Schreibe auf Deutsch..." />
        </div>
      )}

      {(language === "en" || language === "both") && (
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-3">Content (EN)</h2>
          <TiptapEditor content={bodyEn} onChange={setBodyEn} placeholder="Write in English..." />
        </div>
      )}
    </div>
  );
}
