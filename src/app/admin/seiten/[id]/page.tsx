"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

export default function EditPagePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [autoSaved, setAutoSaved] = useState<"saved" | "saving" | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    fetch(`/api/admin/seiten/${id}`)
      .then((r) => r.json())
      .then((item) => {
        setTitleDe(item.titleDe ?? "");
        setTitleEn(item.titleEn ?? "");
        setSlug(item.slug?.current ?? "");
        if (item.bodyDe) setBodyDe(portableTextToTiptap(item.bodyDe));
        if (item.bodyEn) setBodyEn(portableTextToTiptap(item.bodyEn));
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
        await fetch(`/api/admin/seiten/${id}`, {
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
  }, [titleDe, titleEn, bodyDe, bodyEn]);

  function buildPatch() {
    const convertedDe = bodyDe ? tiptapToPortableText(bodyDe as Parameters<typeof tiptapToPortableText>[0]) : undefined;
    const convertedEn = bodyEn ? tiptapToPortableText(bodyEn as Parameters<typeof tiptapToPortableText>[0]) : undefined;
    const patch: Record<string, unknown> = {
      titleDe,
      titleEn: titleEn || null,
      slug: { _type: "slug", current: slug },
      bodyDe: Array.isArray(convertedDe) && convertedDe.length > 0 ? convertedDe : undefined,
      bodyEn: Array.isArray(convertedEn) && convertedEn.length > 0 ? convertedEn : undefined,
    };
    return patch;
  }

  async function handleSave() {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/seiten/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPatch()),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin/seiten");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/admin/seiten/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      router.push("/admin/seiten");
    } catch {
      setError("Fehler beim Löschen.");
      setShowDeleteConfirm(false);
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  if (!loaded) return <div className="text-[var(--color-muted)] py-12 text-center text-sm" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</div>;

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)] truncate flex-1">
          {titleDe || "Seite bearbeiten"}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          {autoSaved === "saving" && <span className="text-xs text-[var(--color-muted)]">Speichert...</span>}
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
          <label className={labelClass}>Titel (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Slug</label>
          <input value={slug} readOnly className={`${inputClass} opacity-60 cursor-not-allowed`} />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Inhalt (DE)</h2>
        <TiptapEditor content={bodyDe} onChange={setBodyDe} placeholder="Seiteninhalt auf Deutsch..." />
      </div>

      <div>
        <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Content (EN)</h2>
        <TiptapEditor content={bodyEn} onChange={setBodyEn} placeholder="Page content in English..." />
      </div>
    </div>
  );
}
