"use client";

import { useState } from "react";
import Link from "next/link";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

interface Infografik {
  _id: string;
  title: string;
  description?: string;
  publishedAt: string;
  topics: string[];
  articleSlug?: string;
  imageUrl: string;
}

function topicTitle(value: string): string {
  return TOPIC_OPTIONS.find((t) => t.value === value)?.title ?? value;
}

function CopyAttribution({ title, locale }: { title: string; locale: string }) {
  const [copied, setCopied] = useState(false);
  const text = `${title} — Rafael Gutierrez, theologik.org`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="flex items-center gap-2 mt-3">
      <div
        className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-border text-[11px] text-muted truncate select-all"
        style={{ fontFamily: "var(--font-sans)", background: "var(--color-surface)" }}
      >
        {text}
      </div>
      <button
        onClick={copy}
        className="shrink-0 px-2 py-1.5 rounded-lg border border-border text-[11px] transition-colors hover:border-accent"
        style={{
          fontFamily: "var(--font-sans)",
          color: copied ? "var(--color-accent)" : "var(--color-muted)",
          background: "none",
          cursor: "pointer",
        }}
        title={locale === "de" ? "Quellenangabe kopieren" : "Copy attribution"}
      >
        {copied ? "✓" : "⧉"}
      </button>
    </div>
  );
}

export function InfografikanClient({
  infografiken,
  locale,
}: {
  infografiken: Infografik[];
  locale: string;
}) {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? infografiken.filter((i) => i.topics?.includes(filter))
    : infografiken;

  const usedTopics = Array.from(
    new Set(infografiken.flatMap((i) => i.topics || []))
  );

  if (infografiken.length === 0) {
    return (
      <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
        {locale === "de" ? "Noch keine Infografiken vorhanden." : "No infographics available yet."}
      </p>
    );
  }

  return (
    <div>
      {/* Topic filter */}
      {usedTopics.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === null
                ? "border-accent bg-accent text-white"
                : "border-border text-muted hover:border-accent"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? "Alle" : "All"}
          </button>
          {usedTopics.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(filter === t ? null : t)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                filter === t
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted hover:border-accent"
              }`}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {topicTitle(t)}
            </button>
          ))}
        </div>
      )}

      {/* Infographic grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {filtered.map((item) => (
          <article key={item._id}>
            <div className="border border-border rounded-lg overflow-hidden mb-3">
              <img
                src={item.imageUrl + "?w=800&fit=max&auto=format"}
                alt={item.title}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>

            <h2
              className="text-lg font-bold leading-snug mb-1"
              style={{ fontFamily: "var(--font-serif)", color: "var(--color-foreground)" }}
            >
              {item.title}
            </h2>

            <p
              className="text-[11px] text-muted mb-2"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {new Date(item.publishedAt).toLocaleDateString(
                locale === "de" ? "de-DE" : "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            </p>

            {item.description && (
              <p
                className="text-sm leading-relaxed mb-3"
                style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
              >
                {item.description}
              </p>
            )}

            {item.topics && item.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
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

            <div className="flex items-center gap-4">
              {/* Download link */}
              <a
                href={item.imageUrl + "?dl="}
                download
                className="text-xs hover:underline"
                style={{
                  color: "var(--color-accent)",
                  fontFamily: "var(--font-sans)",
                  letterSpacing: "0.06em",
                }}
              >
                {locale === "de" ? "Herunterladen" : "Download"} &rarr;
              </a>

              {/* Article link */}
              {item.articleSlug && (
                <Link
                  href={`/${locale}/blog/${item.articleSlug}`}
                  className="text-xs hover:underline"
                  style={{
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-sans)",
                    letterSpacing: "0.06em",
                  }}
                >
                  {locale === "de" ? "Zum Artikel" : "Read article"} &rarr;
                </Link>
              )}
            </div>

            {/* Copyable attribution */}
            <CopyAttribution title={item.title} locale={locale} />
          </article>
        ))}
      </div>
    </div>
  );
}
