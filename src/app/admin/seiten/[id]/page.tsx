"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

type Lang = "de" | "en";

export default function EditPagePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeLang, setActiveLang] = useState<Lang>("de");

  // Store Portable Text bodies
  const [bodyDe, setBodyDe] = useState<unknown[] | null>(null);
  const [bodyEn, setBodyEn] = useState<unknown[] | null>(null);

  const editorDe = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Seiteninhalt (DE)..." }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 outline-none text-[var(--color-foreground)]",
        style: "font-family: var(--font-body-serif)",
      },
    },
    onUpdate({ editor }) {
      setBodyDe(tiptapToPortableText(editor.getJSON()));
      setSaved(false);
    },
  });

  const editorEn = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Page content (EN)..." }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[300px] px-4 py-3 outline-none text-[var(--color-foreground)]",
        style: "font-family: var(--font-body-serif)",
      },
    },
    onUpdate({ editor }) {
      setBodyEn(tiptapToPortableText(editor.getJSON()));
      setSaved(false);
    },
  });

  useEffect(() => {
    fetch(`/api/admin/pages/${id}`)
      .then((r) => r.json())
      .then((page) => {
        setTitleDe(page.titleDe ?? "");
        setTitleEn(page.titleEn ?? "");
        setSlug(page.slug ?? "");
        if (page.bodyDe && editorDe) {
          const tiptap = portableTextToTiptap(page.bodyDe);
          editorDe.commands.setContent(tiptap as Parameters<typeof editorDe.commands.setContent>[0]);
          setBodyDe(page.bodyDe);
        }
        if (page.bodyEn && editorEn) {
          const tiptap = portableTextToTiptap(page.bodyEn);
          editorEn.commands.setContent(tiptap as Parameters<typeof editorEn.commands.setContent>[0]);
          setBodyEn(page.bodyEn);
        }
        setLoading(false);
      });
  }, [id, editorDe, editorEn]);

  const save = useCallback(async () => {
    setSaving(true);
    await fetch(`/api/admin/pages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleDe: titleDe.trim(),
        titleEn: titleEn.trim(),
        bodyDe,
        bodyEn,
      }),
    });
    setSaving(false);
    setSaved(true);
  }, [id, titleDe, titleEn, bodyDe, bodyEn]);

  if (loading)
    return (
      <p
        className="text-sm text-[var(--color-muted)]"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Lädt...
      </p>
    );

  const activeEditor = activeLang === "de" ? editorDe : editorEn;

  return (
    <div className="max-w-3xl" style={{ fontFamily: "var(--font-sans)" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">
            Seite bearbeiten
          </h1>
          <p className="text-xs text-[var(--color-muted)] mt-1">/{slug}</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-xs text-green-600">Gespeichert</span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button
            onClick={() => router.push("/admin/seiten")}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Zurück
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Titel (DE)
            </label>
            <input
              type="text"
              value={titleDe}
              onChange={(e) => {
                setTitleDe(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">
              Title (EN)
            </label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => {
                setTitleEn(e.target.value);
                setSaved(false);
              }}
              className={inputClass}
            />
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {(["de", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
                activeLang === lang
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] font-medium"
                  : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {lang === "de" ? "Inhalt (DE)" : "Content (EN)"}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/40 overflow-hidden">
          {/* Mini toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <ToolbarButton
              label="B"
              active={activeEditor?.isActive("bold") ?? false}
              onClick={() => activeEditor?.chain().focus().toggleBold().run()}
              bold
            />
            <ToolbarButton
              label="I"
              active={activeEditor?.isActive("italic") ?? false}
              onClick={() => activeEditor?.chain().focus().toggleItalic().run()}
              italic
            />
            <span className="w-px h-4 bg-[var(--color-border)] mx-1" />
            <ToolbarButton
              label="H2"
              active={activeEditor?.isActive("heading", { level: 2 }) ?? false}
              onClick={() =>
                activeEditor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: 2 })
                  .run()
              }
            />
            <ToolbarButton
              label="H3"
              active={activeEditor?.isActive("heading", { level: 3 }) ?? false}
              onClick={() =>
                activeEditor
                  ?.chain()
                  .focus()
                  .toggleHeading({ level: 3 })
                  .run()
              }
            />
            <span className="w-px h-4 bg-[var(--color-border)] mx-1" />
            <ToolbarButton
              label="•"
              active={activeEditor?.isActive("bulletList") ?? false}
              onClick={() =>
                activeEditor?.chain().focus().toggleBulletList().run()
              }
            />
            <ToolbarButton
              label="1."
              active={activeEditor?.isActive("orderedList") ?? false}
              onClick={() =>
                activeEditor?.chain().focus().toggleOrderedList().run()
              }
            />
            <ToolbarButton
              label="❝"
              active={activeEditor?.isActive("blockquote") ?? false}
              onClick={() =>
                activeEditor?.chain().focus().toggleBlockquote().run()
              }
            />
          </div>

          {/* DE editor (shown/hidden) */}
          <div className={activeLang === "de" ? "" : "hidden"}>
            <EditorContent editor={editorDe} />
          </div>
          <div className={activeLang === "en" ? "" : "hidden"}>
            <EditorContent editor={editorEn} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  onClick,
  bold,
  italic,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs transition-colors ${
        active
          ? "bg-[var(--color-accent)] text-white"
          : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
      } ${bold ? "font-bold" : ""} ${italic ? "italic" : ""}`}
    >
      {label}
    </button>
  );
}
