"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

export default function NewPagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  // Auto-generate slug from titleDe
  useEffect(() => {
    setSlug(
      titleDe
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }, [titleDe]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const doc: Record<string, unknown> = {
        titleDe,
        titleEn: titleEn || undefined,
        slug: { _type: "slug", current: slug },
        bodyDe: bodyDe ? tiptapToPortableText(bodyDe as Parameters<typeof tiptapToPortableText>[0]) : undefined,
        bodyEn: bodyEn ? tiptapToPortableText(bodyEn as Parameters<typeof tiptapToPortableText>[0]) : undefined,
      };

      const res = await fetch("/api/admin/seiten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doc),
      });
      if (!res.ok) throw new Error("Speichern fehlgeschlagen");
      router.push("/admin/seiten");
    } catch {
      setError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  return (
    <div className="space-y-6" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Neue Seite</h1>
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
          <label className={labelClass}>Titel (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputClass} placeholder="z.B. Impressum, Datenschutz..." />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} placeholder="e.g. Legal Notice, Privacy Policy..." />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
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
