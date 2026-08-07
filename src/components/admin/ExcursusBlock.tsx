"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export const ExcursusExtension = Node.create({
  name: "excursus",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      title: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="excursus"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "excursus" }), 0];
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
  const [editingTitle, setEditingTitle] = useState(false);
  const { title } = node.attrs;

  return (
    <NodeViewWrapper>
      <div className="border border-stone-200 rounded-lg my-4 bg-stone-50/50">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200">
          <ChevronRight
            size={14}
            className="shrink-0 text-stone-400 rotate-90"
          />
          <div className="min-w-0 flex-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400 block"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Exkurs
            </span>
            {editingTitle ? (
              <input
                value={title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }}
                placeholder="Titel eingeben..."
                className="w-full text-sm font-medium text-stone-700 bg-transparent border-b border-stone-300 focus:border-stone-500 focus:outline-none py-0.5"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-medium text-stone-700 hover:text-stone-900 transition-colors text-left w-full"
              >
                {title || "Titel eingeben..."}
              </button>
            )}
          </div>
        </div>

        {/* Editable content — managed by TipTap, not a separate editor */}
        <NodeViewContent className="prose prose-stone prose-sm max-w-none px-4 py-3" />
      </div>
    </NodeViewWrapper>
  );
}
