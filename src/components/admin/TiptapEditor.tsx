"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "./EditorToolbar";
import { BibleVerseExtension } from "./BibleVerseBlock";

interface Props {
  content: object | null;
  onChange: (json: object) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BibleVerseExtension,
      Placeholder.configure({ placeholder: placeholder ?? "Schreibe hier..." }),
    ],
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

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
