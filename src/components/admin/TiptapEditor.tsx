"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useState } from "react";
import EditorToolbar from "./EditorToolbar";
import { BibleVerseExtension } from "./BibleVerseBlock";
import { FootnoteExtension } from "./FootnoteExtension";
import LektoratPanel, { type LektoratChange } from "./LektoratPanel";

export interface Source {
  _id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
  publisher?: string;
  pages?: string;
}

interface Props {
  content: object | null;
  onChange: (json: object) => void;
  placeholder?: string;
  sources?: Source[];
}

function normalizeCase(str: string): string {
  if (!str) return str;
  // Only convert if the whole string is uppercase
  if (str !== str.toUpperCase() || !/[A-ZÜÄÖ]/.test(str)) return str;
  return str
    .toLowerCase()
    .replace(/(^|[\s,;-])([a-züäöß])/g, (_, sep, c) => sep + c.toUpperCase());
}

export function formatChicago(source: Source, citedPages?: string): string {
  const p = citedPages?.trim() || "";
  const pub = normalizeCase(source.publisher ?? "");

  const authors = normalizeCase(source.authors);
  const title = normalizeCase(source.title);

  switch (source.type) {
    case "journal": {
      const pageStr = p ? `: ${p}` : source.pages ? `: ${source.pages}` : "";
      return `${authors}, "${title}," ${pub} (${source.year})${pageStr}.`;
    }
    case "book": {
      const pageStr = p ? `, ${p}` : "";
      return `${authors}, ${title} (${pub ? pub + ", " : ""}${source.year})${pageStr}.`;
    }
    case "dissertation": {
      const pageStr = p ? `, ${p}` : "";
      return `${authors}, "${title}" (PhD diss., ${pub ? pub + ", " : ""}${source.year})${pageStr}.`;
    }
    case "website": {
      return `${authors}, "${title}," ${pub ? pub + ", " : ""}${source.year}.`;
    }
    case "bible": {
      return p ? `${title} ${p}` : title;
    }
    default: {
      const pageStr = p ? `, ${p}` : "";
      return `${authors}, "${title}" (${source.year})${pageStr}.`;
    }
  }
}

// Extract plain text from Tiptap JSON, replacing footnote nodes with ⟨N⟩ markers
function extractTextWithMarkers(doc: any): string {
  let fnCount = 0;
  const paragraphs: string[] = [];

  function processNode(node: any): string {
    if (node.type === "text") return node.text ?? "";
    if (node.type === "footnote") {
      fnCount++;
      return `⟨${fnCount}⟩`;
    }
    if (node.content) return node.content.map(processNode).join("");
    return "";
  }

  for (const block of doc.content ?? []) {
    if (block.type === "bibleVerse" || block.type === "image") continue;
    const text = processNode(block).trim();
    if (text) paragraphs.push(text);
  }

  return paragraphs.join("\n\n");
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

export default function TiptapEditor({ content, onChange, placeholder, sources = [] }: Props) {
  const [lektoratLoading, setLektoratLoading] = useState(false);
  const [lektoratChanges, setLektoratChanges] = useState<LektoratChange[] | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BibleVerseExtension,
      FootnoteExtension,
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

  if (!editor) return null;

  async function runLektorat() {
    if (!editor) return;
    setLektoratLoading(true);
    setLektoratChanges(null);
    try {
      const text = extractTextWithMarkers(editor.getJSON());
      const res = await fetch("/api/admin/lektorat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("API Fehler");
      const data = await res.json();
      setLektoratChanges(data.changes ?? []);
    } catch {
      setLektoratChanges([]);
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
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <EditorToolbar
        editor={editor}
        sources={sources}
        onLektorat={runLektorat}
        lektoratLoading={lektoratLoading}
      />
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

      {/* Lektorat panel */}
      {lektoratChanges !== null && (
        <LektoratPanel
          changes={lektoratChanges}
          onApply={applyChange}
          onClose={() => setLektoratChanges(null)}
        />
      )}

      {/* Word count */}
      <div
        className="flex items-center gap-4 px-4 py-2 border-t border-stone-200 text-xs text-stone-400"
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
      </div>
    </div>
  );
}
