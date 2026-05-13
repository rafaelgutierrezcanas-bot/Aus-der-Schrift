"use client";
import { useState, useEffect } from "react";
import { Editor } from "@tiptap/react";
import type { Source } from "./TiptapEditor";
import { formatChicago } from "./TiptapEditor";

interface Quote {
  id: string;
  sourceId: string | null;
  page: string;
  topic: string;
  text: string;
}

interface Props {
  editor: Editor;
  sources: Source[];
  storageKey: string;
}

const ALL_TOPICS = "__alle__";

export default function ZitatBank({ editor, sources, storageKey }: Props) {
  const [open, setOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [activeTopic, setActiveTopic] = useState<string>(ALL_TOPICS);

  // Persist to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        setQuotes(data.quotes ?? []);
        setTopics(data.topics ?? []);
      }
    } catch {}
  }, [storageKey]);

  function persist(newQuotes: Quote[], newTopics: string[]) {
    localStorage.setItem(storageKey, JSON.stringify({ quotes: newQuotes, topics: newTopics }));
    setQuotes(newQuotes);
    setTopics(newTopics);
  }

  // Add topic form
  const [addingTopic, setAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");

  function addTopic() {
    const name = newTopicName.trim();
    if (!name || topics.includes(name)) return;
    const next = [...topics, name];
    persist(quotes, next);
    setActiveTopic(name);
    setNewTopicName("");
    setAddingTopic(false);
  }

  function deleteTopic(topic: string) {
    if (!confirm(`Thema "${topic}" und alle zugehörigen Zitate löschen?`)) return;
    const nextQuotes = quotes.filter((q) => q.topic !== topic);
    const nextTopics = topics.filter((t) => t !== topic);
    persist(nextQuotes, nextTopics);
    if (activeTopic === topic) setActiveTopic(ALL_TOPICS);
  }

  // Add quote form
  const [addingQuote, setAddingQuote] = useState(false);
  const [newQuote, setNewQuote] = useState({ sourceId: "", page: "", text: "", topic: "" });

  function addQuote() {
    if (!newQuote.text.trim()) return;
    const topic =
      activeTopic === ALL_TOPICS
        ? (newQuote.topic || topics[0] || "Allgemein")
        : activeTopic;
    const entry: Quote = {
      id: crypto.randomUUID(),
      sourceId: newQuote.sourceId || null,
      page: newQuote.page.trim(),
      topic,
      text: newQuote.text.trim(),
    };
    const nextTopics = topics.includes(topic) ? topics : [...topics, topic];
    persist([...quotes, entry], nextTopics);
    setNewQuote({ sourceId: "", page: "", text: "", topic: "" });
    setAddingQuote(false);
  }

  function deleteQuote(id: string) {
    persist(quotes.filter((q) => q.id !== id), topics);
  }

  function insertQuote(quote: Quote) {
    const src = quote.sourceId ? sources.find((s) => s._id === quote.sourceId) : null;
    const attribution = src
      ? formatChicago(src, quote.page)
      : quote.page
      ? `S. ${quote.page}`
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
              content: [{ type: "text", text: `„${quote.text}"` }],
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

  const visibleQuotes =
    activeTopic === ALL_TOPICS ? quotes : quotes.filter((q) => q.topic === activeTopic);

  const inputClass =
    "w-full border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:border-stone-400 transition-colors";

  return (
    <div
      className="border-t border-stone-200"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-stone-600">
          <span>📚</span>
          <span>Zitate-Bank</span>
          {quotes.length > 0 && (
            <span className="text-xs bg-stone-200 text-stone-500 rounded-full px-2 py-0.5 font-normal">
              {quotes.length}
            </span>
          )}
        </span>
        <span className="text-stone-400 text-xs">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="border-t border-stone-100 px-5 py-4 space-y-4">

          {/* Topic tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTopic(ALL_TOPICS)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTopic === ALL_TOPICS
                  ? "bg-stone-800 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Alle ({quotes.length})
            </button>
            {topics.map((t) => (
              <div key={t} className="flex items-center gap-0.5 group">
                <button
                  onClick={() => setActiveTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeTopic === t
                      ? "bg-stone-800 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {t} ({quotes.filter((q) => q.topic === t).length})
                </button>
                <button
                  onClick={() => deleteTopic(t)}
                  className="hidden group-hover:flex text-stone-300 hover:text-red-400 text-xs px-1 transition-colors"
                  title="Thema löschen"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Add topic */}
            {addingTopic ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTopic();
                    if (e.key === "Escape") setAddingTopic(false);
                  }}
                  placeholder="Thema…"
                  className="border border-stone-200 rounded-full px-3 py-1 text-xs focus:outline-none focus:border-stone-400 w-32"
                />
                <button onClick={addTopic} className="text-xs text-stone-500 hover:text-stone-800">✓</button>
                <button onClick={() => setAddingTopic(false)} className="text-xs text-stone-400 hover:text-stone-600">✕</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingTopic(true)}
                className="px-3 py-1 rounded-full text-xs text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors border border-dashed border-stone-300"
              >
                + Thema
              </button>
            )}
          </div>

          {/* Quote list */}
          {visibleQuotes.length === 0 && !addingQuote && (
            <p className="text-xs text-stone-400 italic">
              {topics.length === 0
                ? "Erstelle ein Thema und sammle Zitate für deinen Artikel."
                : "Noch keine Zitate für dieses Thema."}
            </p>
          )}

          <div className="space-y-2">
            {visibleQuotes.map((q) => {
              const src = q.sourceId ? sources.find((s) => s._id === q.sourceId) : null;
              return (
                <div
                  key={q.id}
                  className="group flex gap-3 bg-stone-50 border border-stone-100 rounded-xl px-4 py-3 hover:border-stone-200 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 leading-snug">„{q.text}"</p>
                    {(src || q.page) && (
                      <p className="text-xs text-stone-400 mt-1 italic">
                        {src
                          ? `${src.authors} (${src.year})${q.page ? `, S. ${q.page}` : ""}`
                          : q.page
                          ? `S. ${q.page}`
                          : ""}
                      </p>
                    )}
                    {activeTopic === ALL_TOPICS && (
                      <span className="inline-block mt-1 text-xs bg-stone-200 text-stone-500 rounded-full px-2 py-0.5">
                        {q.topic}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => insertQuote(q)}
                      className="px-2.5 py-1 bg-stone-800 text-white text-xs rounded-lg hover:opacity-80 transition-opacity whitespace-nowrap"
                      title="In Editor einfügen"
                    >
                      → Editor
                    </button>
                    <button
                      onClick={() => deleteQuote(q.id)}
                      className="px-2.5 py-1 text-stone-300 hover:text-red-400 text-xs transition-colors text-center"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add quote form */}
          {addingQuote ? (
            <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Quelle</label>
                  <select
                    value={newQuote.sourceId}
                    onChange={(e) => setNewQuote((q) => ({ ...q, sourceId: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">— Freier Text —</option>
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
                    placeholder="z. B. 143 oder 143–145"
                    value={newQuote.page}
                    onChange={(e) => setNewQuote((q) => ({ ...q, page: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-stone-400 mb-1">Zitat *</label>
                <textarea
                  autoFocus
                  rows={3}
                  placeholder="Zitat oder Paraphrase eintragen…"
                  value={newQuote.text}
                  onChange={(e) => setNewQuote((q) => ({ ...q, text: e.target.value }))}
                  className={inputClass + " resize-none"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) addQuote();
                  }}
                />
                <p className="text-xs text-stone-400 mt-1">⌘↵ zum Speichern</p>
              </div>
              {activeTopic === ALL_TOPICS && topics.length > 0 && (
                <div>
                  <label className="block text-xs text-stone-400 mb-1">Thema</label>
                  <select
                    value={newQuote.topic || topics[0]}
                    onChange={(e) => setNewQuote((q) => ({ ...q, topic: e.target.value }))}
                    className={inputClass}
                  >
                    {topics.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={addQuote}
                  className="px-4 py-1.5 bg-stone-800 text-white text-sm rounded-lg hover:opacity-90 transition-opacity"
                >
                  Speichern
                </button>
                <button
                  onClick={() => { setAddingQuote(false); setNewQuote({ sourceId: "", page: "", text: "", topic: "" }); }}
                  className="px-4 py-1.5 border border-stone-200 text-stone-500 text-sm rounded-lg hover:border-stone-300 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (topics.length === 0) { setAddingTopic(true); return; }
                setAddingQuote(true);
              }}
              className="text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors border border-dashed border-stone-200"
            >
              + Zitat hinzufügen
              {activeTopic !== ALL_TOPICS && ` zu „${activeTopic}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
