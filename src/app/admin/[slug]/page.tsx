"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";
import type { Source, EntwurfThema } from "@/components/admin/TiptapEditor";
import { urlFor } from "@/sanity/image";

interface LocalBackup {
  titleDe: string;
  titleEn: string;
  excerptDe: string;
  excerptEn: string;
  bodyDe: object | null;
  bodyEn: object | null;
  categoryId: string;
  projectId: string;
  language: string;
  status: string;
  publishedAt: string;
  selectedSourceIds: string[];
  entwurf: EntwurfThema[];
  isPaper: boolean;
  abstractDe: string;
  abstractEn: string;
  keywords: string;
  savedAt: number;
}

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
  const [isDirty, setIsDirty] = useState(false);
  const [localBackup, setLocalBackup] = useState<LocalBackup | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
  const [entwurf, setEntwurf] = useState<EntwurfThema[]>([]);
  const [featuredImage, setFeaturedImage] = useState<object | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [isPaper, setIsPaper] = useState(false);
  const [abstractDe, setAbstractDe] = useState("");
  const [abstractEn, setAbstractEn] = useState("");
  const [keywords, setKeywords] = useState("");

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
      setEntwurf(article.entwurf ?? []);
      setIsPaper(article.isPaper ?? false);
      setAbstractDe(article.abstractDe ?? "");
      setAbstractEn(article.abstractEn ?? "");
      setKeywords((article.keywords ?? []).join(", "));
      setCategories(cats);
      setProjects(projs);
      setAllSources(srcs);
      setLoaded(true);
    });
  }, [slug]);

  // Mark load complete after a tick so auto-save doesn't fire on initial data
  // Also check for localStorage backup
  useEffect(() => {
    if (loaded) {
      const t = setTimeout(() => {
        hasLoadedRef.current = true;
        // Check for a local backup saved after the last server save
        try {
          const raw = localStorage.getItem(`artikel-backup-${slug}`);
          if (raw) {
            const backup: LocalBackup = JSON.parse(raw);
            setLocalBackup(backup);
          }
        } catch {
          // ignore corrupt backup
        }
      }, 200);
      return () => clearTimeout(t);
    }
  }, [loaded, slug]);

  // Warn before navigating away with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Save to localStorage immediately on every change (safety net)
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    setIsDirty(true);
    try {
      const backup: LocalBackup = {
        titleDe, titleEn, excerptDe, excerptEn,
        bodyDe, bodyEn, categoryId, projectId,
        language, status, publishedAt, selectedSourceIds, entwurf,
        isPaper, abstractDe, abstractEn, keywords,
        savedAt: Date.now(),
      };
      localStorage.setItem(`artikel-backup-${slug}`, JSON.stringify(backup));
    } catch {
      // ignore quota errors
    }
  }, [titleDe, titleEn, categoryId, projectId, selectedSourceIds, language, status, publishedAt, excerptDe, excerptEn, bodyDe, bodyEn, featuredImage, entwurf, isPaper, abstractDe, abstractEn, keywords, slug]);

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
      entwurf: entwurf.length > 0 ? entwurf : null,
      isPaper,
      abstractDe: abstractDe || null,
      abstractEn: abstractEn || null,
      keywords: keywords.trim()
        ? keywords.split(",").map((k) => k.trim()).filter(Boolean)
        : null,
    };
    if (categoryId) patch.category = { _type: "reference", _ref: categoryId };
    else patch.category = null;
    if (projectId) patch.project = { _type: "reference", _ref: projectId };
    else patch.project = null;
    return patch;
  }, [titleDe, titleEn, categoryId, projectId, selectedSourceIds, language, status, publishedAt, excerptDe, excerptEn, bodyDe, bodyEn, featuredImage, entwurf, isPaper, abstractDe, abstractEn, keywords]);

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
        setIsDirty(false);
        localStorage.removeItem(`artikel-backup-${slug}`);
        setLocalBackup(null);
      } catch {
        setAutoSaved(null);
      }
    }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [titleDe, titleEn, categoryId, projectId, selectedSourceIds, language, status, publishedAt, excerptDe, excerptEn, bodyDe, bodyEn, featuredImage, entwurf, isPaper, abstractDe, abstractEn, keywords, slug]);

  function toggleSource(id: string) {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      localStorage.removeItem(`artikel-backup-${slug}`);
      setIsDirty(false);
      router.push("/admin/artikel");
    } catch {
      setError("Fehler beim Löschen. Bitte erneut versuchen.");
      setShowDeleteConfirm(false);
    }
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
      localStorage.removeItem(`artikel-backup-${slug}`);
      setIsDirty(false);
      router.push("/admin");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  function handleRestoreBackup() {
    if (!localBackup) return;
    setTitleDe(localBackup.titleDe);
    setTitleEn(localBackup.titleEn);
    setExcerptDe(localBackup.excerptDe);
    setExcerptEn(localBackup.excerptEn);
    setBodyDe(localBackup.bodyDe);
    setBodyEn(localBackup.bodyEn);
    setCategoryId(localBackup.categoryId);
    setProjectId(localBackup.projectId);
    setLanguage(localBackup.language);
    setStatus(localBackup.status);
    setPublishedAt(localBackup.publishedAt);
    setSelectedSourceIds(localBackup.selectedSourceIds);
    setEntwurf(localBackup.entwurf);
    setIsPaper(localBackup.isPaper ?? false);
    setAbstractDe(localBackup.abstractDe ?? "");
    setAbstractEn(localBackup.abstractEn ?? "");
    setKeywords(localBackup.keywords ?? "");
    setLocalBackup(null);
  }

  function handleDismissBackup() {
    localStorage.removeItem(`artikel-backup-${slug}`);
    setLocalBackup(null);
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
      {/* Backup-Wiederherstellungs-Banner */}
      {localBackup && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl" style={{ fontFamily: "var(--font-sans)" }}>
          <div>
            <p className="text-sm font-medium text-amber-800">Nicht gespeicherte Änderungen gefunden</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Zuletzt lokal gespeichert: {new Date(localBackup.savedAt).toLocaleString("de-DE")}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRestoreBackup}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-700 text-white hover:bg-amber-800 transition-colors"
            >
              Wiederherstellen
            </button>
            <button
              onClick={handleDismissBackup}
              className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Artikel bearbeiten</h1>
          {isDirty && autoSaved !== "saved" && (
            <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5" style={{ fontFamily: "var(--font-sans)" }}>
              Ungespeichert
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {autoSaved === "saving" && (
            <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Speichert…</span>
          )}
          {autoSaved === "saved" && !isDirty && (
            <span className="text-xs text-green-600" style={{ fontFamily: "var(--font-sans)" }}>Automatisch gespeichert</span>
          )}
          {/* Löschen-Button — bewusst weit links, visuell getrennt */}
          <div className="mr-4 pl-4 border-l border-[var(--color-border)]">
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
                <span className="text-xs text-red-700 font-medium">Artikel wirklich löschen?</span>
                <button
                  onClick={handleDelete}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                >
                  Ja, löschen
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-600 hover:border-red-200 border border-transparent transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Artikel löschen
              </button>
            )}
          </div>
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

      {/* Paper-Modus */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer" style={{ fontFamily: "var(--font-sans)" }}>
          <input
            type="checkbox"
            checked={isPaper}
            onChange={(e) => setIsPaper(e.target.checked)}
            className="accent-[var(--color-accent)] w-4 h-4"
          />
          <span className="text-sm font-medium text-[var(--color-foreground)]">Als akademisches Paper veröffentlichen</span>
        </label>
        {isPaper && (
          <div className="space-y-4 pt-2 border-t border-[var(--color-border)]">
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Abstract (DE)</label>
              <textarea
                value={abstractDe}
                onChange={(e) => setAbstractDe(e.target.value)}
                rows={4}
                placeholder="Kurzzusammenfassung auf Deutsch..."
                className={inputClass}
                style={{ fontFamily: "var(--font-sans)" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Abstract (EN)</label>
              <textarea
                value={abstractEn}
                onChange={(e) => setAbstractEn(e.target.value)}
                rows={4}
                placeholder="Short summary in English..."
                className={inputClass}
                style={{ fontFamily: "var(--font-sans)" }}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Schlüsselwörter (kommagetrennt)</label>
              <input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Theologie, Kirchengeschichte, Luthertum, ..."
                className={inputClass}
                style={{ fontFamily: "var(--font-sans)" }}
              />
            </div>
          </div>
        )}
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
          <div className="space-y-2">
            <div
              className="relative inline-block cursor-crosshair rounded-lg overflow-hidden max-w-sm w-full"
              title="Klicken um Fokuspunkt zu setzen"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;
                const updated = {
                  ...(featuredImage as Record<string, unknown>),
                  hotspot: { x, y, width: 0.2, height: 0.2 },
                  crop: { left: 0, top: 0, right: 0, bottom: 0 },
                };
                setFeaturedImage(updated);
                fetch(`/api/admin/articles/${slug}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ featuredImage: updated }),
                });
              }}
            >
              <img
                src={urlFor(featuredImage as Parameters<typeof urlFor>[0]).width(600).height(338).fit("crop").url()}
                alt="Titelbild Vorschau"
                className="w-full h-auto block"
              />
              {/* Hotspot dot */}
              {(() => {
                const hs = (featuredImage as Record<string, unknown>).hotspot as { x: number; y: number } | undefined;
                if (!hs) return null;
                return (
                  <div
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md bg-accent/70 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${hs.x * 100}%`, top: `${hs.y * 100}%` }}
                  />
                );
              })()}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleImageRemove(); }}
                className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-stone-500 hover:text-red-500 transition-colors text-lg leading-none"
                title="Bild entfernen"
              >
                ×
              </button>
            </div>
            <p className="text-xs text-stone-400" style={{ fontFamily: "var(--font-sans)" }}>
              Klicke auf das Bild um den Fokuspunkt zu setzen — dieser bestimmt welcher Bereich beim Zuschneiden sichtbar bleibt.
            </p>
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
            entwurf={entwurf}
            onEntwurfChange={setEntwurf}
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
          />
        </div>
      )}
    </div>
  );
}
