"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Editor } from "@tiptap/react";
import type { Source } from "@/lib/formatChicago";
import type { EntwurfThema } from "./EntwurfSidebar";
import EntwurfSidebar from "./EntwurfSidebar";
import UniversalSourceInput from "./UniversalSourceInput";
import SourceChat from "./SourceChat";
import OutlineGenerator from "./OutlineGenerator";
import QuoteSuggestions from "./QuoteSuggestions";

interface Props {
  editor: Editor | null;
  sources: Source[];
  allSources: Source[];
  selectedSourceIds: string[];
  onToggleSource: (id: string) => void;
  onSourceCreated?: (source: Source) => void;
  entwurf: EntwurfThema[];
  onEntwurfChange: (entwurf: EntwurfThema[]) => void;
  articleTitle?: string;
  children: React.ReactNode;
}

const MIN_PANEL = 280;
const MIN_EDITOR = 400;
const STORAGE_KEY = "research-panel-width";
const COLLAPSED_KEY = "research-panel-collapsed";

export default function ResearchPanel({
  editor,
  sources,
  allSources,
  selectedSourceIds,
  onToggleSource,
  onSourceCreated,
  entwurf,
  onEntwurfChange,
  articleTitle,
  children,
}: Props) {
  const [panelWidth, setPanelWidth] = useState(() => {
    if (typeof window === "undefined") return 420;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.max(MIN_PANEL, parseInt(saved)) : 420;
  });
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COLLAPSED_KEY) === "true";
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sourceFilter, setSourceFilter] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    sources: true,
    entwurf: true,
  });

  const toggleSection = (key: string) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    function onMove(e: MouseEvent) {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const maxWidth = containerRect.width - MIN_EDITOR;
      const clamped = Math.min(Math.max(newWidth, MIN_PANEL), maxWidth);
      setPanelWidth(clamped);
    }
    function onUp() {
      setIsDragging(false);
      localStorage.setItem(STORAGE_KEY, String(Math.round(panelWidth)));
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, panelWidth]);

  function toggleCollapse() {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem(COLLAPSED_KEY, String(next));
  }

  const filteredSources = sourceFilter
    ? allSources.filter(
        (s) =>
          s.authors?.toLowerCase().includes(sourceFilter.toLowerCase()) ||
          s.title?.toLowerCase().includes(sourceFilter.toLowerCase())
      )
    : allSources;

  return (
    <div ref={containerRef} className="flex h-full min-h-0" style={{ fontFamily: "var(--font-sans)" }}>
      {/* Panel */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: panelWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 flex flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest">
                Research
              </span>
              <button
                onClick={toggleCollapse}
                className="text-xs text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                title="Panel einklappen"
              >
                ◀
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Section: Quick-Add Source */}
              <div className="border-b border-[var(--color-border)] px-4 py-3">
                <p className="text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest mb-2">Quelle hinzufügen</p>
                <UniversalSourceInput
                  onImport={async (imported) => {
                    try {
                      const res = await fetch("/api/admin/sources", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(imported),
                      });
                      if (res.ok) {
                        const created = await res.json();
                        if (onSourceCreated) onSourceCreated(created);
                      }
                    } catch {
                      // Ignore errors
                    }
                  }}
                />
              </div>

              {/* Section: Verknüpfte Quellen */}
              <div className="border-b border-[var(--color-border)]">
                <button
                  onClick={() => toggleSection("sources")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest hover:bg-[var(--color-background)] transition-colors"
                >
                  <span>Verknüpfte Quellen ({selectedSourceIds.length})</span>
                  <span>{openSections.sources ? "▼" : "▶"}</span>
                </button>
                {openSections.sources && (
                  <div className="px-4 pb-3">
                    <input
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value)}
                      placeholder="Quellen filtern..."
                      className="w-full border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--color-foreground)] bg-[var(--color-background)] focus:outline-none focus:border-[var(--color-accent)] transition-colors mb-2"
                    />
                    <div className="space-y-0.5 max-h-48 overflow-y-auto">
                      {filteredSources.map((s) => (
                        <label
                          key={s._id}
                          className="flex items-start gap-2 py-1 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedSourceIds.includes(s._id)}
                            onChange={() => onToggleSource(s._id)}
                            className="accent-[var(--color-accent)] mt-0.5"
                          />
                          <span className="text-xs text-[var(--color-foreground)] leading-snug">
                            {s.authors} ({s.year}) — <em>{s.title}</em>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Themen & Zitate */}
              <div className="border-b border-[var(--color-border)]">
                <button
                  onClick={() => toggleSection("entwurf")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest hover:bg-[var(--color-background)] transition-colors"
                >
                  <span>Themen & Zitate ({entwurf.length})</span>
                  <span>{openSections.entwurf ? "▼" : "▶"}</span>
                </button>
                {openSections.entwurf && editor && (
                  <div className="px-0">
                    <EntwurfSidebar
                      editor={editor}
                      sources={sources}
                      entwurf={entwurf}
                      onChange={onEntwurfChange}
                    />
                  </div>
                )}
              </div>

              {/* Section: KI-Werkzeuge */}
              <div className="border-b border-[var(--color-border)]">
                <button
                  onClick={() => toggleSection("ai")}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest hover:bg-[var(--color-background)] transition-colors"
                >
                  <span>KI-Werkzeuge</span>
                  <span>{openSections.ai ? "▼" : "▶"}</span>
                </button>
                {openSections.ai && (
                  <div>
                    {/* Quote Suggestions */}
                    <QuoteSuggestions
                      editor={editor}
                      allQuotes={entwurf.flatMap((t) =>
                        t.zitate.map((z) => ({
                          ...z,
                          sourceName: z.sourceId
                            ? sources.find((s) => s._id === z.sourceId)?.authors
                            : undefined,
                        }))
                      )}
                      onInsertQuote={(q) => {
                        if (!editor) return;
                        editor.chain().focus().insertContent({
                          type: "blockquote",
                          content: [{ type: "paragraph", content: [{ type: "text", text: `„${q.text}"` }] }],
                        }).run();
                      }}
                      onInsertAsFootnote={(q) => {
                        if (!editor) return;
                        editor.chain().focus().insertContent({
                          type: "footnote",
                          attrs: { sourceId: q.sourceId, text: "", pages: q.pages },
                        }).run();
                      }}
                    />
                    {/* Source Chat */}
                    <div className="border-t border-[var(--color-border)]">
                      <SourceChat
                        sources={sources}
                        entwurfQuotes={entwurf.flatMap((t) => t.zitate)}
                      />
                    </div>
                    {/* Outline Generator */}
                    <div className="border-t border-[var(--color-border)]">
                      <OutlineGenerator
                        editor={editor}
                        articleTitle={articleTitle ?? ""}
                        entwurf={entwurf}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Quellen entdecken */}
              <DiscoverSources onImportSource={async (doi) => {
                try {
                  const res = await fetch(`/api/admin/doi-lookup?doi=${encodeURIComponent(doi)}`);
                  if (res.ok) {
                    const data = await res.json();
                    const createRes = await fetch("/api/admin/sources", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    if (createRes.ok && onSourceCreated) {
                      const created = await createRes.json();
                      onSourceCreated(created);
                    }
                  }
                } catch { /* ignore */ }
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resize divider */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 cursor-col-resize hover:bg-[var(--color-accent)]/30 transition-colors shrink-0 ${isDragging ? "bg-[var(--color-accent)]/40" : ""}`}
        />
      )}

      {/* Collapse button when collapsed */}
      {isCollapsed && (
        <button
          onClick={toggleCollapse}
          className="shrink-0 w-8 flex items-center justify-center border-r border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-background)] transition-colors text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          title="Research Panel öffnen"
        >
          <span className="text-xs" style={{ writingMode: "vertical-rl" }}>Research ▶</span>
        </button>
      )}

      {/* Editor area */}
      <div className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/** Inline component for Semantic Scholar discovery */
function DiscoverSources({ onImportSource }: { onImportSource: (doi: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function search() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/discover-sources?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results ?? []);
      }
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-[var(--color-muted)] uppercase tracking-widest hover:bg-[var(--color-background)] transition-colors"
      >
        <span>Quellen entdecken</span>
        <span>{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") search(); }}
              placeholder="Thema oder Titel suchen..."
              className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-1.5 text-xs bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
            />
            <button
              onClick={search}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
            >
              {loading ? "..." : "Suchen"}
            </button>
          </div>
          {results.map((r, i) => (
            <div key={i} className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg p-2.5 space-y-1">
              <p className="text-xs font-medium text-[var(--color-foreground)] leading-snug">{r.title}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {r.authors} ({r.year}) · {r.citationCount} Zitationen
              </p>
              {r.abstract && (
                <p className="text-xs text-[var(--color-muted)] line-clamp-2">{r.abstract}</p>
              )}
              <div className="flex gap-2">
                {r.doi && (
                  <button
                    onClick={() => onImportSource(r.doi)}
                    className="text-xs px-2 py-1 rounded bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                  >
                    + Importieren
                  </button>
                )}
                {r.pdfUrl && (
                  <a
                    href={r.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                  >
                    PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
