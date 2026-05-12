"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "./EditorToolbar";
import { BibleVerseExtension } from "./BibleVerseBlock";
import { FootnoteExtension } from "./FootnoteExtension";

export interface Source {
  _id: string;
  title: string;
  authors: string;
  year: number;
  type: string;
}

interface Props {
  content: object | null;
  onChange: (json: object) => void;
  placeholder?: string;
  sources?: Source[];
}

export default function TiptapEditor({ content, onChange, placeholder, sources = [] }: Props) {
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

  // Collect footnotes from editor document in order
  const footnotes: Array<{ sourceId?: string; text: string }> = [];
  editor.state.doc.descendants((node) => {
    if (node.type.name === "footnote") {
      footnotes.push({
        sourceId: node.attrs.sourceId ?? undefined,
        text: node.attrs.text ?? "",
      });
    }
    return true;
  });

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <EditorToolbar editor={editor} sources={sources} />
      <EditorContent editor={editor} />

      {footnotes.length > 0 && (
        <div className="border-t border-stone-200 px-6 py-4" style={{ fontFamily: "var(--font-sans)" }}>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest mb-3">Fußnoten</p>
          <ol className="space-y-1.5">
            {footnotes.map((fn, i) => {
              const src = fn.sourceId ? sources.find((s) => s._id === fn.sourceId) : null;
              return (
                <li key={i} className="text-sm text-stone-600 flex gap-2.5">
                  <span className="text-stone-400 shrink-0 tabular-nums">[{i + 1}]</span>
                  <span>
                    {src
                      ? `${src.authors} (${src.year}). ${src.title}.`
                      : fn.text || "—"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-2 border-t border-stone-200 text-xs text-stone-400" style={{ fontFamily: "var(--font-sans)" }}>
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
