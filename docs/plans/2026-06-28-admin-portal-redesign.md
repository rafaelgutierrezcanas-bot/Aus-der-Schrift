# Admin Portal Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the admin portal with a theological quote on the dashboard, article tabs (Veröffentlicht / Entwürfe), and consistent page subtitles across all list pages.

**Architecture:** Pure UI changes — no new API routes, no schema changes, no new dependencies. All changes are in `src/app/admin/` page components. The Artikel page is the most involved change (URL-based tabs as a server component).

**Tech Stack:** Next.js App Router (server components), Tailwind CSS v4, TypeScript. No client-side state introduced.

---

### Task 1: Dashboard — Add Gavin Ortlund Quote Block

**Files:**
- Modify: `src/app/admin/page.tsx`

**Step 1: Add the quote block above the stats grid**

In `src/app/admin/page.tsx`, insert this JSX block **before** the `{/* Stats */}` comment, right after the opening `<div className="space-y-8">`:

```tsx
{/* Theological quote */}
<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
  <p className="font-serif italic text-sm text-[var(--color-accent)] leading-relaxed">
    &ldquo;We need a generation of Christians who are gentle toward people and fierce toward ideas.&rdquo;
  </p>
  <p className="text-xs text-[var(--color-muted)] mt-2" style={{ fontFamily: "var(--font-sans)" }}>
    — Gavin Ortlund
  </p>
</div>
```

**Step 2: Update Entwürfe stat card link**

The second stat in the `stats` array currently links to `/admin/artikel`. Change its `href` so it goes directly to the Entwürfe tab (which Task 3 will create):

```tsx
{ label: "Entwürfe", value: drafts, href: "/admin/artikel?tab=entwuerfe" },
```

**Step 3: Verify visually**

Run `npm run dev`, open `http://localhost:3000/admin`. Check:
- Quote block appears at top, above stat cards
- Attribution line is smaller and muted
- Clicking "Entwürfe" stat card lands on `/admin/artikel?tab=entwuerfe` (tab will be added in Task 3)

**Step 4: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add Ortlund quote to admin dashboard"
```

---

### Task 2: Artikel Page — Add Tabs (Veröffentlicht / Entwürfe)

**Files:**
- Modify: `src/app/admin/artikel/page.tsx`

**Context:** This is a Next.js App Router server component. To read a URL query parameter, receive `searchParams` as a prop (it's a `Promise` in Next.js 15 — must be awaited).

**Step 1: Update the page signature and data fetching**

Replace the entire contents of `src/app/admin/artikel/page.tsx` with:

```tsx
import Link from "next/link";
import { client } from "@/sanity/client";
import { DeleteArticleButton } from "@/components/admin/DeleteArticleButton";

