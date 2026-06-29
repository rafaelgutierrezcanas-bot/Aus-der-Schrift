"use client";

import { useState } from "react";

interface CommentFormProps {
  articleId: string;
  locale: string;
}

export function CommentForm({ articleId, locale }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, authorName: name, authorEmail: email || undefined, body }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg((data as { error?: string }).error ?? "Fehler");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setBody("");
    } catch {
      setErrorMsg(locale === "de" ? "Netzwerkfehler" : "Network error");
      setStatus("error");
    }
  }

  const isDE = locale === "de";

  if (status === "success") {
    return (
      <p
        className="text-sm px-4 py-3 rounded-xl border"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-muted)",
          fontFamily: "var(--font-body-serif)",
        }}
      >
        {isDE
          ? "Danke! Dein Kommentar wird geprüft und dann veröffentlicht."
          : "Thank you! Your comment will be reviewed before publishing."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="comment-name"
            className="block text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
          >
            {isDE ? "Name" : "Name"} *
          </label>
          <input
            id="comment-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              fontFamily: "var(--font-body-serif)",
              color: "var(--color-foreground)",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="comment-email"
            className="block text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
          >
            {isDE ? "E-Mail (optional)" : "Email (optional)"}
          </label>
          <input
            id="comment-email"
            type="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              fontFamily: "var(--font-body-serif)",
              color: "var(--color-foreground)",
            }}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="comment-body"
          className="block text-xs uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
        >
          {isDE ? "Kommentar" : "Comment"} *
        </label>
        <textarea
          id="comment-body"
          required
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
          style={{
            borderColor: "var(--color-border)",
            fontFamily: "var(--font-body-serif)",
            color: "var(--color-foreground)",
          }}
        />
        <p
          className="text-[11px] mt-1 text-right"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
        >
          {body.length}/2000
        </p>
      </div>

      {status === "error" && (
        <p className="text-sm" style={{ color: "var(--color-accent)", fontFamily: "var(--font-sans)" }}>
          {errorMsg}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
          }}
        >
          {status === "loading"
            ? (isDE ? "Wird gesendet…" : "Sending…")
            : (isDE ? "Kommentar absenden →" : "Submit comment →")}
        </button>
        <p
          className="text-xs"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
        >
          {isDE
            ? "Dein Kommentar wird vor der Veröffentlichung geprüft."
            : "Your comment will be reviewed before publishing."}
        </p>
      </div>
    </form>
  );
}
