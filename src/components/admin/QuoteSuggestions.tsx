"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import type { EntwurfZitat } from "./EntwurfSidebar";

interface Props {
  editor: Editor | null;
  allQuotes: Array<EntwurfZitat & { sourceName?: string }>;
  onInsertQuote: (quote: EntwurfZitat) => void;
  onInsertAsFootnote: (quote: EntwurfZitat) => void;
}

interface Suggestion {
  quoteIndex: number;
  reason: string;
}

export default function QuoteSuggestions({ editor, allQuotes, onInsertQuote, onInsertAsFootnote }: Props) {
  const [enabled, setEnabled] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef = useRef("");

  const fetchSuggestions = useCallback(async () => {
    if (!editor || allQuotes.length === 0) return;

    // Get current paragraph text near cursor
    const { from } = editor.state.selection;
    const resolved = editor.state.doc.resolve(from);
    const paragraph = resolved.parent;
    const text = paragraph.textContent?.trim();

    if (!text || text.length < 30 || text === lastTextRef.current) return;
    lastTextRef.current = text;

    setLoading(true);
    try {
      const quotesForApi = allQuotes.map((q) => ({
        text: q.text,
        source: q.sourceName ?? "",
        pages: q.pages,
      }));

      const res = await fetch("/api/admin/suggest-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paragraph: text, quotes: quotesForApi }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [editor, allQuotes]);

  // 10-second debounce after editor inactivity
  useEffect(() => {
    if (!enabled || !editor) return;

    function onUpdate() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(fetchSuggestions, 10_000);
    }

    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, editor, fetchSuggestions]);

  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="w-full text-left text-xs px-4 py-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-background)] transition-colors"
      >
        Zitat-Vorschläge aktivieren
      </button>
    );
  }

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)]">
          {loading ? "Analysiert..." : `${suggestions.length} Vorschläge`}
        </span>
        <button
          onClick={() => { setEnabled(false); setSuggestions([]); }}
          className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
        >
          Deaktivieren
        </button>
      </div>

      {suggestions.map((s) => {
        const quote = allQuotes[s.quoteIndex - 1];
        if (!quote) return null;
        return (
          <div key={s.quoteIndex} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-2.5 space-y-1.5">
            <p className="text-xs text-[var(--color-foreground)] leading-snug">
              „{quote.text.slice(0, 120)}{quote.text.length > 120 ? "..." : ""}"
            </p>
            <p className="text-xs text-[var(--color-muted)] italic">{s.reason}</p>
            <div className="flex gap-2">
              <button
                onClick={() => onInsertQuote(quote)}
                className="text-xs px-2 py-1 rounded bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
              >
                → Einfügen
              </button>
              <button
                onClick={() => onInsertAsFootnote(quote)}
                className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
              >
                → Als Fußnote
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
