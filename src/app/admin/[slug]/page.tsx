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

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("de");
  const [publishedAt, setPublishedAt] = useState("");
  const [excerptDe, setExcerptDe] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/articles/${slug}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([article, cats]) => {
      setTitleDe(article.titleDe ?? "");
      setTitleEn(article.titleEn ?? "");
      setLanguage(article.language ?? "de");
      setPublishedAt(article.publishedAt?.slice(0, 16) ?? "");
      setExcerptDe(article.excerptDe ?? "");
      setExcerptEn(article.excerptEn ?? "");
      setCategoryId(article.category?._id ?? "");
      if (article.bodyDe) setBodyDe(portableTextToTiptap(article.bodyDe));
      if (article.bodyEn) setBodyEn(portableTextToTiptap(article.bodyEn));
      setCategories(cats);
      setLoaded(true);
    });
  }, [slug]);

  async function handleSave() {
    setSaving(true);
    const patch: Record<string, unknown> = {
      titleDe, titleEn, language,
      publishedAt: new Date(publishedAt).toISOString(),
      excerptDe, excerptEn,
      bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : [],
      bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : [],
    };
    if (categoryId) patch.category = { _type: "reference", _ref: categoryId };

    await fetch(`/api/admin/articles/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    setSaving(false);
    router.push("/admin");
  }

  const inputClass = "w-full border border-stone-200 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white";
  const labelClass = "block text-sm font-medium text-stone-600 mb-1.5";

  if (!loaded) return <div className="text-stone-400 py-12 text-center">Lädt...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-800">Artikel bearbeiten</h1>
        <button onClick={handleSave} disabled={saving} className="bg-stone-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-stone-700 transition-colors">
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>

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
