"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Article {
  _id: string;
  titleDe: string;
  slug: { current: string };
  status: string;
  publishedAt?: string;
  category?: { titleDe: string } | null;
}

interface Props {
  initialArticles: Article[];
}

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: "idea", label: "Idee", color: "bg-purple-100 text-purple-700 border-purple-200" },
  { id: "draft", label: "Entwurf", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { id: "ready", label: "Bereit", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { id: "published", label: "Veröffentlicht", color: "bg-green-100 text-green-700 border-green-200" },
];

export default function KanbanBoard({ initialArticles }: Props) {
  const [articles, setArticles] = useState(initialArticles);
  const dragRef = useRef<{ id: string; fromStatus: string } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const router = useRouter();

  function handleDragStart(e: React.DragEvent, article: Article) {
    dragRef.current = { id: article._id, fromStatus: article.status };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", article._id);
  }

  function handleDragOver(e: React.DragEvent, columnId: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(columnId);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  async function handleDrop(e: React.DragEvent, newStatus: string) {
    e.preventDefault();
    setDragOverCol(null);

    const drag = dragRef.current;
    if (!drag || drag.fromStatus === newStatus) return;

    const article = articles.find((a) => a._id === drag.id);
    if (!article) return;

    // Optimistic update
    setArticles((prev) =>
      prev.map((a) => (a._id === drag.id ? { ...a, status: newStatus } : a))
    );

    // Persist to Sanity
    try {
      const res = await fetch(`/api/admin/articles/${article.slug.current}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setArticles((prev) =>
          prev.map((a) => (a._id === drag.id ? { ...a, status: drag.fromStatus } : a))
        );
      }
    } catch {
      // Revert on error
      setArticles((prev) =>
        prev.map((a) => (a._id === drag.id ? { ...a, status: drag.fromStatus } : a))
      );
    }

    dragRef.current = null;
  }

  return (
    <div className="grid grid-cols-4 gap-3" style={{ fontFamily: "var(--font-sans)" }}>
      {COLUMNS.map((col) => {
        const colArticles = articles.filter((a) => a.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`rounded-xl border p-3 min-h-[200px] transition-colors ${
              dragOverCol === col.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5"
                : "border-[var(--color-border)] bg-[var(--color-surface)]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${col.color}`}>
                {col.label}
              </span>
              <span className="text-xs text-[var(--color-muted)]">{colArticles.length}</span>
            </div>
            <div className="space-y-2">
              {colArticles.map((article) => (
                <div
                  key={article._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, article)}
                  onClick={() => router.push(`/admin/${article.slug.current}`)}
                  className="bg-white rounded-lg border border-[var(--color-border)] p-3 cursor-grab active:cursor-grabbing hover:border-[var(--color-accent)] transition-colors group"
                >
                  <p className="text-sm text-[var(--color-foreground)] font-medium group-hover:text-[var(--color-accent)] transition-colors leading-snug">
                    {article.titleDe || "Untitled"}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {article.category && (
                      <span className="text-xs text-[var(--color-muted)] bg-[var(--color-surface)] px-1.5 py-0.5 rounded">
                        {article.category.titleDe}
                      </span>
                    )}
                    {article.publishedAt && (
                      <span className="text-xs text-[var(--color-muted)]">
                        {new Date(article.publishedAt).toLocaleDateString("de-DE", { day: "numeric", month: "short" })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
