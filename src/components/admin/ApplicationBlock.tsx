"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";
import { Lightbulb } from "lucide-react";

export const ApplicationExtension = Node.create({
  name: "application",
  group: "block",
  content: "block+",
  defining: true,
  addAttributes() {
    return {
      title: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="application"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "application" }), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ApplicationView);
  },
});

function ApplicationView({
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
      <div className="border border-emerald-200 rounded-lg my-4 bg-emerald-50/50">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-emerald-200">
          <Lightbulb
            size={14}
            className="shrink-0 text-emerald-500"
          />
          <div className="min-w-0 flex-1">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-500 block"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Anwendung
            </span>
            {editingTitle ? (
              <input
                value={title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }}
                placeholder="Titel eingeben (optional)..."
                className="w-full text-sm font-medium text-emerald-800 bg-transparent border-b border-emerald-300 focus:border-emerald-500 focus:outline-none py-0.5"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setEditingTitle(true)}
                className="text-sm font-medium text-emerald-800 hover:text-emerald-900 transition-colors text-left w-full"
              >
                {title || "Titel eingeben (optional)..."}
              </button>
            )}
          </div>
        </div>

        {/* Editable content */}
        <NodeViewContent className="prose prose-stone prose-sm max-w-none px-4 py-3" />
      </div>
    </NodeViewWrapper>
  );
}
