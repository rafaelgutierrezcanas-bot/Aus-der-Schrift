"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteArticleButton({ slug, title }: { slug: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
        <span className="text-xs text-red-600" style={{ fontFamily: "var(--font-sans)" }}>
          Löschen?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {deleting ? "…" : "Ja"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Nein
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true); }}
      title={`„${title}" löschen`}
      className="text-[var(--color-muted)] hover:text-red-600 transition-colors p-1 rounded"
      aria-label="Artikel löschen"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    </button>
  );
}
