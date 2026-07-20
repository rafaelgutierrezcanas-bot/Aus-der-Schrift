"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";
import { BibleVerseExtension } from "./BibleVerseBlock";
import { FootnoteExtension } from "./FootnoteExtension";
import { ImageBlockExtension } from "./ImageBlock";
import { InfoCardExtension } from "./InfoCardExtension";
import { InternalLinkExtension } from "./InternalLinkExtension";
import LektoratPanel, { type LektoratChange } from "./LektoratPanel";
import EntwurfSidebar, { type EntwurfThema } from "./EntwurfSidebar";
export type { EntwurfThema } from "./EntwurfSidebar";
import { formatChicago } from "@/lib/formatChicago";
import { tiptapToMarkdown } from "@/lib/tiptapToMarkdown";
import { markdownToTiptap } from "@/lib/markdownToTiptap";
import { extractTextWithMarkers } from "@/lib/extractText";

export type { Source } from "@/lib/formatChicago";
import type { Source } from "@/lib/formatChicago";

import type { Editor } from "@tiptap/react";

interface Props {
  content: object | null;
  onChange: (json: object) => void;
  onEditorReady?: (editor: Editor) => void;
  placeholder?: string;
  sources?: Source[];
  entwurf?: EntwurfThema[];
  onEntwurfChange?: (entwurf: EntwurfThema[]) => void;
  saveStatus?: "saving" | "saved" | null;
}

// Replace the first occurrence of `original` in Tiptap JSON text nodes
function applyTextChange(
  node: any,
  original: string,
  corrected: string
): { node: any; found: boolean } {
  if (node.type === "text" && typeof node.text === "string") {
    const idx = node.text.indexOf(original);
    if (idx !== -1) {
      return {
        node: {
          ...node,
          text: node.text.slice(0, idx) + corrected + node.text.slice(idx + original.length),
        },
        found: true,
      };
    }
  }
  if (Array.isArray(node.content)) {
    const newContent: any[] = [];
    let found = false;
    for (const child of node.content) {
      if (found) {
        newContent.push(child);
      } else {
        const result = applyTextChange(child, original, corrected);
        newContent.push(result.node);
        found = result.found;
      }
    }
    return { node: { ...node, content: newContent }, found };
  }
  return { node, found: false };
}

