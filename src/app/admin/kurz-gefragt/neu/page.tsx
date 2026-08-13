"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
}

export default function NewKurzGefragtPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [questionDe, setQuestionDe] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [slug, setSlug] = useState("");
  const [verdict, setVerdict] = useState("");
  const [shortAnswerDe, setShortAnswerDe] = useState("");
  const [shortAnswerEn, setShortAnswerEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("de");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  useEffect(() => {
    setSlug(
      questionDe
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }, [questionDe]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const doc: Record<string, unknown> = {
        questionDe, questionEn,
        slug: { _type: "slug", current: slug },
        verdict: verdict || undefined,
        shortAnswerDe, shortAnswerEn: shortAnswerEn || undefined,
        language, status,
        publishedAt: new Date(publishedAt).toISOString(),
        bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : undefined,
        bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : undefined,
      };
      if (categoryId) doc.category = { _type: "reference", _ref: categoryId };

      const res = await fetch("/api/admin/kurz-gefragt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin/kurz-gefragt");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  const wordCount = shortAnswerDe.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Neue Frage</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium"
        >
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Frage (DE)</label>
          <input value={questionDe} onChange={(e) => setQuestionDe(e.target.value)} className={inputClass} placeholder="War das Nadelöhr ein Tor in Jerusalem?" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Question (EN)</label>
          <input value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} className={inputClass} placeholder="Was the Eye of the Needle a Gate in Jerusalem?" />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Verdict</label>
          <select value={verdict} onChange={(e) => setVerdict(e.target.value)} className={inputClass}>
            <option value="">— Kein Verdict —</option>
            <option value="ja">Ja</option>
            <option value="nein">Nein</option>
            <option value="teilweise">Teilweise</option>
            <option value="umstritten">Umstritten</option>
          </select>
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
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
            <option value="idea">Idee</option>
            <option value="draft">Entwurf</option>
            <option value="ready">Bereit</option>
            <option value="published">Veröffentlicht</option>
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
          <label className={labelClass}>
            Kurzantwort (DE)
            <span className={`ml-2 text-xs ${wordCount < 30 || wordCount > 80 ? "text-amber-500" : "text-green-600"}`}>
              {wordCount} Wörter (Ziel: 40–60)
            </span>
          </label>
          <textarea value={shortAnswerDe} onChange={(e) => setShortAnswerDe(e.target.value)} rows={3} className={inputClass} placeholder="Kurze Antwort in 40–60 Wörtern..." />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Short Answer (EN)</label>
          <textarea value={shortAnswerEn} onChange={(e) => setShortAnswerEn(e.target.value)} rows={3} className={inputClass} placeholder="Short answer in 40–60 words..." />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Inhalt (DE)</h2>
        <TiptapEditor content={bodyDe} onChange={setBodyDe} placeholder="Ausführliche Antwort auf Deutsch..." />
      </div>

      <div>
        <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Content (EN)</h2>
        <TiptapEditor content={bodyEn} onChange={setBodyEn} placeholder="Detailed answer in English..." />
      </div>
    </div>
  );
}
