"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Editor } from "@tiptap/react";
import type { Source } from "./TiptapEditor";

interface ArticleSummary {
  _id: string;
  titleDe: string;
  slug: { current: string };
}

interface Props {
  editor: Editor;
  sources?: Source[];
  onLektorat?: () => void;
  lektoratLoading?: boolean;
  onCollapse?: () => void;
}

/* ── Compact toolbar button ─────────────────────────── */
function TBtn({
  active,
  onClick,
  title,
  children,
  className,
  btnRef,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  btnRef?: React.Ref<HTMLButtonElement>;
  disabled?: boolean;
}) {
  return (
    <button
      ref={btnRef}
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`h-7 min-w-7 px-1.5 rounded-md text-xs font-medium transition-all duration-150 inline-flex items-center justify-center ${
        active
          ? "bg-stone-800 text-white"
          : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
      } disabled:opacity-40 disabled:cursor-not-allowed ${className ?? ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-stone-200 mx-1 shrink-0" />;
}

export default function EditorToolbar({ editor, sources = [], onLektorat, lektoratLoading, onCollapse }: Props) {
  /* ── Footnote state ─────────────────────────────────── */
  const [showFootnotePicker, setShowFootnotePicker] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sourcePages, setSourcePages] = useState("");
  const [customText, setCustomText] = useState("");
  const [pickerPos, setPickerPos] = useState<{ top: number; right: number } | null>(null);
  const footnoteButtonRef = useRef<HTMLButtonElement>(null);

  /* ── InfoCard state ─────────────────────────────────── */
  const [showInfoCardPicker, setShowInfoCardPicker] = useState(false);
  const [infoCardExplanation, setInfoCardExplanation] = useState("");
  const [infoCardPos, setInfoCardPos] = useState<{ top: number; left: number } | null>(null);
  const infoCardButtonRef = useRef<HTMLButtonElement>(null);

  /* ── Article link state ─────────────────────────────── */
  const [showArticlePicker, setShowArticlePicker] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [articlePickerPos, setArticlePickerPos] = useState<{ top: number; left: number } | null>(null);
  const articleButtonRef = useRef<HTMLButtonElement>(null);

  /* ── Insert dropdown state ──────────────────────────── */
  const [showInsertMenu, setShowInsertMenu] = useState(false);

  /* ── Footnote handlers ──────────────────────────────── */
  const openPicker = useCallback(() => {
    if (footnoteButtonRef.current) {
      const rect = footnoteButtonRef.current.getBoundingClientRect();
      setPickerPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    }
    setShowFootnotePicker(true);
    setSelectedSource(null);
    setSourcePages("");
    setCustomText("");
  }, []);

  function closePicker() {
    setShowFootnotePicker(false);
    setSelectedSource(null);
    setSourcePages("");
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        e.stopPropagation();
        setShowFootnotePicker((current) => {
          if (current) return false;
          if (footnoteButtonRef.current) {
            const rect = footnoteButtonRef.current.getBoundingClientRect();
            setPickerPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
          }
          setSelectedSource(null);
          setSourcePages("");
          setCustomText("");
          return true;
        });
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);

  function confirmSourceFootnote() {
    if (!selectedSource) return;
    editor.chain().focus().insertContent({
      type: "footnote",
      attrs: { sourceId: selectedSource._id, text: "", pages: sourcePages.trim() },
    }).run();
    closePicker();
  }

  function insertCustomFootnote() {
    if (!customText.trim()) return;
    editor.chain().focus().insertContent({
      type: "footnote",
      attrs: { sourceId: null, text: customText.trim(), pages: "" },
    }).run();
    closePicker();
  }

  /* ── Insert actions ─────────────────────────────────── */
  function addImage() {
    editor.chain().focus().insertContent({
      type: "imageBlock",
      attrs: { sanityRef: null, previewUrl: null, alt: "", caption: "", layout: "full" },
    }).run();
  }

  function addBibleVerse() {
    editor.chain().focus().insertContent({
      type: "bibleVerse",
      attrs: { reference: "", text: "", translation: "LUT" },
    }).run();
  }

  function addExplanationBox() {
    editor.chain().focus().insertContent({
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "📌 " }] }],
    }).run();
  }

  function addQuestionBox() {
    editor.chain().focus().insertContent({
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "❓ " }] }],
    }).run();
  }

  /* ── InfoCard handlers ──────────────────────────────── */
  function openInfoCardPicker() {
    if (infoCardButtonRef.current) {
      const rect = infoCardButtonRef.current.getBoundingClientRect();
      setInfoCardPos({ top: rect.bottom + 4, left: rect.left });
    }
    setInfoCardExplanation(
      editor.isActive("infocard")
        ? (editor.getAttributes("infocard").explanation as string) ?? ""
        : ""
    );
    setShowInfoCardPicker(true);
  }

  function closeInfoCardPicker() {
    setShowInfoCardPicker(false);
    setInfoCardExplanation("");
  }

  function applyInfoCard() {
    if (!infoCardExplanation.trim()) return;
    editor.chain().focus().setMark("infocard", { explanation: infoCardExplanation.trim() }).run();
    closeInfoCardPicker();
  }

  function removeInfoCard() {
    editor.chain().focus().unsetMark("infocard").run();
    closeInfoCardPicker();
  }

  /* ── Article link handlers ──────────────────────────── */
  async function openArticlePicker() {
    if (articleButtonRef.current) {
      const rect = articleButtonRef.current.getBoundingClientRect();
      setArticlePickerPos({ top: rect.bottom + 4, left: rect.left });
    }
    setArticleSearch("");
    setShowArticlePicker(true);
    if (articles.length === 0) {
      try {
        const res = await fetch("/api/admin/articles");
        const data = await res.json();
        setArticles(data);
      } catch {
        // ignore
      }
    }
  }

  function closeArticlePicker() {
    setShowArticlePicker(false);
    setArticleSearch("");
  }

  function applyArticleLink(article: ArticleSummary) {
    editor
      .chain()
      .focus()
      .setMark("internalLink", { slug: article.slug.current, titleDe: article.titleDe })
      .run();
    closeArticlePicker();
  }

  const filteredArticles = articles.filter((a) =>
    a.titleDe.toLowerCase().includes(articleSearch.toLowerCase()) ||
    a.slug.current.includes(articleSearch.toLowerCase())
  );

  /* ── Popover styling ────────────────────────────────── */
  const popover = "fixed bg-white border border-stone-200 rounded-xl shadow-xl p-4 z-50";

  return (
    <div className="sticky top-0 z-20">
      <div className="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-stone-100 bg-white/90 backdrop-blur-md">
        {/* ── Text format ─── */}
        <TBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Fett (⌘B)">
          <span className="font-bold">B</span>
        </TBtn>
        <TBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Kursiv (⌘I)">
          <span className="italic font-serif">I</span>
        </TBtn>

        <Divider />

        {/* ── Headings ─── */}
        <TBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Überschrift 2">
          H2
        </TBtn>
        <TBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Überschrift 3">
          H3
        </TBtn>
        <TBtn active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="Überschrift 4">
          H4
        </TBtn>

        <Divider />

        {/* ── Lists ─── */}
        <TBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Aufzählung">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </TBtn>
        <TBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Nummerierte Liste">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">1</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">2</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">3</text></svg>
        </TBtn>

        <Divider />

        {/* ── Insert dropdown ─── */}
        <div className="relative">
          <TBtn active={showInsertMenu} onClick={() => setShowInsertMenu(!showInsertMenu)} title="Block einfügen" className="px-2.5 gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="hidden sm:inline">Einfügen</span>
          </TBtn>
          {showInsertMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowInsertMenu(false)} />
              <div className="absolute left-0 top-full mt-1.5 bg-white border border-stone-200 rounded-lg shadow-xl py-1 z-50 min-w-[168px]" style={{ fontFamily: "var(--font-sans)" }}>
                {[
                  { label: "Bibelvers", fn: addBibleVerse },
                  { label: "Zitat-Box", fn: () => editor.chain().focus().toggleBlockquote().run() },
                  { label: "Erklärung", fn: addExplanationBox },
                  { label: "Frage", fn: addQuestionBox },
                  { label: "Bild", fn: addImage },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.fn(); setShowInsertMenu(false); }}
                    className="w-full text-left px-3 py-2 text-[13px] text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <Divider />

        {/* ── Marks: Info card ─── */}
        <div className="relative">
          <TBtn btnRef={infoCardButtonRef} active={editor.isActive("infocard")} onClick={openInfoCardPicker} title="Info-Karte (markierten Text erklären)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </TBtn>
          {showInfoCardPicker && infoCardPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeInfoCardPicker} />
              <div className={popover} style={{ fontFamily: "var(--font-sans)", minWidth: "320px", top: infoCardPos.top, left: infoCardPos.left }}>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Erklärung</p>
                <textarea
                  value={infoCardExplanation}
                  onChange={(e) => setInfoCardExplanation(e.target.value)}
                  placeholder="Erkläre den markierten Begriff..."
                  rows={3}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition-colors resize-none mb-3"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) applyInfoCard(); }}
                />
                <div className="flex gap-2">
                  <button onClick={applyInfoCard} className="flex-1 px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                    Einfügen
                  </button>
                  {editor.isActive("infocard") && (
                    <button onClick={removeInfoCard} className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm hover:border-red-300 hover:text-red-600 transition-colors">
                      Entfernen
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Marks: Article link ─── */}
        <div className="relative">
          <TBtn btnRef={articleButtonRef} active={editor.isActive("internalLink")} onClick={openArticlePicker} title="Artikel verlinken">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          </TBtn>
          {showArticlePicker && articlePickerPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeArticlePicker} />
              <div className={popover} style={{ fontFamily: "var(--font-sans)", minWidth: "360px", top: articlePickerPos.top, left: articlePickerPos.left }}>
                <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Artikel verlinken</p>
                <input
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  placeholder="Artikel suchen..."
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition-colors mb-2"
                  autoFocus
                />
                <div className="space-y-0.5 max-h-52 overflow-y-auto">
                  {filteredArticles.length === 0 && (
                    <p className="text-xs text-stone-400 py-2 px-1">Keine Artikel gefunden.</p>
                  )}
                  {filteredArticles.map((a) => (
                    <button
                      key={a._id}
                      onClick={() => applyArticleLink(a)}
                      className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors"
                    >
                      {a.titleDe}
                      <span className="text-stone-400 text-xs ml-2">/{a.slug.current}</span>
                    </button>
                  ))}
                </div>
                {editor.isActive("internalLink") && (
                  <button
                    onClick={() => { editor.chain().focus().unsetMark("internalLink").run(); closeArticlePicker(); }}
                    className="mt-2 w-full text-xs text-stone-400 hover:text-red-500 transition-colors py-1"
                  >
                    Verlinkung entfernen
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <Divider />

        {/* ── Footnote ─── */}
        <div className="relative">
          <TBtn btnRef={footnoteButtonRef} active={showFootnotePicker} onClick={openPicker} title="Fußnote einfügen (⌘F)">
            <span className="text-[11px]">¹</span>
          </TBtn>
          {showFootnotePicker && pickerPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={closePicker} />
              <div className={popover} style={{ fontFamily: "var(--font-sans)", minWidth: "360px", top: pickerPos.top, right: pickerPos.right }}>
                {selectedSource ? (
                  <>
                    <button
                      onClick={() => { setSelectedSource(null); setSourcePages(""); }}
                      className="text-xs text-stone-400 hover:text-stone-600 mb-3 flex items-center gap-1 transition-colors"
                    >
                      ← Zurück
                    </button>
                    <p className="text-sm text-stone-700 mb-3">
                      <span className="font-medium">{selectedSource.authors}</span>{" "}
                      <span className="text-stone-400">({selectedSource.year})</span>{" "}
                      — <em>{selectedSource.title}</em>
                    </p>
                    <label className="text-xs font-medium text-stone-400 uppercase tracking-widest block mb-1.5">
                      Seite(n)
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={sourcePages}
                        onChange={(e) => setSourcePages(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && confirmSourceFootnote()}
                        placeholder="z. B. 152 oder 152–154"
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={confirmSourceFootnote}
                        className="px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                      >
                        Einfügen
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {sources.length > 0 && (
                      <>
                        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">
                          Aus Quellen <span className="normal-case font-normal ml-1 opacity-60">⌘F zum Öffnen/Schließen</span>
                        </p>
                        <div className="space-y-0.5 max-h-52 overflow-y-auto mb-3">
                          {sources.map((s) => (
                            <button
                              key={s._id}
                              onClick={() => { setSelectedSource(s); setSourcePages(""); }}
                              className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-700 transition-colors"
                            >
                              <span className="font-medium">{s.authors}</span>{" "}
                              <span className="text-stone-400">({s.year})</span>{" "}
                              — <em>{s.title}</em>
                            </button>
                          ))}
                        </div>
                        <hr className="border-stone-100 mb-3" />
                      </>
                    )}
                    {sources.length === 0 && (
                      <p className="text-xs text-stone-400 mb-3">Keine Quellen für diesen Artikel ausgewählt.</p>
                    )}
                    <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Eigene Fußnote</p>
                    <div className="flex gap-2">
                      <input
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && insertCustomFootnote()}
                        placeholder="Fußnotentext..."
                        className="flex-1 border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 focus:outline-none focus:border-stone-400 transition-colors"
                        autoFocus
                      />
                      <button
                        onClick={insertCustomFootnote}
                        className="px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
                      >
                        Einfügen
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Spacer ─── */}
        <div className="flex-1" />

        {/* ── Lektorat ─── */}
        {onLektorat && (
          <TBtn
            active={false}
            onClick={onLektorat}
            disabled={lektoratLoading}
            title="KI-Lektorat starten"
            className={`px-2.5 ${lektoratLoading ? "!text-amber-400" : "!text-amber-700 hover:!bg-amber-50"}`}
          >
            {lektoratLoading ? "Prüft…" : "✦ Lektorat"}
          </TBtn>
        )}

        {/* ── Collapse ─── */}
        {onCollapse && (
          <button
            onClick={onCollapse}
            title="Werkzeugleiste ausblenden (⌘⇧T)"
            className="h-7 w-7 rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-all duration-150 flex items-center justify-center shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
