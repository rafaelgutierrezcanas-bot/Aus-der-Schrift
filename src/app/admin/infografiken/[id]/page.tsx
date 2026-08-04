"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

interface ArticleOption {
  slug: { current: string };
  titleDe: string;
  status: string;
}

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

export default function EditInfografikPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [articleSlug, setArticleSlug] = useState("");
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/infografiken/${id}`).then((r) => r.json()),
      fetch("/api/admin/articles").then((r) => r.json()),
    ]).then(([data, arts]) => {
      setTitle(data.title || "");
      setDescription(data.description || "");
      setPublishedAt(data.publishedAt ? data.publishedAt.slice(0, 10) : "");
      setTopics(data.topics || []);
      setArticleSlug(data.articleSlug || "");
      setExistingImageUrl(data.imageUrl || null);
      setArticles(arts);
      setLoading(false);
    });
  }, [id]);

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  function handleFileChange(f: File | null) {
    setFile(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function save() {
    if (!title.trim() || !publishedAt || topics.length === 0) return;
    setSaving(true);

    let imageRef;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: formData,
      });
      imageRef = await uploadRes.json();
    }

    await fetch(`/api/admin/infografiken/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || undefined,
        publishedAt,
        topics,
        articleSlug: articleSlug.trim() || undefined,
        ...(imageRef ? { imageRef } : {}),
      }),
    });

    router.push("/admin/infografiken");
  }

  if (loading) {
    return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;
  }

  const canSave = !saving && title.trim() && publishedAt && topics.length > 0;
  const displayImage = preview || existingImageUrl;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Infografik bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Beschreibung (optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass + " resize-none"}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Datum *</label>
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Verknüpfter Artikel (optional)</label>
          <select
            value={articleSlug}
            onChange={(e) => setArticleSlug(e.target.value)}
            className={inputClass}
          >
            <option value="">— Kein Artikel —</option>
            {articles.map((a) => (
              <option key={a.slug.current} value={a.slug.current}>
                {a.titleDe} {a.status !== "published" ? `(${a.status})` : ""}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--color-muted)] mt-1">
            Wenn die Infografik aus einem Artikel stammt, wähle ihn hier aus.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen * (mind. 1)</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
        <div className="border border-[var(--color-border)] rounded-lg p-4">
          <p className="text-xs font-medium text-[var(--color-foreground)] mb-3">Bild</p>

          {displayImage && (
            <div className="mb-3">
              <img
                src={displayImage}
                alt="Vorschau"
                className="max-w-full max-h-64 rounded-lg border border-[var(--color-border)]"
              />
            </div>
          )}

          <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:border-[var(--color-accent)] transition-colors">
            {displayImage ? "Bild ändern" : "Bild hochladen"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-[11px] text-[var(--color-muted)] mt-2">JPEG, PNG, WebP oder AVIF. Max. 4 MB.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={!canSave}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? "Speichern..." : "Änderungen speichern"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
