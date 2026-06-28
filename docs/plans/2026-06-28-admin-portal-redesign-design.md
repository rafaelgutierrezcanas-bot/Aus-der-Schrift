# Admin Portal Redesign — Design Document

**Date:** 2026-06-28
**Approach:** Targeted Refinement (Approach A)
**Goal:** Make the admin portal nicer, more practical, and spiritually edifying — without breaking any existing functionality.

---

## 1. Dashboard: Theological Quote

A subtle motto block at the very top of the dashboard (`/admin`), before the stats cards.

**Quote:**
> "We need a generation of Christians who are gentle toward people and fierce toward ideas."
> — Gavin Ortlund

**Visual treatment:**
- Italic Playfair Display (`font-serif`), small size (text-sm)
- Accent color (`--color-accent`) for the quote text, muted for the attribution
- A thin top border line or small decorative rule above it
- Subtle `bg-[--color-surface]` background card, `rounded-xl`, no heavy shadow
- Sits above the stats grid, full width

**No interactivity.** Static text. No close button. It's always there, like a verse on a desk.

---

## 2. Artikel Page: Published / Draft Tabs

**File:** `src/app/admin/artikel/page.tsx`

The article list is split into two tabs:

- **Veröffentlicht** — articles with `status == "published"` (or no status set)
- **Entwürfe** — articles with `status` in `["idea", "draft", "ready", "archived"]`

**Tab behavior:**
- URL parameter: `?tab=entwuerfe` (default: Veröffentlicht tab)
- Tab counts shown: `Veröffentlicht (12)    Entwürfe (4)`
- Server component reads `searchParams.tab` to filter

**Article card differences:**
- Published articles: show `publishedAt` date + category
- Drafts: show status badge (Idee / Entwurf / Bereit / Archiviert) instead of date, since no `publishedAt`

**All existing features preserved:** delete button, status badges, category, slug navigation.

---

## 3. Visual Polishing — All Admin Pages

Consistent improvements applied across all admin pages:

### 3a. Page Headers
Every admin page gets a consistent header block:
```tsx
<div className="mb-6">
  <h1 className="font-serif text-2xl text-[var(--color-foreground)]">{title}</h1>
  <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
    {description}
  </p>
</div>
```
Currently inconsistent — some pages have this, others don't.

### 3b. Cards
Consistent card style: `rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3`
Applies to: article list items, source list items, idea cards, project list items.

### 3c. Empty States
Pages that may show no results get a small empty state:
```tsx
<p className="text-sm text-[var(--color-muted)] py-8 text-center" style={{ fontFamily: "var(--font-sans)" }}>
  Noch keine Einträge vorhanden.
</p>
```
Affects: Ideen, Quellen (after search), Artikel tabs.

### 3d. Quick Actions on Dashboard
The "Neuer Artikel", "Neue Quelle", "Neue Idee" buttons are made more prominent:
- Styled as filled accent-color buttons (current: outline/subtle)
- Grouped in a `flex gap-2` row beneath the quote

---

## Files Touched

| File | Change |
|------|--------|
| `src/app/admin/page.tsx` | Add quote block, improve quick action buttons |
| `src/app/admin/artikel/page.tsx` | Add tabs (Veröffentlicht / Entwürfe) with URL param |
| `src/app/admin/quellen/page.tsx` | Consistent header + empty state |
| `src/app/admin/ideen/page.tsx` | Consistent header + card style + empty state |
| `src/app/admin/projekte/page.tsx` | Consistent header + card style + empty state |
| `src/app/admin/empfohlen/page.tsx` | Minor header consistency (already close) |

**Not touched:** All API routes, TiptapEditor, LektoratPanel, auth, all edit pages, all form pages.

---

## Design Principles

- **No new dependencies** — all changes are HTML/Tailwind/React
- **No functional changes** — zero breakage to existing features
- **Spiritually grounded** — the quote is permanent, not dismissible, not animated; it's a quiet anchor
- **Gavin Ortlund's tone** — irenic, convictional, not preachy; the quote reflects that
