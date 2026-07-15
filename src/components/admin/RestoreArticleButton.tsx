"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RestoreArticleButton({ slug }: { slug: string }) {
  const [restoring, setRestoring] = useState(false);
  const router = useRouter();

  async function handleRestore() {
    setRestoring(true);
    try {
      const res = await fetch(`/api/admin/articles/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "draft" }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setRestoring(false);
    }
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); handleRestore(); }}
      disabled={restoring}
      className="text-xs px-2.5 py-1 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {restoring ? "…" : "Wiederherstellen"}
    </button>
  );
}
