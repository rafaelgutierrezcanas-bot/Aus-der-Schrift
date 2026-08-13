"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
}

export default function EditKurzGefragtPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autoSaved, setAutoSaved] = useState<"saved" | "saving" | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [questionDe, setQuestionDe] = useState("");
  const [questionEn, setQuestionEn] = useState("");
  const [slug, setSlug] = useState("");
  const [verdict, setVerdict] = useState("");
  const [shortAnswerDe, setShortAnswerDe] = useState("");
  const [shortAnswerEn, setShortAnswerEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("de");
  const [status, setStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/kurz-gefragt/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([item, cats]) => {
      setQuestionDe(item.questionDe ?? "");
      setQuestionEn(item.questionEn ?? "");
      setSlug(item.slug?.current ?? "");
      setVerdict(item.verdict ?? "");
      setShortAnswerDe(item.shortAnswerDe ?? "");
      setShortAnswerEn(item.shortAnswerEn ?? "");
      setCategoryId(item.category?._id ?? "");
      setLanguage(item.language ?? "de");
      setStatus(item.status ?? "draft");
      setPublishedAt(item.publishedAt?.slice(0, 16) ?? "");
      if (item.bodyDe) setBodyDe(portableTextToTiptap(item.bodyDe));
      if (item.bodyEn) setBodyEn(portableTextToTiptap(item.bodyEn));
      setCategories(cats);
      setLoaded(true);
    });
  }, [id]);

  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => { hasLoadedRef.current = true; }, 200);
      return () => clearTimeout(t);
    }
  }, [loaded]);

  // Auto-save
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaved(null);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaved("saving");
      try {
        const patch = buildPatch();
        await fetch(`/api/admin/kurz-gefragt/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patch),
        });
        setAutoSaved("saved");
      } catch {
        setAutoSaved(null);
      }
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [questionDe, questionEn, verdict, shortAnswerDe, shortAnswerEn, categoryId, language, status, publishedAt, bodyDe, bodyEn]);

  function buildPatch() {
    const convertedDe = bodyDe ? tiptapToPortableText(bodyDe as any) : undefined;
    const convertedEn = bodyEn ? tiptapToPortableText(bodyEn as any) : undefined;
    const patch: Record<string, unknown> = {
      questionDe, questionEn: questionEn || null,
      slug: { _type: "slug", current: slug },
      verdict: verdict || null,
      shortAnswerDe, shortAnswerEn: shortAnswerEn || null,
      language, status,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      bodyDe: Array.isArray(convertedDe) && convertedDe.length > 0 ? convertedDe : undefined,
      bodyEn: Array.isArray(convertedEn) && convertedEn.length > 0 ? convertedEn : undefined,
    };
    if (categoryId) patch.category = { _type: "reference", _ref: categoryId };
    else patch.category = null;
    return patch;
  }

  async function handleSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/kurz-gefragt/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPatch()),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin/kurz-gefragt");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/kurz-gefragt/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "trashed" }),
      });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      router.push("/admin/kurz-gefragt");
    } catch {
      setError("Fehler beim Löschen.");
      setShowDeleteConfirm(false);
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  if (!loaded) return <div className="text-[var(--color-muted)] py-12 text-center text-sm" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</div>;

  const wordCount = shortAnswerDe.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)] truncate flex-1">
          {questionDe || "Frage bearbeiten"}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          {autoSaved === "saving" && <span className="text-xs text-[var(--color-muted)]">Speichert…</span>}
          {autoSaved === "saved" && <span className="text-xs text-green-600">Gespeichert</span>}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-700 font-medium">Löschen?</span>
              <button onClick={handleDelete} className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Ja</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">Nein</button>
            </div>
          ) : (
            <button onClick={() => setShowDeleteConfirm(true)} className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-600 transition-colors">
              Löschen
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="text-xs px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity font-medium">
            {saving ? "Speichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Frage (DE)</label>
          <input value={questionDe} onChange={(e) => setQuestionDe(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Question (EN)</label>
          <input value={questionEn} onChange={(e) => setQuestionEn(e.target.value)} className={inputClass} />
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
            <option value="archived">Archiviert</option>
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
          <textarea value={shortAnswerDe} onChange={(e) => setShortAnswerDe(e.target.value)} rows={3} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Short Answer (EN)</label>
          <textarea value={shortAnswerEn} onChange={(e) => setShortAnswerEn(e.target.value)} rows={3} className={inputClass} />
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
