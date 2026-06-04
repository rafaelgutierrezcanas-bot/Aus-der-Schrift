"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState, useRef } from "react";

export const ImageBlockExtension = Node.create({
  name: "imageBlock",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      sanityRef: { default: null },
      previewUrl: { default: null },
      alt: { default: "" },
      caption: { default: "" },
      layout: { default: "full" }, // "full" | "center" | "infographic"
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="imageBlock"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "imageBlock" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },
});

const LAYOUTS = [
  { value: "full", label: "Vollbreite" },
  { value: "center", label: "Zentriert" },
  { value: "infographic", label: "Infografik" },
];

function ImageBlockView({
  node,
  updateAttributes,
  deleteNode,
}: {
  node: any;
  updateAttributes: (attrs: any) => void;
  deleteNode: () => void;
}) {
  const { sanityRef, previewUrl, alt, caption, layout } = node.attrs;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(!sanityRef);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload fehlgeschlagen");
      const url = URL.createObjectURL(file);
      updateAttributes({ sanityRef: data.asset._ref, previewUrl: url });
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  // Empty state: file picker
  if (!sanityRef) {
    return (
      <NodeViewWrapper>
        <div
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="my-4 border-2 border-dashed border-stone-300 rounded-xl p-8 flex flex-col items-center gap-3 bg-stone-50 text-center cursor-pointer hover:border-stone-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-3xl">🖼</span>
          <p className="text-sm text-stone-500 font-medium">
            {uploading ? "Lädt hoch…" : "Bild hochladen — klicken oder hierher ziehen"}
          </p>
          <p className="text-xs text-stone-400">JPG, PNG, WebP · max. 10 MB</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </NodeViewWrapper>
    );
  }

  // Uploaded — show preview with metadata editing
  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="my-4 border-2 border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">🖼 Bild bearbeiten</p>
            <button onClick={deleteNode} className="text-xs text-red-400 hover:text-red-600 transition-colors">Löschen</button>
          </div>

          {previewUrl && (
            <img src={previewUrl} alt={alt} className="w-full rounded-lg object-contain max-h-64" />
          )}

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-blue-600 font-medium block mb-1">Alt-Text</label>
              <input
                value={alt}
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                placeholder="Bildbeschreibung für Screenreader"
                className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-blue-600 font-medium block mb-1">Layout</label>
              <select
                value={layout}
                onChange={(e) => updateAttributes({ layout: e.target.value })}
                className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
              >
                {LAYOUTS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-blue-600 font-medium block mb-1">Bildunterschrift (optional)</label>
            <input
              value={caption}
              onChange={(e) => updateAttributes({ caption: e.target.value })}
              placeholder="z. B. Quelle: Wikipedia"
              className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-3 py-1.5 rounded-lg bg-blue-700 text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              Fertig
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg border border-blue-300 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
            >
              Anderes Bild
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </NodeViewWrapper>
    );
  }

  // Compact preview
  const layoutLabel = LAYOUTS.find((l) => l.value === layout)?.label ?? layout;
  return (
    <NodeViewWrapper>
      <div
        className="my-4 group relative cursor-pointer"
        onClick={() => setEditing(true)}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={alt}
            className={`rounded-lg object-contain w-full ${
              layout === "infographic"
                ? "max-h-[520px] mx-auto"
                : layout === "center"
                ? "max-w-sm mx-auto"
                : ""
            }`}
          />
        ) : (
          <div className="h-24 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-sm">
            Bild (Vorschau nicht verfügbar)
          </div>
        )}
        {caption && (
          <p className="text-center text-xs text-stone-400 mt-1">{caption}</p>
        )}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <span className="bg-white/90 border border-stone-200 text-xs px-2 py-0.5 rounded shadow-sm text-stone-600">
            {layoutLabel} · Klicken zum Bearbeiten
          </span>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
