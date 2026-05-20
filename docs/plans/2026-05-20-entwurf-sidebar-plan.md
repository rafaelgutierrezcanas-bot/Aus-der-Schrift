# Entwurf-Sidebar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the localStorage-based ZitatBank with a persistent Entwurf sidebar that organizes quotes by theme with per-theme notes, saved to Sanity alongside the article.

**Architecture:** The sidebar lives inside `TiptapEditor` as a right-side column in a flex layout. It receives `entwurf` data and `onEntwurfChange` as props, so the article page controls persistence via auto-save. A toggle button in the editor toolbar shows/hides the sidebar.

**Tech Stack:** Next.js, React, Tiptap, Sanity (write client), Tailwind CSS, TypeScript

---

### Task 1: Add `entwurf` field to Sanity article schema

**Files:**
- Modify: `src/sanity/schemas/article.ts`

**Step 1: Add the field**

After the `sources` field (around line 87), add:

```typescript
defineField({
  name: "entwurf",
  title: "Entwurf",
  type: "array",
  of: [
    {
      type: "object",
      name: "entwurfThema",
      title: "Thema",
      fields: [
        { name: "thema", title: "Thema", type: "string" },
        { name: "notiz", title: "Notiz", type: "text" },
        {
          name: "zitate",
          title: "Zitate",
          type: "array",
          of: [
            {
              type: "object",
              name: "entwurfZitat",
              title: "Zitat",
              fields: [
                { name: "sourceId", title: "Quelle ID", type: "string" },
                { name: "pages", title: "Seite(n)", type: "string" },
                { name: "text", title: "Zitattext", type: "text" },
              ],
            },
          ],
        },
      ],
      preview: {
        select: { title: "thema" },
      },
    },
  ],
}),
```

**Step 2: Verify**

Run `npm run dev` and check the Sanity Studio still loads without errors. No migration needed — Sanity handles optional new fields automatically.

**Step 3: Commit**

```bash
git add src/sanity/schemas/article.ts
git commit -m "feat: add entwurf field to article schema"
```

---

### Task 2: Update API GET to include entwurf

**Files:**
- Modify: `src/app/api/admin/articles/[slug]/route.ts`

**Step 1: Add `entwurf` to the GROQ projection**

In the `GET` handler, the query currently ends with:
```
"sources": sources[]->{ _id, title, authors, year, type }
```

Change it to:
```
"sources": sources[]->{ _id, title, authors, year, type, publisher, pages, url },
entwurf
```

Full updated query string:
```typescript
const article = await client.fetch(`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    language,
    status,
    excerptDe,
    excerptEn,
    featuredImage,
    bodyDe,
    bodyEn,
    "category": category->{ _id, titleDe, slug },
    "author": author->{ _id, name },
    "project": project->{ _id, title },
    "sources": sources[]->{ _id, title, authors, year, type, publisher, pages, url },
    entwurf
  }
`, { slug });
```

Note: The PATCH route already handles arbitrary fields generically (it sets any key from the request body), so no changes needed there.

**Step 2: Commit**

```bash
git add src/app/api/admin/articles/[slug]/route.ts
git commit -m "feat: include entwurf and full source fields in article GET"
```

---

### Task 3: Create EntwurfSidebar component

**Files:**
- Create: `src/components/admin/EntwurfSidebar.tsx`

**Step 1: Write the component**

```tsx
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
      className="w-72 shrink-0 border-l border-stone-200 flex flex-col overflow-y-auto max-h-[700px]"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-widest">Entwurf</span>
        {entwurf.length > 0 && (
          <span className="text-xs bg-stone-100 text-stone-400 rounded-full px-2 py-0.5">
            {entwurf.length} Themen
          </span>
        )}
      </div>

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
```

**Step 2: Commit**

```bash
git add src/components/admin/EntwurfSidebar.tsx
git commit -m "feat: add EntwurfSidebar component with Sanity-backed persistence"
```

---

### Task 4: Update EditorToolbar — add Entwurf toggle button

**Files:**
- Modify: `src/components/admin/EditorToolbar.tsx`

**Step 1: Add props**

Add to the `Props` interface:
```typescript
showEntwurf?: boolean;
onToggleEntwurf?: () => void;
```

**Step 2: Add button in toolbar**

