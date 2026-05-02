"use client";
import { Editor } from "@tiptap/react";

interface Props {
  editor: Editor;
}

export default function EditorToolbar({ editor }: Props) {
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

  const btn = (active: boolean) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${active ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`;

  return (
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
    </div>
  );
}
