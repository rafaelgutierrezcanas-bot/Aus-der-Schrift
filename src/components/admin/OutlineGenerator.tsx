"use client";
import { useState } from "react";
import type { Editor } from "@tiptap/react";
import type { EntwurfThema } from "./EntwurfSidebar";

interface OutlineSection {
  level: number;
  title: string;
  quoteIndices: number[];
  children?: OutlineSection[];
}

interface Props {
  editor: Editor | null;
  articleTitle: string;
  entwurf: EntwurfThema[];
}

export default function OutlineGenerator({ editor, articleTitle, entwurf }: Props) {
  const [sections, setSections] = useState<OutlineSection[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const allQuotes = entwurf.flatMap((t) =>
    t.zitate.map((z) => ({ ...z, themeName: t.thema }))
  );

  async function generateOutline() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: articleTitle,
          themes: entwurf.map((t) => ({ thema: t.thema, notiz: t.notiz })),
          quotes: allQuotes.map((q) => ({
            text: q.text,
            source: q.themeName,
          })),
        }),
      });
      const data = await res.json();
      if (data.sections) {
        setSections(data.sections);
        setShowPreview(true);
      }
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }

  function insertOutline() {
    if (!editor || !sections) return;

    // Convert outline to Tiptap JSON
    const content: any[] = [];

    function addSection(section: OutlineSection) {
      content.push({
        type: "heading",
        attrs: { level: section.level },
        content: [{ type: "text", text: section.title }],
      });
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: " " }],
      });
      if (section.children) {
        for (const child of section.children) {
          addSection(child);
        }
      }
    }

    for (const section of sections) {
      addSection(section);
    }

    editor.chain().focus().insertContent(content).run();
    setShowPreview(false);
    setSections(null);
  }

  return (
    <div className="px-4 py-3">
      <button
        onClick={generateOutline}
        disabled={loading || !articleTitle}
        className="w-full text-xs px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-background)] disabled:opacity-50 transition-colors"
      >
        {loading ? "Generiert..." : "Gliederung vorschlagen"}
      </button>

      {/* Preview Modal */}
      {showPreview && sections && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowPreview(false)}>
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200">
              <h3 className="text-sm font-medium text-stone-700">Vorgeschlagene Gliederung</h3>
              <button onClick={() => setShowPreview(false)} className="text-stone-400 hover:text-stone-600 text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
              {sections.map((section, i) => (
                <div key={i}>
                  <p className={`text-sm font-medium text-stone-700 ${section.level === 2 ? "mt-3" : "mt-1 pl-4"}`}>
                    {section.level === 2 ? "##" : "###"} {section.title}
                  </p>
                  {section.children?.map((child, j) => (
                    <p key={j} className="text-sm text-stone-500 pl-8 mt-0.5">
                      ### {child.title}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-stone-200">
              <button
                onClick={() => setShowPreview(false)}
                className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={insertOutline}
                className="text-xs px-4 py-1.5 rounded-lg bg-stone-800 text-white hover:bg-stone-900 transition-colors"
              >
                In Editor einfügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
