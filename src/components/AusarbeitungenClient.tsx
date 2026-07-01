"use client";

import { useState } from "react";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

interface Ausarbeitung {
  _id: string;
  title: string;
  description?: string;
  publishedAt: string;
  topics: string[];
  fileUrl: string;
}

function topicTitle(value: string): string {
  return TOPIC_OPTIONS.find((t) => t.value === value)?.title ?? value;
}

function ShareButton({ title, fileUrl, locale }: { title: string; fileUrl: string; locale: string }) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const text = locale === "de"
      ? `${title} – Theologische Ausarbeitung`
      : `${title} – Theological Paper`;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: text, url: fileUrl });
        return;
      } catch {
        // user cancelled or API unavailable — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(fileUrl);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      // silently ignore clipboard errors
    }
  };

  return (
    <button
      onClick={handleShare}
      className="text-xs transition-colors"
      style={{
        color: state === "copied" ? "var(--color-accent)" : "var(--color-muted)",
        fontFamily: "var(--font-sans)",
        letterSpacing: "0.06em",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 0,
      }}
    >
      {state === "copied"
        ? (locale === "de" ? "Link kopiert ✓" : "Link copied ✓")
        : (locale === "de" ? "Teilen →" : "Share →")}
    </button>
  );
}

function PdfReader({ fileUrl, title, locale, onClose }: {
  fileUrl: string;
  title: string;
  locale: string;
  onClose: () => void;
}) {
  // Use Google Docs viewer as a reliable cross-browser embed
  const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <div className="mt-6 border border-border">
      {/* Reader toolbar */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-border"
        style={{ background: "var(--color-surface)" }}
      >
        <span
          className="text-[10px] uppercase tracking-widest text-muted truncate pr-4"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {title}
        </span>
        <div className="flex items-center gap-4 shrink-0">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-[10px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Download" : "Download"}
          </a>
          <button
            onClick={onClose}
            className="text-[10px] uppercase tracking-widest text-muted hover:text-accent transition-colors"
            style={{ fontFamily: "var(--font-sans)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            {locale === "de" ? "Schließen ✕" : "Close ✕"}
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <iframe
        src={viewerUrl}
        title={title}
        width="100%"
        height="700"
        style={{ display: "block", border: "none" }}
        allow="fullscreen"
      />
    </div>
  );
}

export function AusarbeitungenClient({
  ausarbeitungen,
  locale,
}: {
  ausarbeitungen: Ausarbeitung[];
  locale: string;
}) {
  const [openReader, setOpenReader] = useState<string | null>(null);

  if (ausarbeitungen.length === 0) {
    return (
      <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
        {locale === "de" ? "Noch keine Ausarbeitungen vorhanden." : "No papers available yet."}
      </p>
    );
  }

  return (
    <div>
      {ausarbeitungen.map((item) => (
        <article key={item._id} className="py-8 border-b border-border last:border-0">
          <h2
            className="text-xl font-bold leading-snug mb-2"
            style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
          >
            {item.title}
          </h2>

          <p
            className="text-[11px] text-muted mb-3"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {new Date(item.publishedAt).toLocaleDateString(
              locale === "de" ? "de-DE" : "en-US",
              { year: "numeric", month: "long", day: "numeric" }
            )}
          </p>

          {item.description && (
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
            >
              {item.description}
            </p>
          )}

          {item.topics && item.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.topics.map((topic) => (
                <span
                  key={topic}
                  className="text-[10px] uppercase tracking-[0.1em] border border-border px-2 py-0.5"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                >
                  {topicTitle(topic)}
                </span>
              ))}
            </div>
          )}

          {item.fileUrl && (
            <div className="flex items-center gap-5 mt-2">
              {/* Read inline */}
              <button
                onClick={() => setOpenReader(openReader === item._id ? null : item._id)}
                className="text-xs hover:underline"
                style={{
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.06em",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {openReader === item._id
                  ? (locale === "de" ? "Schließen ✕" : "Close ✕")
                  : (locale === "de" ? "Lesen →" : "Read →")}
              </button>

              {/* Download */}
              <a
                href={item.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="text-xs hover:underline"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)", letterSpacing: "0.06em" }}
              >
                {locale === "de" ? "PDF herunterladen" : "Download PDF"}
              </a>

              {/* Share */}
              <ShareButton title={item.title} fileUrl={item.fileUrl} locale={locale} />
            </div>
          )}

          {/* Inline PDF reader */}
          {openReader === item._id && item.fileUrl && (
            <PdfReader
              fileUrl={item.fileUrl}
              title={item.title}
              locale={locale}
              onClose={() => setOpenReader(null)}
            />
          )}
        </article>
      ))}
    </div>
  );
}
