"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Idea {
  _id: string;
  title: string;
  notes?: string;
  createdAt: string;
}

export default function IdeenPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ideas")
      .then((r) => r.json())
      .then((data) => { setIdeas(data); setLoading(false); });
  }, []);

  async function toEntwurf(idea: Idea) {
    const slug = idea.title
      .toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleDe: idea.title,
        titleEn: "",
        slug: { _type: "slug", current: slug },
        status: "idea",
        language: "de",
        publishedAt: new Date().toISOString(),
      }),
    });
    const article = await res.json();
    router.push(`/admin/${article.slug.current}`);
  }

  async function deleteIdea(id: string) {
    if (!confirm("Idee löschen?")) return;
    await fetch(`/api/admin/ideas/${id}`, { method: "DELETE" });
    setIdeas((prev) => prev.filter((i) => i._id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Ideen</h1>
        <Link
          href="/admin/ideen/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neue Idee
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ideas.map((idea) => (
          <div
            key={idea._id}
            className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] flex flex-col gap-3"
          >
            <p className="font-medium text-[var(--color-foreground)] text-sm leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
              {idea.title}
            </p>
            {idea.notes && (
              <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-3" style={{ fontFamily: "var(--font-sans)" }}>
                {idea.notes}
              </p>
            )}
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => toEntwurf(idea)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Zu Entwurf machen →
              </button>
              <button
                onClick={() => deleteIdea(idea._id)}
                className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-500 transition-colors ml-auto"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && ideas.length === 0 && (
          <p className="text-sm text-[var(--color-muted)] col-span-2" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Ideen. Füge deine erste Idee hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
