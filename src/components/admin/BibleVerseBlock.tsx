"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";

export const BibleVerseExtension = Node.create({
  name: "bibleVerse",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      reference: { default: "" },
      text: { default: "" },
      translation: { default: "LUT" },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="bibleVerse"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "bibleVerse" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BibleVerseView);
  },
});

function BibleVerseView({ node, updateAttributes }: { node: any; updateAttributes: (attrs: any) => void }) {
  const [editing, setEditing] = useState(false);
  const { reference, text, translation } = node.attrs;

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="border-2 border-amber-300 rounded-xl p-4 bg-amber-50 space-y-2 my-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">📖 Bibelvers bearbeiten</p>
          <input
            placeholder="Referenz (z.B. Joh 1,1)"
            value={reference}
            onChange={(e) => updateAttributes({ reference: e.target.value })}
            className="w-full border border-amber-200 rounded px-3 py-1.5 text-sm"
          />
          <textarea
            placeholder="Vers-Text..."
            value={text}
            onChange={(e) => updateAttributes({ text: e.target.value })}
            rows={3}
            className="w-full border border-amber-200 rounded px-3 py-1.5 text-sm"
          />
          <input
            placeholder="Übersetzung (z.B. LUT, ESV)"
            value={translation}
            onChange={(e) => updateAttributes({ translation: e.target.value })}
            className="w-full border border-amber-200 rounded px-3 py-1.5 text-sm"
          />
          <button onClick={() => setEditing(false)} className="text-xs text-amber-700 underline">
            Fertig
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        onClick={() => setEditing(true)}
        className="border-l-4 border-amber-400 pl-4 my-4 cursor-pointer hover:bg-amber-50 rounded-r-lg py-2"
      >
        <p className="text-sm font-semibold text-amber-700">{reference || "Referenz..."}</p>
        <p className="text-stone-700 italic">{text || "Vers-Text..."}</p>
        <p className="text-xs text-stone-400 mt-1">{translation}</p>
      </div>
    </NodeViewWrapper>
  );
}