After the Lektorat button section (around line 140), add:
```tsx
{onToggleEntwurf && (
  <>
    <div className="w-px bg-stone-200 mx-1" />
    <button
      onClick={onToggleEntwurf}
      title="Entwurf-Sidebar ein-/ausblenden"
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors border ${
        showEntwurf
          ? "bg-stone-800 text-white border-stone-800"
          : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
      }`}
    >
      ✎ Entwurf
    </button>
  </>
)}
```

**Step 3: Commit**

```bash
git add src/components/admin/EditorToolbar.tsx
git commit -m "feat: add Entwurf toggle button to EditorToolbar"
```

---

### Task 5: Update TiptapEditor — replace ZitatBank with EntwurfSidebar

**Files:**
- Modify: `src/components/admin/TiptapEditor.tsx`

**Step 1: Update imports and props**

Replace:
```typescript
import ZitatBank from "./ZitatBank";
```
With:
```typescript
import EntwurfSidebar, { type EntwurfThema } from "./EntwurfSidebar";
export type { EntwurfThema } from "./EntwurfSidebar";
```

Update the `Props` interface — remove `zitatBankKey` and add:
```typescript
entwurf?: EntwurfThema[];
onEntwurfChange?: (entwurf: EntwurfThema[]) => void;
```

**Step 2: Add showEntwurf state**

Inside the component, add:
```typescript
const [showEntwurf, setShowEntwurf] = useState(false);
```

**Step 3: Update EditorToolbar props**

```tsx
<EditorToolbar
  editor={editor}
  sources={sources}
  onLektorat={runLektorat}
  lektoratLoading={lektoratLoading}
  showEntwurf={showEntwurf}
  onToggleEntwurf={onEntwurfChange ? () => setShowEntwurf((v) => !v) : undefined}
/>
```

**Step 4: Wrap editor content + sidebar in flex row**

Replace:
```tsx
<EditorContent editor={editor} />
```
With:
```tsx
<div className="flex">
  <div className="flex-1 min-w-0">
    <EditorContent editor={editor} />
  </div>
  {showEntwurf && onEntwurfChange && entwurf !== undefined && (
    <EntwurfSidebar
      editor={editor}
      sources={sources}
      entwurf={entwurf}
      onChange={onEntwurfChange}
    />
  )}
</div>
```

**Step 5: Remove ZitatBank usage**

Remove the ZitatBank block at the bottom:
```tsx
{/* Remove this entire block: */}
{zitatBankKey && (
  <ZitatBank editor={editor} sources={sources} storageKey={zitatBankKey} />
)}
```

**Step 6: Update function signature**

```typescript
export default function TiptapEditor({
  content,
  onChange,
  placeholder,
  sources = [],
  entwurf,
  onEntwurfChange,
}: Props)
```

**Step 7: Commit**

```bash
git add src/components/admin/TiptapEditor.tsx
git commit -m "feat: replace ZitatBank with EntwurfSidebar in TiptapEditor"
```

---

### Task 6: Update article page — wire entwurf state

**Files:**
- Modify: `src/app/admin/[slug]/page.tsx`

**Step 1: Add import**

Add to imports:
```typescript
import type { EntwurfThema } from "@/components/admin/EntwurfSidebar";
```

Wait — TiptapEditor re-exports `EntwurfThema`. Import from there:
```typescript
import type { EntwurfThema } from "@/components/admin/TiptapEditor";
```

**Step 2: Add state**

After the `bodyEn` state line:
```typescript
const [entwurf, setEntwurf] = useState<EntwurfThema[]>([]);
```

**Step 3: Load entwurf from API response**

In the `useEffect` fetch handler, after `setFeaturedImage`:
```typescript
setEntwurf(article.entwurf ?? []);
```

**Step 4: Include entwurf in buildPatch**

In the `buildPatch` callback, add to the `patch` object:
```typescript
entwurf: entwurf.length > 0 ? entwurf : null,
```

Also add `entwurf` to the `useCallback` dependency array.

**Step 5: Add entwurf to auto-save dependency array**

The auto-save `useEffect` dependency array (line ~123) needs `entwurf` added.

**Step 6: Update TiptapEditor usage — remove zitatBankKey, add entwurf props**

Find the TiptapEditor JSX for German body (and English body if present). Remove `zitatBankKey={...}` prop and add:
```tsx
entwurf={entwurf}
onEntwurfChange={setEntwurf}
```

Only one of the two editors (DE or EN) should own the entwurf sidebar, since entwurf is article-level data. Pass it to the DE editor (or whichever is shown first). Pass nothing to the EN editor.

**Step 7: Commit**

```bash
git add src/app/admin/[slug]/page.tsx
git commit -m "feat: wire entwurf state in article edit page"
```

---

### Task 7: Delete ZitatBank

**Files:**
- Delete: `src/components/admin/ZitatBank.tsx`

**Step 1: Delete the file**

```bash
git rm src/components/admin/ZitatBank.tsx
```

**Step 2: Verify no remaining imports**

```bash
grep -r "ZitatBank" src/
```

Should return no results.

**Step 3: Commit**

```bash
git commit -m "chore: remove ZitatBank (replaced by EntwurfSidebar)"
```

---

### Task 8: Verify everything works

**Step 1: Start dev server**

```bash
npm run dev
```

**Step 2: Manual verification checklist**

- [ ] Open an article in `/admin/[slug]`
- [ ] Click "✎ Entwurf" in the toolbar — sidebar appears on the right
- [ ] Add a theme — appears in sidebar
- [ ] Add a note to the theme — textarea works
- [ ] Add a quote with source + pages — card appears
- [ ] Hover quote card → "→ Editor" button appears → click inserts blockquote into editor
- [ ] Collapse/expand themes with ▶/▼
- [ ] Delete a quote, delete a theme
- [ ] Wait 2 seconds → "Auto-saved" indicator appears
- [ ] Reload page → entwurf data persists from Sanity

**Step 3: Final commit and push**

```bash
git push
```
