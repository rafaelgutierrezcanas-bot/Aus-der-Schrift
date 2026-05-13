"use client";
import { useState } from "react";
import { Editor } from "@tiptap/react";
import type { Source } from "./TiptapEditor";

interface Props {
  editor: Editor;
  sources?: Source[];
}

export default function EditorToolbar({ editor, sources = [] }: Props) {
  const [showFootnotePicker, setShowFootnotePicker] = useState(false);
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [sourcePages, setSourcePages] = useState("");
  const [customText, setCustomText] = useState("");

  function openPicker() {
    setShowFootnotePicker((v) => !v);
    setSelectedSource(null);
    setSourcePages("");
    setCustomText("");
  }

  function closePicker() {
    setShowFootnotePicker(false);
    setSelectedSource(null);
    setSourcePages("");
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
        <button onClick={addExplanationBox} className={btn(false)}>📌 Erklärung</button>
        <button onClick={addQuestionBox} className={btn(false)}>❓ Frage</button>
        <div className="w-px bg-stone-200 mx-1" />
        <div className="relative">
          <button onClick={openPicker} className={btn(showFootnotePicker)}>
            ¹ Fußnote
          </button>

          {showFootnotePicker && (
            <>
              <div className="fixed inset-0 z-40" onClick={closePicker} />
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl p-4 z-50"
                style={{ fontFamily: "var(--font-sans)", minWidth: "360px" }}
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
                        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-2">Aus Quellen</p>
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
