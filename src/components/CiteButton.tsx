"use client";
import { useState } from "react";
import { Quote, Check } from "lucide-react";

interface CiteButtonProps {
  author: string;
  title: string;
  publishedAt: string;
  url: string;
  locale: string;
}

export function CiteButton({ author, title, publishedAt, url, locale }: CiteButtonProps) {
  const [copied, setCopied] = useState(false);

  const year = new Date(publishedAt).getFullYear();
  const citation = locale === "de"
    ? `${author}: „${title}". Theologik, ${year}. ${url}`
    : `${author}: \u201c${title}\u201d. Theologik, ${year}. ${url}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — silently ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
      style={{ fontFamily: "var(--font-sans)" }}
      title={locale === "de" ? "Zitation kopieren" : "Copy citation"}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === "de" ? "Kopiert!" : "Copied!"}</span>
        </>
      ) : (
        <>
          <Quote className="w-3.5 h-3.5" />
          <span>{locale === "de" ? "Zitieren" : "Cite"}</span>
        </>
      )}
    </button>
  );
}
