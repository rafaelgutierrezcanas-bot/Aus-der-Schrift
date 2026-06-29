"use client";

import { useEffect, useState } from "react";

interface Comment {
  _id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  _createdAt: string;
}

function StatusBadge({ status }: { status: Comment["status"] }) {
  const config = {
    pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    approved: { label: "Freigegeben", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Abgelehnt", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status];
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}

export default function KommentarePage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/comments");
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function deleteComment(id: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = filter === "all" ? comments : comments.filter((c) => c.status === filter);
  const pendingCount = comments.filter((c) => c.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Kommentare
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
              {pendingCount} ausstehend
            </p>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === f
                ? "bg-[var(--color-accent)] text-white border-transparent"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {f === "pending" ? "Ausstehend" : f === "approved" ? "Freigegeben" : f === "rejected" ? "Abgelehnt" : "Alle"}
            {f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
          Wird geladen…
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
          Keine Kommentare.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <span
                    className="font-medium text-sm"
                    style={{ fontFamily: "var(--font-sans)", color: "var(--color-foreground)" }}
                  >
                    {c.authorName}
                  </span>
                  {c.authorEmail && (
                    <span
                      className="ml-2 text-xs"
                      style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                    >
                      {c.authorEmail}
                    </span>
                  )}
                  <span
                    className="ml-2 text-xs"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    · Artikel: <code className="text-[10px]">{c.articleId}</code>
                  </span>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <p
                className="text-sm leading-relaxed mb-4 whitespace-pre-wrap"
                style={{ color: "var(--color-foreground)", fontFamily: "var(--font-body-serif)" }}
              >
                {c.body}
              </p>

              <div className="flex gap-2 flex-wrap">
                {c.status !== "approved" && (
                  <button
                    onClick={() => setStatus(c._id, "approved")}
                    className="text-xs px-3 py-1 rounded-lg border transition-colors"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-foreground)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    ✓ Freischalten
                  </button>
                )}
                {c.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(c._id, "rejected")}
                    className="text-xs px-3 py-1 rounded-lg border transition-colors"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    ✗ Ablehnen
                  </button>
                )}
                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-xs px-3 py-1 rounded-lg border transition-colors ml-auto"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
