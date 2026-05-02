# Custom Admin Editor — Design Document

**Date:** 2026-05-02
**Project:** aus-der-schrift
**Status:** Approved

## Overview

A custom WYSIWYG blog editor built into the existing Next.js project under `/admin`. Replaces Sanity Studio as the primary writing interface while keeping Sanity as the backend (data storage, CDN, image optimization). Built with TipTap editor and protected by a simple password middleware.

---

## Architecture

```
aus-der-schrift/
├── src/app/
│   ├── admin/
│   │   ├── page.tsx                  ← Dashboard: list all articles
│   │   ├── neu/page.tsx              ← Create new article
│   │   └── [slug]/page.tsx           ← Edit existing article
│   └── api/
│       ├── admin/articles/
│       │   ├── route.ts              ← GET all / POST new article
│       │   └── [slug]/route.ts       ← GET one / PATCH / DELETE
│       └── admin/upload/route.ts     ← Upload images to Sanity CDN
├── middleware.ts                      ← Password protection for /admin
```

---

## Auth

- `middleware.ts` intercepts all `/admin` routes
- Single password stored in `.env.local` as `ADMIN_PASSWORD`
- Session stored as signed cookie after login
- No external auth library needed

---

## Editor UI

### Dashboard (`/admin`)
- List all articles with title, date, language, and publish status
- "Neuer Artikel" button
- Click article → opens editor

### Editor (`/admin/neu`, `/admin/[slug]`)

```
┌─────────────────────────────────────────────┐
│  [← Zurück]         [Speichern] [Publizieren]│
├─────────────────────────────────────────────┤
│  Titel (DE) ___________________________      │
│  Titel (EN) ___________________________      │
│  Slug: _____  Kategorie: ▼  Sprache: ▼       │
│  Datum: ___  Vorschautext: _______________   │
├─────────────────────────────────────────────┤
│  [B] [I] [H2] [H3] [Bild] [＋Block ▼]        │
├─────────────────────────────────────────────┤
│                                             │
│   Schreibe hier...                          │
│                                             │
└─────────────────────────────────────────────┘
```

**Metadata fields:**
- Titel (DE), Titel (EN)
- Slug (auto-generated from DE title, editable)
- Kategorie (dropdown from Sanity categories)
- Sprache (de / en / both)
- Veröffentlicht am (date picker)
- Vorschautext DE + EN (textarea)
- Titelbild (image upload)

---

## Custom Blocks

All accessible via the "+ Block" dropdown in the toolbar:

| Block | Icon | Sanity Mapping |
|-------|------|----------------|
| Bibelvers | 📖 | `bibleVerse` object with `reference`, `text`, `translation` |
| Erklärung | 📌 | Blockquote with `📌` prefix |
| Frage | ❓ | Blockquote with `❓` prefix |
| Fußnote | ¹ | Superscript number + footnote list at bottom |
| Bild | 🖼 | Upload to Sanity Assets, embed reference |

---

## Data Flow

1. User writes in TipTap editor
2. On save: TipTap JSON → custom converter → Sanity Portable Text format
3. API route (`/api/admin/articles`) calls Sanity client with write token
4. **Entwurf speichern** → `client.patch()` saves as Sanity draft (not live)
5. **Publizieren** → `client.patch().commit()` publishes → ISR revalidates → live in ~60s

**Images:**
- Uploaded via `/api/admin/upload`
- Stored in Sanity Assets (CDN)
- Returned as Sanity asset reference, embedded in block

---

## Environment Variables

```env
# Existing
NEXT_PUBLIC_SANITY_PROJECT_ID=y5fwmpkn
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01

# New
SANITY_API_WRITE_TOKEN=...   ← from sanity.io/manage
ADMIN_PASSWORD=...           ← chosen by Rafael
ADMIN_SECRET=...             ← random string for cookie signing
```

---

## Key Dependencies

- `@tiptap/react` — core editor
- `@tiptap/starter-kit` — base extensions (bold, italic, headings, lists)
- `@tiptap/extension-image` — image support
- Custom TipTap extensions for each custom block type
- `@sanity/client` — already installed, needs write token

---

## Out of Scope

- Real-time collaboration
- Version history / diff view
- Dark mode
- Mobile editing
