"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface RecommendToggleProps {
  slug: string;
  isRecommended: boolean;
}

export function RecommendToggle({ slug, isRecommended }: RecommendToggleProps) {
  const [active, setActive] = useState(isRecommended);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const next = !active;
    setActive(next);
    await fetch(`/api/admin/articles/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRecommended: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={active ? "Aus Empfehlungen entfernen" : "Als empfohlen markieren"}
      className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
        active
          ? "bg-amber-400 text-white hover:bg-amber-500"
          : "bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:border-amber-400 hover:text-amber-500"
      } ${loading ? "opacity-50 cursor-wait" : ""}`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      ★
    </button>
  );
}
