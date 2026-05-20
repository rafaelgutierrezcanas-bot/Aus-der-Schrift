# Entwurf-Sidebar — Design

**Date:** 2026-05-20

## Overview

A persistent sidebar for pre-writing research: organize quotes by theme, add notes per theme, and insert quotes into the article editor. Replaces the existing ZitatBank (localStorage).

## Data Model

New `entwurf` field in the Sanity article schema — an array of theme objects:

```ts
entwurf: [
  {
    _key: string,
    thema: string,           // theme title
    notiz: string,           // free-text notes for this theme
    zitate: [
      {
        _key: string,
        sourceId: string | null,  // reference to a Source document
        pages: string,            // e.g. "45" or "45-47"
        text: string,             // quote text
      }
    ]
  }
]
```

Saved via the existing auto-save (2-second debounce) — no extra save action needed.

## UX

A collapsible sidebar to the right of the editor (same pattern as old ZitatBank).

- Themes are expandable/collapsible sections
- Each theme has an inline-editable title and a notes textarea below it
- Quotes are cards under each theme: source + page + text + "Insert" button
- "Insert" inserts a formatted blockquote with Chicago citation into the editor
- "Add theme" button at the bottom
- "Add quote" button at the bottom of each theme section
- Delete buttons (×) for themes and individual quotes

## Technical Approach

- **Option A selected:** Linear expandable sections (simplest, most writer-friendly)
- **Location:** Sidebar to the right of the TiptapEditor, toggle button in toolbar or above editor
- **Persistence:** Sanity via existing article save flow
- **Replaces:** ZitatBank component (localStorage) — removed entirely

## Files to Change

1. `src/sanity/schemas/article.ts` — add `entwurf` array field
2. `src/components/admin/EntwurfSidebar.tsx` — new component (replaces ZitatBank)
3. `src/components/admin/TiptapEditor.tsx` — remove ZitatBank, add EntwurfSidebar
4. `src/app/admin/[slug]/page.tsx` — pass entwurf data + onChange handler
5. `src/app/api/admin/articles/[slug]/route.ts` — ensure entwurf field is included in save/load
6. `src/components/admin/ZitatBank.tsx` — deleted
