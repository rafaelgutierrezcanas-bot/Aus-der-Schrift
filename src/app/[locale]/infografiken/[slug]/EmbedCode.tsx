"use client";

import { useState } from "react";

export function EmbedCode({ code, locale }: { code: string; locale: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silently ignore
    }
  }

  return (
    <div className="relative">
      <pre
        className="bg-[var(--color-surface)] border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap break-all"
        style={{ fontFamily: "var(--font-mono, monospace)" }}
      >
        {code}
      </pre>
      <button
        onClick={copy}
        className="absolute top-2 right-2 px-3 py-1.5 rounded-md border border-border text-xs transition-colors hover:border-accent"
        style={{
          fontFamily: "var(--font-sans)",
          color: copied ? "var(--color-accent)" : "var(--color-muted)",
          background: "var(--color-surface)",
          cursor: "pointer",
        }}
      >
        {copied
          ? (locale === "de" ? "Kopiert!" : "Copied!")
          : (locale === "de" ? "Kopieren" : "Copy")}
      </button>
    </div>
  );
}
