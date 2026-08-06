"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronRight } from "lucide-react";
import { FootnoteExtension } from "./FootnoteExtension";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";

export const ExcursusExtension = Node.create({
  name: "excursus",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      title: { default: "" },
      content: { default: "[]" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="excursus"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "excursus" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ExcursusView);
  },
});

/* ── Mini editor for excursus content ─────────────────── */

function ExcursusEditor({
  initialContent,
  onChange,
}: {
  initialContent: unknown[];
  onChange: (blocks: unknown[]) => void;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Compute initial content once (not on every render)
  const [initialDoc] = useState(() => {
    const doc = portableTextToTiptap(initialContent as Parameters<typeof portableTextToTiptap>[0]);
    // Ensure doc has at least one paragraph so the editor is usable
    if (!doc.content || doc.content.length === 0) {
      doc.content = [{ type: "paragraph" }];
    }
    return doc;
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      FootnoteExtension,
    ],
    immediatelyRender: false,
    content: initialDoc as any,
    onUpdate: ({ editor: e }) => {
      const pt = tiptapToPortableText(e.getJSON() as Parameters<typeof tiptapToPortableText>[0]);
      onChangeRef.current(pt);
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2",
      },
    },
  });

  const [fnText, setFnText] = useState("");
  const [showFnInput, setShowFnInput] = useState(false);

  const insertFootnote = useCallback(() => {
    if (!editor || !fnText.trim()) return;
    editor.chain().focus().insertContent({
      type: "footnote",
      attrs: { sourceId: null, text: fnText.trim(), pages: "" },
    }).run();
    setFnText("");
    setShowFnInput(false);
  }, [editor, fnText]);

  if (!editor) return null;

  // Stop all events from bubbling to the parent TipTap editor
  const stopPropagation = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
      onKeyDown={stopPropagation as any}
    >
      {/* Mini toolbar */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-stone-200 bg-stone-50/50">
        <MiniBtn
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Fett"
        >
          <span className="font-bold text-[11px]">B</span>
        </MiniBtn>
        <MiniBtn
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Kursiv"
        >
          <span className="italic font-serif text-[11px]">I</span>
        </MiniBtn>
        <div className="w-px h-3.5 bg-stone-200 mx-0.5" />
        <MiniBtn
          active={showFnInput}
          onClick={() => setShowFnInput(!showFnInput)}
          title="Fußnote einfügen"
        >
          <span className="text-[10px]">¹</span>
        </MiniBtn>
      </div>

      {/* Footnote input */}
      {showFnInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-stone-200 bg-amber-50/50">
          <input
            value={fnText}
            onChange={(e) => setFnText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") insertFootnote(); }}
            placeholder="Fußnotentext..."
            className="flex-1 text-xs border border-stone-200 rounded px-2 py-1 focus:outline-none focus:border-stone-400"
            autoFocus
          />
          <button
            onClick={insertFootnote}
            disabled={!fnText.trim()}
            className="text-xs px-2 py-1 rounded bg-stone-700 text-white hover:bg-stone-800 disabled:opacity-40 transition-colors"
          >
            Einfügen
          </button>
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

function MiniBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`h-6 w-6 rounded flex items-center justify-center transition-colors ${
        active
          ? "bg-stone-700 text-white"
          : "text-stone-500 hover:bg-stone-200 hover:text-stone-700"
      }`}
    >
      {children}
    </button>
  );
}

/* ── Main excursus node view ──────────────────────────── */

function ExcursusView({
  node,
  updateAttributes,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { title, content } = node.attrs;

  let blocks: unknown[] = [];
  try {
    blocks = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    blocks = [];
  }

  // Plain text for collapsed preview
  const plainText = (blocks as Array<{ children?: Array<{ text?: string }> }>)
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .filter(Boolean)
    .join(" ");

  // Count footnotes for preview
  const fnCount = (blocks as Array<{ children?: Array<{ _type?: string }> }>)
    .reduce((n, b) => n + (b.children ?? []).filter((c) => c._type === "footnote").length, 0);

  if (editing) {
    const stop = (e: React.SyntheticEvent) => e.stopPropagation();
    return (
      <NodeViewWrapper>
        <div
          className="border-2 border-stone-300 rounded-xl my-4 bg-stone-50 overflow-hidden"
          onMouseDown={stop}
          onClick={stop}
          onKeyDown={stop as any}
        >
          <div className="px-4 py-3 border-b border-stone-200 space-y-2">
            <p
              className="text-xs font-semibold text-stone-500 uppercase tracking-wide"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Exkurs bearbeiten
            </p>
            <input
              placeholder="Titel (z.B. Historischer Kontext)"
              value={title}
              onChange={(e) => updateAttributes({ title: e.target.value })}
              className="w-full border border-stone-200 rounded px-3 py-1.5 text-sm font-medium focus:outline-none focus:border-stone-400"
            />
          </div>

          <ExcursusEditor
            initialContent={blocks}
            onChange={(newBlocks) => {
              updateAttributes({ content: JSON.stringify(newBlocks) });
            }}
          />

          <div className="px-4 py-2 border-t border-stone-200 flex justify-end">
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-stone-500 hover:text-stone-700 transition-colors px-3 py-1 rounded hover:bg-stone-200"
            >
              Fertig
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div className="border border-stone-200 rounded-lg my-4 bg-stone-50/50">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer group"
        >
          <ChevronRight
            size={14}
            className={`shrink-0 text-stone-400 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          />
          <div className="min-w-0 flex-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 block"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Exkurs
              {fnCount > 0 && (
                <span className="normal-case font-normal ml-2 text-stone-400">
                  · {fnCount} {fnCount === 1 ? "Fußnote" : "Fußnoten"}
                </span>
              )}
            </span>
            <span className="text-sm font-medium text-stone-700 line-clamp-1">
              {title || "Kein Titel"}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
            }}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 rounded hover:bg-stone-100"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Bearbeiten
          </button>
        </button>

        {expanded && plainText && (
          <div className="px-4 pb-3 border-t border-stone-200 pt-2">
            <p className="text-sm text-stone-500 line-clamp-3 leading-relaxed">
              {plainText}
            </p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
