"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

function FootnoteMarker({ node, getPos, editor }: any) {
  let num = 1;
  try {
    const pos = typeof getPos === "function" ? getPos() : -1;
    if (pos >= 0) {
      editor.state.doc.descendants((n: any, nodePos: number) => {
        if (n.type.name === "footnote" && nodePos < pos) num++;
        return true;
      });
    }
  } catch {
    num = 0;
  }

  const tooltip = node.attrs.pages
    ? `S. ${node.attrs.pages}`
    : node.attrs.text || "";

  return (
    <NodeViewWrapper as="span" style={{ display: "inline" }}>
      <sup
        style={{
          color: "var(--color-accent)",
          fontFamily: "var(--font-sans)",
          fontSize: "0.75em",
          lineHeight: 1,
          cursor: "default",
          userSelect: "none",
        }}
        title={tooltip}
      >
        {num > 0 ? `[${num}]` : "[?]"}
      </sup>
    </NodeViewWrapper>
  );
}

export const FootnoteExtension = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      sourceId: { default: null },
      text: { default: "" },
      pages: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'sup[data-type="footnote"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes, { "data-type": "footnote" }), ""];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteMarker);
  },
});
