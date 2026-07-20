"use client";
import { useState } from "react";
import { Editor } from "@tiptap/react";
import type { Source } from "@/lib/formatChicago";
import { formatChicago } from "@/lib/formatChicago";

export interface EntwurfZitat {
  _key: string;
  sourceId: string | null;
  pages: string;
  text: string;
}

export interface EntwurfThema {
  _key: string;
  thema: string;
  notiz: string;
  zitate: EntwurfZitat[];
}

interface Props {
  editor: Editor;
  sources: Source[];
  entwurf: EntwurfThema[];
  onChange: (entwurf: EntwurfThema[]) => void;
}

function mkKey() {
  return crypto.randomUUID().slice(0, 8);
}

export default function EntwurfSidebar({ editor, sources, entwurf, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addingQuoteTo, setAddingQuoteTo] = useState<string | null>(null);
  const [newQuote, setNewQuote] = useState({ sourceId: "", pages: "", text: "" });
  const [addingThema, setAddingThema] = useState(false);
  const [newThemaName, setNewThemaName] = useState("");

  const inputClass =
    "w-full border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-700 bg-white focus:outline-none focus:border-stone-400 transition-colors";

  function updateThema(key: string, patch: Partial<EntwurfThema>) {
    onChange(entwurf.map((t) => (t._key === key ? { ...t, ...patch } : t)));
  }

  function deleteThema(key: string) {
    if (!confirm("Thema und alle Zitate löschen?")) return;
    onChange(entwurf.filter((t) => t._key !== key));
  }

  function addThema() {
    const name = newThemaName.trim();
    if (!name) return;
    onChange([...entwurf, { _key: mkKey(), thema: name, notiz: "", zitate: [] }]);
    setNewThemaName("");
    setAddingThema(false);
  }

  function deleteZitat(themaKey: string, zitatKey: string) {
    onChange(
      entwurf.map((t) =>
        t._key === themaKey
          ? { ...t, zitate: t.zitate.filter((z) => z._key !== zitatKey) }
          : t
      )
    );
  }

  function addZitat(themaKey: string) {
    if (!newQuote.text.trim()) return;
    const zitat: EntwurfZitat = {
      _key: mkKey(),
      sourceId: newQuote.sourceId || null,
      pages: newQuote.pages.trim(),
      text: newQuote.text.trim(),
    };
    onChange(
      entwurf.map((t) =>
        t._key === themaKey ? { ...t, zitate: [...t.zitate, zitat] } : t
      )
    );
    setNewQuote({ sourceId: "", pages: "", text: "" });
    setAddingQuoteTo(null);
  }

  function insertZitat(zitat: EntwurfZitat) {
    const src = zitat.sourceId ? sources.find((s) => s._id === zitat.sourceId) : null;
    const attribution = src
      ? formatChicago(src, zitat.pages)
      : zitat.pages
      ? `S. ${zitat.pages}`
      : null;

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "blockquote",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: `„${zitat.text}"` }],
            },
            ...(attribution
              ? [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", marks: [{ type: "italic" }], text: `— ${attribution}` },
                    ],
                  },
                ]
              : []),
          ],
        },
      ])
      .run();
  }

  return (
    <div
      className="w-full flex flex-col overflow-y-auto"
      style={{ fontFamily: "var(--font-sans)" }}
    >

      {/* Themes */}
      <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
        {entwurf.length === 0 && (
          <p className="text-xs text-stone-400 italic px-4 py-4">
            Noch keine Themen. Füge ein Thema hinzu.
          </p>
        )}

        {entwurf.map((thema) => {
          const isCollapsed = collapsed[thema._key];
          return (
            <div key={thema._key} className="px-4 py-3 space-y-2">
              {/* Theme header */}
              <div className="flex items-center gap-1.5 group">
                <button
                  onClick={() => setCollapsed((c) => ({ ...c, [thema._key]: !c[thema._key] }))}
                  className="text-stone-400 text-xs w-3 shrink-0"
                >
                  {isCollapsed ? "▶" : "▼"}
                </button>
                <input
                  value={thema.thema}
                  onChange={(e) => updateThema(thema._key, { thema: e.target.value })}
                  className="flex-1 text-sm font-medium text-stone-700 bg-transparent focus:outline-none focus:bg-stone-50 rounded px-1 -mx-1"
                  placeholder="Thema…"
                />
                <button
                  onClick={() => deleteThema(thema._key)}
                  className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 text-xs transition-all"
                  title="Thema löschen"
                >
                  ×
                </button>
              </div>

              {!isCollapsed && (
                <>
                  {/* Notes */}
                  <textarea
                    value={thema.notiz}
                    onChange={(e) => updateThema(thema._key, { notiz: e.target.value })}
                    placeholder="Notizen zu diesem Thema…"
                    rows={2}
                    className="w-full text-xs text-stone-600 bg-stone-50 border border-stone-100 rounded-lg px-2.5 py-2 focus:outline-none focus:border-stone-300 resize-none transition-colors"
                  />

                  {/* Quotes */}
                  <div className="space-y-1.5">
                    {thema.zitate.map((z) => {
                      const src = z.sourceId ? sources.find((s) => s._id === z.sourceId) : null;
                      return (
                        <div
                          key={z._key}
                          className="group bg-white border border-stone-100 rounded-lg px-3 py-2.5 hover:border-stone-200 transition-colors"
                        >
                          <p className="text-xs text-stone-700 leading-snug">„{z.text}"</p>
                          {(src || z.pages) && (
                            <p className="text-xs text-stone-400 mt-1 italic">
                              {src
                                ? `${src.authors} (${src.year})${z.pages ? `, S. ${z.pages}` : ""}`
                                : `S. ${z.pages}`}
                            </p>
                          )}
                          <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => insertZitat(z)}
                              className="text-xs px-2 py-1 bg-stone-800 text-white rounded-md hover:opacity-80 transition-opacity"
                            >
                              → Editor
                            </button>
                            <button
                              onClick={() => deleteZitat(thema._key, z._key)}
                              className="text-xs text-stone-300 hover:text-red-400 transition-colors"
                            >
                              Löschen
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add quote */}
                  {addingQuoteTo === thema._key ? (
                    <div className="border border-stone-200 rounded-lg p-3 space-y-2 bg-stone-50">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-stone-400 mb-1">Quelle</label>
                          <select
                            value={newQuote.sourceId}
                            onChange={(e) => setNewQuote((q) => ({ ...q, sourceId: e.target.value }))}
                            className={inputClass}
                          >
                            <option value="">— kein —</option>
                            {sources.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.authors} ({s.year})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-stone-400 mb-1">Seite(n)</label>
                          <input
                            type="text"
                            placeholder="z. B. 45"
                            value={newQuote.pages}
                            onChange={(e) => setNewQuote((q) => ({ ...q, pages: e.target.value }))}
                            className={inputClass}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-stone-400 mb-1">Zitat *</label>
                        <textarea
                          autoFocus
                          rows={3}
                          placeholder="Zitattext…"
                          value={newQuote.text}
                          onChange={(e) => setNewQuote((q) => ({ ...q, text: e.target.value }))}
                          className={inputClass + " resize-none"}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addZitat(thema._key);
                          }}
                        />
                        <p className="text-xs text-stone-400 mt-0.5">⌘↵ zum Speichern</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addZitat(thema._key)}
                          className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Speichern
                        </button>
                        <button
                          onClick={() => { setAddingQuoteTo(null); setNewQuote({ sourceId: "", pages: "", text: "" }); }}
                          className="px-3 py-1.5 border border-stone-200 text-stone-500 text-xs rounded-lg hover:border-stone-300 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setAddingQuoteTo(thema._key); setNewQuote({ sourceId: "", pages: "", text: "" }); }}
                      className="text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-50 px-2 py-1 rounded transition-colors border border-dashed border-stone-200 w-full text-left"
                    >
                      + Zitat hinzufügen
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Add theme */}
      <div className="border-t border-stone-100 px-4 py-3">
        {addingThema ? (
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={newThemaName}
              onChange={(e) => setNewThemaName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addThema();
                if (e.key === "Escape") setAddingThema(false);
              }}
              placeholder="Thema…"
              className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-stone-400"
            />
            <button onClick={addThema} className="text-xs text-stone-500 hover:text-stone-800 px-1">✓</button>
            <button onClick={() => setAddingThema(false)} className="text-xs text-stone-400 hover:text-stone-600 px-1">✕</button>
          </div>
        ) : (
          <button
            onClick={() => setAddingThema(true)}
            className="text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-50 px-2 py-1.5 rounded transition-colors border border-dashed border-stone-200 w-full text-left"
          >
            + Thema hinzufügen
          </button>
        )}
      </div>
    </div>
  );
}
