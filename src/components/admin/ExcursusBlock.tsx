"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export const ExcursusExtension = Node.create({
  name: "excursus",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      title: { default: "" },
      content: { default: "[]" }, // JSON-stringified portable-text blocks
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

  // Parse stored content blocks for display
  let blocks: Array<{ children?: Array<{ text?: string }> }> = [];
  try {
    blocks = typeof content === "string" ? JSON.parse(content) : content;
  } catch {
    blocks = [];
  }

  // Simple plain-text extraction for preview
  const plainText = blocks
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .filter(Boolean)
    .join("\n\n");

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="border-2 border-stone-300 rounded-xl p-4 bg-stone-50 space-y-3 my-4">
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
            className="w-full border border-stone-200 rounded px-3 py-1.5 text-sm font-medium"
          />
          <textarea
            placeholder="Inhalt des Exkurses..."
            value={plainText}
            onChange={(e) => {
              // Convert plain text back to portable-text-like blocks
              const paragraphs = e.target.value.split("\n\n").filter(Boolean);
              const newBlocks = paragraphs.map((p) => ({
                _type: "block",
                style: "normal",
                children: [{ _type: "span", text: p }],
              }));
              updateAttributes({
                content: JSON.stringify(newBlocks.length ? newBlocks : []),
              });
            }}
            rows={5}
            className="w-full border border-stone-200 rounded px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => setEditing(false)}
            className="text-xs text-stone-500 underline"
          >
            Fertig
          </button>
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
            <p className="text-sm text-stone-500 whitespace-pre-wrap leading-relaxed">
              {plainText}
            </p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
