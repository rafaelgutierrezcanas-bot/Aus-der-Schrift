"use client";
import { useState, useEffect, useCallback } from "react";
import { Quote, Check } from "lucide-react";

interface CiteButtonProps {
  author: string;
  title: string;
  locale: string;
}

export function CiteButton({ author, title, locale }: CiteButtonProps) {
  const [copied, setCopied] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);

  const checkSelection = useCallback(() => {
    const sel = window.getSelection();
    setHasSelection(!!sel && sel.toString().trim().length > 0);
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", checkSelection);
    return () => document.removeEventListener("selectionchange", checkSelection);
  }, [checkSelection]);

  async function handleCopy() {
    const sel = window.getSelection();
    const selectedText = sel?.toString().trim();
    if (!selectedText) return;

    const citation = locale === "de"
      ? `„${selectedText}"\n— ${author}, „${title}", Theologik`
      : `\u201c${selectedText}\u201d\n— ${author}, \u201c${title}\u201d, Theologik`;

    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={!hasSelection}
      className="flex items-center gap-1.5 text-xs transition-colors disabled:opacity-30 disabled:cursor-default text-muted hover:text-accent"
      style={{ fontFamily: "var(--font-sans)" }}
      title={
        hasSelection
          ? locale === "de" ? "Auswahl als Zitat kopieren" : "Copy selection as quote"
          : locale === "de" ? "Text auswählen zum Zitieren" : "Select text to cite"
      }
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