export default function TiptapEditor({ content, onChange, onEditorReady, placeholder, sources = [], entwurf, onEntwurfChange, saveStatus }: Props) {
  const [lektoratLoading, setLektoratLoading] = useState(false);
  const [lektoratChanges, setLektoratChanges] = useState<LektoratChange[] | null>(null);
  const [lektoratError, setLektoratError] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BibleVerseExtension,
      FootnoteExtension,
      ImageBlockExtension,
      InfoCardExtension,
      InternalLinkExtension,
      Placeholder.configure({ placeholder: placeholder ?? "Schreibe hier..." }),
    ],
    immediatelyRender: false,
    content: content ?? undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone max-w-none focus:outline-none min-h-[400px] px-6 py-5",
      },
    },
  });

  // Expose editor instance to parent via callback
  const onEditorReadyRef = useRef(onEditorReady);
  onEditorReadyRef.current = onEditorReady;
  useEffect(() => {
    if (editor && onEditorReadyRef.current) {
      onEditorReadyRef.current(editor);
    }
  }, [editor]);

  if (!editor) return null;

  async function runLektorat() {
    if (!editor) return;
    setLektoratLoading(true);
    setLektoratChanges(null);
    setLektoratError(null);
    try {
      const text = extractTextWithMarkers(editor.getJSON());
      const res = await fetch("/api/admin/lektorat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLektoratError(data.error ?? "Lektorat fehlgeschlagen");
        return;
      }
      setLektoratChanges(data.changes ?? []);
    } catch (e) {
      setLektoratError(e instanceof Error ? e.message : "Netzwerkfehler");
    } finally {
      setLektoratLoading(false);
    }
  }

  function applyChange(original: string, corrected: string): boolean {
    if (!editor) return false;
    const doc = editor.getJSON();
    const result = applyTextChange(doc, original, corrected);
    if (result.found) {
      editor.commands.setContent(result.node);
    }
    return result.found;
  }

  function handleExport() {
    if (!editor) return;
    const md = tiptapToMarkdown(editor.getJSON() as any, sources);
    setExportText(md);
    setShowExportModal(true);
    navigator.clipboard.writeText(md).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }).catch(() => {});
  }

  function handleImport() {
    if (!editor || !importText.trim()) return;
    const doc = markdownToTiptap(importText);
    editor.commands.setContent(doc);
    setShowImportModal(false);
    setImportText("");
  }

  // Collect footnotes for the footnote list
  const footnotes: Array<{ sourceId?: string; text: string; pages?: string }> = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === "footnote") {
      footnotes.push({
        sourceId: node.attrs.sourceId ?? undefined,
        text: node.attrs.text ?? "",
        pages: node.attrs.pages ?? undefined,
      });
    }
    return true;
  });

  return (
    <div className="border border-stone-200 rounded-xl bg-white">
      <EditorToolbar
        editor={editor}
        sources={sources}
        onLektorat={runLektorat}
        lektoratLoading={lektoratLoading}
      />
      <div>
        <EditorContent editor={editor} />

        {/* Footnote list */}
        {footnotes.length > 0 && (
          <div className="border-t border-stone-200 px-6 py-4" style={{ fontFamily: "var(--font-sans)" }}>
            <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">Fußnoten</p>
            <ol className="space-y-1.5">
              {footnotes.map((fn, i) => {
                const src = fn.sourceId ? sources.find((s) => s._id === fn.sourceId) : null;
                return (
                  <li key={i} className="text-sm text-stone-600 flex gap-2.5">
                    <span className="text-stone-400 shrink-0 tabular-nums">[{i + 1}]</span>
                    <span>{src ? formatChicago(src, fn.pages) : fn.text || "—"}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Lektorat error */}
        {lektoratError && (
          <div className="border-t border-stone-200 px-6 py-4 flex items-start justify-between gap-4" style={{ fontFamily: "var(--font-sans)" }}>
            <p className="text-sm text-red-600">
              <span className="font-medium">Lektorat-Fehler:</span> {lektoratError}
            </p>
            <button onClick={() => setLektoratError(null)} className="text-xs text-stone-400 hover:text-stone-600 shrink-0">Schließen</button>
          </div>
        )}

        {/* Lektorat panel */}
        {lektoratChanges !== null && (
          <LektoratPanel
            changes={lektoratChanges}
            onApply={applyChange}
            onClose={() => setLektoratChanges(null)}
          />
        )}
      </div>

      {/* Word count + Export/Import */}
      <div
        className="flex items-center gap-4 px-4 py-2 border-t border-stone-200 text-xs text-stone-400 rounded-b-xl"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {(() => {
          const text = editor.getText();
          const words = text.trim() ? text.trim().split(/\s+/).length : 0;
          const minutes = Math.max(1, Math.ceil(words / 200));
          return (
            <>
              <span>{words} Wörter</span>
              <span>~{minutes} Min. Lesezeit</span>
            </>
          );
        })()}
        {saveStatus === "saving" && (
          <span className="text-amber-500">Speichert…</span>
        )}
        {saveStatus === "saved" && (
          <span className="text-green-600">Gespeichert</span>
        )}
        <span className="ml-auto" />
        <button
          onClick={handleExport}
          className="hover:text-stone-600 transition-colors"
          title="Als Markdown exportieren"
        >
          ↓ Export
        </button>
        <button
          onClick={() => setShowImportModal(true)}
          className="hover:text-stone-600 transition-colors"
          title="Markdown importieren"
        >
          ↑ Import
        </button>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowExportModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
              <h3 className="text-sm font-medium text-stone-700">Markdown Export</h3>
              <div className="flex items-center gap-2">
                {copyFeedback && <span className="text-xs text-green-600">Kopiert!</span>}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(exportText).then(() => {
                      setCopyFeedback(true);
                      setTimeout(() => setCopyFeedback(false), 2000);
                    });
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Kopieren
                </button>
                <button onClick={() => setShowExportModal(false)} className="text-stone-400 hover:text-stone-600 text-lg leading-none">×</button>
              </div>
            </div>
            <textarea
              readOnly
              value={exportText}
              className="flex-1 px-5 py-4 text-sm text-stone-700 font-mono resize-none focus:outline-none min-h-[300px] overflow-auto"
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()} style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
              <h3 className="text-sm font-medium text-stone-700">Markdown Import</h3>
              <button onClick={() => setShowImportModal(false)} className="text-stone-400 hover:text-stone-600 text-lg leading-none">×</button>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Markdown hier einfügen..."
              className="flex-1 px-5 py-4 text-sm text-stone-700 font-mono resize-none focus:outline-none min-h-[300px] overflow-auto"
            />
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-200">
              <button
                onClick={() => { setShowImportModal(false); setImportText(""); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="text-xs px-4 py-1.5 rounded-lg bg-stone-800 text-white hover:bg-stone-900 disabled:opacity-40 transition-colors"
              >
                Importieren
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
