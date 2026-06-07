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
  showEntwurf?: boolean;
  onToggleEntwurf?: () => void;
}

export default function EditorToolbar({ editor, sources = [], onLektorat, lektoratLoading, showEntwurf, onToggleEntwurf }: Props) {
  const [showFootnotePicker, setShowFootnotePicker] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sourcePages, setSourcePages] = useState("");
  const [customText, setCustomText] = useState("");
  const [pickerPos, setPickerPos] = useState<{ top: number; right: number } | null>(null);
  const footnoteButtonRef = useRef<HTMLButtonElement>(null);

  // InfoCard state
  const [showInfoCardPicker, setShowInfoCardPicker] = useState(false);
  const [infoCardExplanation, setInfoCardExplanation] = useState("");
  const [infoCardPos, setInfoCardPos] = useState<{ top: number; left: number } | null>(null);
  const infoCardButtonRef = useRef<HTMLButtonElement>(null);

  // Article link state
  const [showArticlePicker, setShowArticlePicker] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [articlePickerPos, setArticlePickerPos] = useState<{ top: number; left: number } | null>(null);
  const articleButtonRef = useRef<HTMLButtonElement>(null);

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

  // Keyboard shortcut: Cmd/Ctrl + F — capture phase so we intercept before browser find
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

  const btn = (active: boolean) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${active ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`;

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1.5 p-3 border-b border-stone-200 bg-stone-50">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>I</button>
        <div className="w-px bg-stone-200 mx-1" />
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
        <div className="w-px bg-stone-200 mx-1" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• Liste</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. Liste</button>
        <div className="w-px bg-stone-200 mx-1" />
        <button onClick={addBibleVerse} className={btn(false)}>📖 Bibelvers</button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btn(editor.isActive("blockquote"))}
          title="Zitat-Box (markierten Text umschließen oder neue einfügen)"
        >
          ❝ Zitat
        </button>
        <button onClick={addExplanationBox} className={btn(false)}>📌 Erklärung</button>
        <button onClick={addQuestionBox} className={btn(false)}>❓ Frage</button>
        <button onClick={addImage} className={btn(false)}>🖼 Bild</button>
        <div className="w-px bg-stone-200 mx-1" />
        {/* InfoCard */}
        <div className="relative">
          <button
            ref={infoCardButtonRef}
            onClick={openInfoCardPicker}
            className={btn(editor.isActive("infocard"))}
            title="Info-Karte einfügen (Erklärung für markierten Text)"
          >
            💡 Info
          </button>
          {showInfoCardPicker && infoCardPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeInfoCardPicker} />
              <div
                className="fixed bg-white border border-stone-200 rounded-xl shadow-xl p-4 z-50"
                style={{ fontFamily: "var(--font-sans)", minWidth: "320px", top: infoCardPos.top, left: infoCardPos.left }}
              >
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
                  <button
                    onClick={applyInfoCard}
                    className="flex-1 px-3 py-2 rounded-lg bg-stone-800 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Einfügen
                  </button>
                  {editor.isActive("infocard") && (
                    <button
                      onClick={removeInfoCard}
                      className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 text-sm hover:border-red-300 hover:text-red-600 transition-colors"
                    >
                      Entfernen
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Article Link */}
        <div className="relative">
          <button
            ref={articleButtonRef}
            onClick={openArticlePicker}
            className={btn(editor.isActive("internalLink"))}
            title="Auf anderen Artikel verweisen"
          >
            → Artikel
          </button>
          {showArticlePicker && articlePickerPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={closeArticlePicker} />
              <div
                className="fixed bg-white border border-stone-200 rounded-xl shadow-xl p-4 z-50"
                style={{ fontFamily: "var(--font-sans)", minWidth: "360px", top: articlePickerPos.top, left: articlePickerPos.left }}
              >
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
        <div className="w-px bg-stone-200 mx-1" />
        {onLektorat && (
          <button
            onClick={onLektorat}
            disabled={lektoratLoading}
            title="KI-Lektorat starten"
            className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors border ${
              lektoratLoading
                ? "bg-amber-50 text-amber-400 border-amber-200 cursor-not-allowed"
                : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
            }`}
          >
            {lektoratLoading ? "Prüft…" : "✦ Lektorat"}
          </button>
        )}
        {onToggleEntwurf && (
          <>
            <div className="w-px bg-stone-200 mx-1" />
            <button
              onClick={onToggleEntwurf}
              title="Entwurf-Sidebar ein-/ausblenden"
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
                showEntwurf
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
              }`}
            >
              ✎ Entwurf
            </button>
          </>
        )}
        <div className="w-px bg-stone-200 mx-1" />
        <div className="relative">
          <button ref={footnoteButtonRef} onClick={openPicker} className={btn(showFootnotePicker)} title="Fußnote einfügen (⌘F)">
            ¹ Fußnote
          </button>

          {showFootnotePicker && pickerPos && (
            <>
              <div className="fixed inset-0 z-40" onClick={closePicker} />
              <div
                className="fixed bg-white border border-stone-200 rounded-xl shadow-xl p-4 z-50"
                style={{ fontFamily: "var(--font-sans)", minWidth: "360px", top: pickerPos.top, right: pickerPos.right }}
              >
                {/* Step 2: page input for selected source */}
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
                    {/* Step 1: source list */}
                    {sources.length > 0 && (
                      <>
                        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Aus Quellen <span className="normal-case font-normal ml-1 opacity-60">⌘F zum Öffnen/Schließen</span></p>
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
      </div>
    </div>
  );
}
