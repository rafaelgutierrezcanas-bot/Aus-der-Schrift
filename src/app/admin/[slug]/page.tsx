"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";
import type { Source } from "@/components/admin/TiptapEditor";
import { urlFor } from "@/sanity/image";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
}
interface Project {
  _id: string;
  title: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autoSaved, setAutoSaved] = useState<"saved" | "saving" | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
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
  const [featuredImage, setFeaturedImage] = useState<object | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");

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
      setFeaturedImage(article.featuredImage ?? null);
      setCategories(cats);
      setProjects(projs);
      setAllSources(srcs);
      setLoaded(true);
    });
  }, [slug]);

  // Mark load complete after a tick so auto-save doesn't fire on initial data
  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => { hasLoadedRef.current = true; }, 200);
      return () => clearTimeout(t);
    }
  }, [loaded]);

  // Auto-save 2 seconds after any change
  const buildPatch = useCallback(() => {
    const patch: Record<string, unknown> = {
      titleDe, titleEn, language, status,
      publishedAt: publishedAt ? new Date(publishedAt).toISOString() : undefined,
      excerptDe, excerptEn,
      bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : [],
      bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : [],
      sources: selectedSourceIds.map((id) => ({ _type: "reference", _ref: id, _key: id })),
      featuredImage: featuredImage ?? null,
    };
    if (categoryId) patch.category = { _type: "reference", _ref: categoryId };
    else patch.category = null;
    if (projectId) patch.project = { _type: "reference", _ref: projectId };
    else patch.project = null;
    return patch;
  }, [titleDe, titleEn, categoryId, projectId, selectedSourceIds, language, status, publishedAt, excerptDe, excerptEn, bodyDe, bodyEn, featuredImage]);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaved(null);
    autoSaveTimer.current = setTimeout(async () => {
      setAutoSaved("saving");
      try {
        await fetch(`/api/admin/articles/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPatch()),
        });
        setAutoSaved("saved");
      } catch {
        setAutoSaved(null);
      }
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [titleDe, titleEn, categoryId, projectId, selectedSourceIds, language, status, publishedAt, excerptDe, excerptEn, bodyDe, bodyEn, featuredImage]);

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPatch()),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setImageError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setImageError(data.error ?? "Upload fehlgeschlagen");
        return;
      }
      setFeaturedImage(data);
      await fetch(`/api/admin/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredImage: data }),
      });
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

  async function handleImageRemove() {
    setFeaturedImage(null);
    setImageError("");
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredImage: null }),
      });
      if (!res.ok) {
        // Revert optimistic update on failure
        const data = await res.json().catch(() => ({}));
        setImageError(data.error ?? "Bild konnte nicht entfernt werden");
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Bild konnte nicht entfernt werden");
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  if (!loaded) return <div className="text-[var(--color-muted)] py-12 text-center text-sm" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Artikel bearbeiten</h1>
        <div className="flex items-center gap-3">
          {autoSaved === "saving" && (
            <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Speichert…</span>
          )}
          {autoSaved === "saved" && (
            <span className="text-xs text-green-600" style={{ fontFamily: "var(--font-sans)" }}>Automatisch gespeichert</span>
          )}
          <button onClick={handleSave} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity" style={{ fontFamily: "var(--font-sans)" }}>
            {saving ? "Speichert..." : "Speichern & Zurück"}
          </button>
        </div>
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

      {/* Titelbild */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Titelbild</h2>
        {featuredImage ? (
          <div className="relative inline-block">
            <img
              src={urlFor(featuredImage as Parameters<typeof urlFor>[0]).width(600).height(338).fit("crop").url()}
              alt="Titelbild Vorschau"
              className="rounded-lg w-full max-w-sm h-auto block"
            />
            <button
              type="button"
              onClick={handleImageRemove}
              className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-stone-500 hover:text-red-500 transition-colors text-lg leading-none"
              title="Bild entfernen"
            >
              ×
            </button>
          </div>
        ) : (
          <label
            className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 transition-colors ${
              imageUploading
                ? "border-stone-200 bg-stone-50 cursor-not-allowed"
                : "border-stone-200 hover:border-stone-400 cursor-pointer"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {imageUploading ? (
              <span className="text-sm text-stone-400">Lädt hoch…</span>
            ) : (
              <>
                <span className="text-2xl">🖼️</span>
                <span className="text-sm text-stone-500">Bild auswählen</span>
                <span className="text-xs text-stone-400">JPG, PNG, WebP</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={imageUploading}
              onChange={handleImageUpload}
            />
          </label>
        )}
        {imageError && (
          <p className="mt-2 text-sm text-red-500" style={{ fontFamily: "var(--font-sans)" }}>{imageError}</p>
        )}
      </div>

      {(language === "de" || language === "both") && (
        <div>
          <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Inhalt (DE)</h2>
          <TiptapEditor
            content={bodyDe}
            onChange={setBodyDe}
            placeholder="Schreibe auf Deutsch..."
            sources={allSources.filter((s) => selectedSourceIds.includes(s._id))}
            zitatBankKey={`zitate-${slug}`}
          />
        </div>
      )}

      {(language === "en" || language === "both") && (
        <div>
          <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Content (EN)</h2>
          <TiptapEditor
            content={bodyEn}
            onChange={setBodyEn}
            placeholder="Write in English..."
            sources={allSources.filter((s) => selectedSourceIds.includes(s._id))}
            zitatBankKey={`zitate-${slug}-en`}
          />
        </div>
      )}
    </div>
  );
}
