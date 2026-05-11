"use client";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Article {
  _id: string;
  titleDe: string;
  slug: { current: string };
  status?: string;
}

const STATUS_LABEL: Record<string, string> = {
  idea: "Idee", draft: "Entwurf", ready: "Bereit",
  published: "Veröffentlicht", archived: "Archiviert",
};
const STATUS_COLOR: Record<string, string> = {
  idea: "bg-purple-100 text-purple-700",
  draft: "bg-yellow-100 text-yellow-700",
  ready: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-[var(--color-surface)] text-[var(--color-muted)]",
};

export default function EditProjektPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch(`/api/admin/articles?project=${id}`).then((r) => r.json()),
    ]).then(([projects, arts]) => {
      const proj = projects.find((p: { _id: string }) => p._id === id);
      if (proj) {
        setTitle(proj.title ?? "");
        setDescription(proj.description ?? "");
      }
      setArticles(Array.isArray(arts) ? arts.filter((a: { project?: { _ref: string } }) => a.project?._ref === id) : []);
      setLoaded(true);
    });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error();
      router.push("/admin/projekte");
    } catch {
      setError("Fehler beim Speichern.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Projekt wirklich löschen?")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/admin/projekte");
    } else {
      const data = await res.json();
      setError(data.error ?? "Löschen fehlgeschlagen.");
    }
  }

  const inputClass = "w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-foreground)] bg-[var(--color-surface)] focus:outline-none focus:border-[var(--color-accent)] transition-colors text-sm";
  const labelClass = "block text-sm font-medium text-[var(--color-muted)] mb-1.5";

  if (!loaded) {
    return <div className="text-[var(--color-muted)] py-12 text-center text-sm" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Projekt bearbeiten</h1>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="text-sm px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-red-600 hover:border-red-300 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Löschen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {saving ? "Speichert..." : "Speichern"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm" style={{ fontFamily: "var(--font-sans)" }}>{error}</p>}

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 space-y-4">
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Titel *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
        <div>
          <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Beschreibung</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
        </div>
      </div>

      {articles.length > 0 && (
        <div>
          <h2 className="font-serif text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Artikel in diesem Projekt</h2>
          <div className="space-y-2">
            {articles.map((a) => {
              const st = a.status ?? "published";
              return (
                <Link
                  key={a._id}
                  href={`/admin/${a.slug.current}`}
                  className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
                >
                  <p className="text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]" style={{ fontFamily: "var(--font-sans)" }}>
                    {a.titleDe}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[st] ?? STATUS_COLOR.published}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {STATUS_LABEL[st] ?? st}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