interface ArticleSummary {
  _id: string;
  titleDe: string;
  slug: { current: string };
  publishedAt: string;
  language: string;
  status?: string;
  category?: { titleDe: string };
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  idea:      { label: "Idee",           color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  draft:     { label: "Entwurf",        color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  ready:     { label: "Bereit",         color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  published: { label: "Veröffentlicht", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  archived:  { label: "Archiviert",     color: "bg-[var(--color-surface)] text-[var(--color-muted)]" },
};

const DRAFT_STATUSES = new Set(["idea", "draft", "ready", "archived"]);

export default async function ArtikelPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const isDraftTab = tab === "entwuerfe";

  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, language, status,
      "category": category->{ titleDe }
    }
  `);

  const published = articles.filter((a) => !DRAFT_STATUSES.has(a.status ?? "published"));
  const drafts = articles.filter((a) => DRAFT_STATUSES.has(a.status ?? "published"));
  const visible = isDraftTab ? drafts : published;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Artikel</h1>
        <Link
          href="/admin/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neuer Artikel
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[var(--color-border)]">
        <Link
          href="/admin/artikel"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            !isDraftTab
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Veröffentlicht ({published.length})
        </Link>
        <Link
          href="/admin/artikel?tab=entwuerfe"
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
            isDraftTab
              ? "border-[var(--color-accent)] text-[var(--color-accent)]"
              : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Entwürfe ({drafts.length})
        </Link>
      </div>

      {visible.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm py-8 text-center" style={{ fontFamily: "var(--font-sans)" }}>
          {isDraftTab ? "Keine Entwürfe vorhanden." : "Noch keine veröffentlichten Artikel."}
        </p>
      )}

      <div className="space-y-2">
        {visible.map((article) => {
          const st = article.status ?? "published";
          const badge = STATUS_LABELS[st] ?? STATUS_LABELS.published;
          return (
            <Link
              key={article._id}
              href={`/admin/${article.slug.current}`}
              className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] truncate" style={{ fontFamily: "var(--font-sans)" }}>
                  {article.titleDe}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                  {article.category?.titleDe ?? "Keine Kategorie"} ·{" "}
                  {isDraftTab
                    ? <span className={`px-1.5 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    : new Date(article.publishedAt).toLocaleDateString("de-DE")
                  }{" "}
                  · <span className="uppercase">{article.language}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                {!isDraftTab && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {badge.label}
                  </span>
                )}
                <DeleteArticleButton slug={article.slug.current} title={article.titleDe} />
                <span className="text-[var(--color-muted)] text-sm">→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Verify tabs work**

Run `npm run dev`, open `http://localhost:3000/admin/artikel`. Check:
- Default tab shows "Veröffentlicht" with published articles
- Clicking "Entwürfe" tab changes URL to `?tab=entwuerfe` and shows draft articles
- Tab counts are correct
- Delete button still works on both tabs
- Back-clicking to `/admin/artikel` resets to published tab

**Step 3: Commit**

```bash
git add src/app/admin/artikel/page.tsx
git commit -m "feat: add published/draft tabs to artikel page"
```

---

### Task 3: All List Pages — Add Description Subtitles

**Files:**
- Modify: `src/app/admin/quellen/page.tsx`
- Modify: `src/app/admin/ideen/page.tsx`
- Modify: `src/app/admin/projekte/page.tsx`

**Context:** The Empfohlen page already has the ideal header pattern:
```tsx
<div className="mb-6">
  <h1 className="font-serif text-2xl text-[var(--color-foreground)]">...</h1>
  <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
    ...
  </p>
</div>
```
The other pages have `flex items-center justify-between` header (h1 left, button right). Keep that layout but add a description line below the h1 — wrap h1 in a `<div>`.

**Step 1: Quellen page — add subtitle**

In `src/app/admin/quellen/page.tsx`, find:
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Quellen</h1>
```

Replace with:
```tsx
<div className="flex items-start justify-between mb-6">
  <div>
    <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Quellen</h1>
    <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
      Bücher, Artikel und Websites, die du in deinen Texten zitierst.
    </p>
  </div>
```

**Step 2: Ideen page — add subtitle**

In `src/app/admin/ideen/page.tsx`, find:
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Ideen</h1>
```

Replace with:
```tsx
<div className="flex items-start justify-between mb-6">
  <div>
    <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Ideen</h1>
    <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
      Gedanken und Themen, die noch zu Artikeln werden könnten.
    </p>
  </div>
```

**Step 3: Projekte page — add subtitle**

In `src/app/admin/projekte/page.tsx`, find:
```tsx
<div className="flex items-center justify-between mb-6">
  <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Projekte</h1>
```

Replace with:
```tsx
<div className="flex items-start justify-between mb-6">
  <div>
    <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Projekte</h1>
    <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
      Themenreihen und Forschungsprojekte, die mehrere Artikel umfassen.
    </p>
  </div>
```

**Step 4: Verify all three pages**

Open each page in the browser:
- `/admin/quellen` — subtitle appears below "Quellen", button stays right-aligned
- `/admin/ideen` — subtitle appears below "Ideen", button stays right-aligned
- `/admin/projekte` — subtitle appears below "Projekte", button stays right-aligned

**Step 5: Commit**

```bash
git add src/app/admin/quellen/page.tsx src/app/admin/ideen/page.tsx src/app/admin/projekte/page.tsx
git commit -m "feat: add description subtitles to admin list pages"
```

---

### Task 4: Push to Main

**Step 1: Push all commits**

```bash
git push
```

**Step 2: Verify on production**

After deployment, open the admin on mobile and desktop:
- Dashboard shows the Ortlund quote at the top
- Artikel page has working tabs
- All list pages have consistent subtitles
