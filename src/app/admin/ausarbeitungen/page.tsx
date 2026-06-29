"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

interface Ausarbeitung {
  _id: string;
  title: string;
  description?: string;
  publishedAt: string;
  topics: string[];
  fileUrl?: string;
}

export default function AusarbeitungenPage() {
  const [ausarbeitungen, setAusarbeitungen] = useState<Ausarbeitung[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ausarbeitungen")
      .then((r) => r.json())
      .then((data) => { setAusarbeitungen(data); setLoading(false); });
  }, []);

  async function deleteAusarbeitung(id: string) {
    if (!confirm("Ausarbeitung löschen?")) return;
    await fetch(`/api/admin/ausarbeitungen/${id}`, { method: "DELETE" });
    setAusarbeitungen((prev) => prev.filter((a) => a._id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Ausarbeitungen</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            Theologische Ausarbeitungen und Studien als PDF-Dateien.
          </p>
        </div>
        <Link
          href="/admin/ausarbeitungen/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neue Ausarbeitung
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {ausarbeitungen.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-foreground)] text-sm truncate" style={{ fontFamily: "var(--font-sans)" }}>
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                  {new Date(item.publishedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </span>
                {item.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)]"
                    style={{ fontFamily: "var(--font-sans)" }}
                  >
                    {TOPIC_OPTIONS.find((o) => o.value === t)?.title ?? t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <Link
                href={`/admin/ausarbeitungen/${item._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Bearbeiten
              </Link>
              <button
                onClick={() => deleteAusarbeitung(item._id)}
                className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && ausarbeitungen.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Ausarbeitungen. Füge deine erste Ausarbeitung hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
