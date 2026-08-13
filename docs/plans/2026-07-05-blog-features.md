# Blog Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 12 reader-experience features for the aus-der-schrift theological blog in priority order.

**Architecture:** All features are additive — no schema breaking changes, no regressions. Priority 1 features are pure frontend/component changes. Priority 2 adds a schema field (tags) and new components. Priority 3 adds API routes and CSS.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, Sanity CMS (GROQ), TypeScript strict, next-intl (de/en)

> **Important:** Read `node_modules/next/dist/docs/` before writing any Next.js code. This project uses Next.js 16 which may differ from training data.

---

## Priority 1

### Task 1: Reading time on article cards

**Files:**
- Modify: `src/sanity/queries.ts` (add `bodyDe`, `bodyEn` fields to allArticlesQuery + variants)
- Modify: `src/components/ArticleCard.tsx` (show reading time)
- Modify: `src/app/[locale]/blog/page.tsx` (already passes article to ArticleCard — no change needed once query is fixed)

**Step 1: Add body fields to allArticlesQuery**

In `src/sanity/queries.ts`, update `allArticlesQuery`, `articlesByCategoryQuery`, `recommendedArticlesQuery`, `latestArticlesQuery`, and `relatedArticlesQuery` — add these two fields inside the projection `{}`:

```groq
bodyDe[] { _type, _key, style, children[] { text } },
bodyEn[] { _type, _key, style, children[] { text } },
```

These are "lightweight" body projections — only the fields estimateReadingTime needs. No full portable text, just blocks+text.

**Step 2: Show reading time in ArticleCard**

In `src/components/ArticleCard.tsx`:

After the `publishedAt` variable declaration (line 23), add:
```tsx
const body = (locale === "en" && (article.bodyEn as unknown[])?.length
  ? article.bodyEn
  : article.bodyDe) as unknown[] | undefined;
const readingTime = body ? estimateReadingTime(body) : null;
```

Add `estimateReadingTime` to the import from `@/lib/utils`.

**Step 3: Render reading time badge**

In all three card variants (horizontal, featured, default), inside the meta row next to the date, add after the date span:

```tsx
{readingTime && (
  <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
    {readingTime} min
  </span>
)}
```

For the **horizontal** variant: after the `publishedAt` span (line ~89).
For the **featured** variant: after the `publishedAt` span (line ~124).
For the **default** variant: after the `publishedAt` span (line ~165).

**Step 4: Manual test**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
npm run dev
```

Open http://localhost:3000/de/blog — verify each article card shows "X min" reading time.

**Step 5: Commit**

```bash
git add src/sanity/queries.ts src/components/ArticleCard.tsx
git commit -m "feat: show reading time on article cards"
```

---

### Task 2: Footnote hover tooltips

**Files:**
- Modify: `src/components/PortableTextRenderer.tsx` (tooltip on footnote marks)
- Create: `src/components/FootnoteTooltip.tsx`

The footnote type in PortableTextRenderer renders a `<sup><a href="#fn-N">[N]</a></sup>`. On hover, we want to show the footnote content inline.

The challenge: the footnote `value` contains `_fnIndex`, `text` (plain text note) or `sourceId` (reference). The full footnote text is resolved at the page level. We need to pass the rendered footnotes into the tooltip.

**Approach:** Pass a `footnotesMap: Map<number, string>` to `PortableTextRenderer` so each `[N]` tooltip can show its text. The article page already builds `footnotes: FootnoteNode[]` from `annotateFootnotes()`.

**Step 1: Create FootnoteTooltip component**

Create `src/components/FootnoteTooltip.tsx`:

```tsx
"use client";
import { useState, useRef } from "react";

interface FootnoteTooltipProps {
  index: number;
  text: string;
  children: React.ReactNode;
}

export function FootnoteTooltip({ index, text, children }: FootnoteTooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }
  function hide() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <span className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 max-w-xs rounded-sm border border-border bg-surface shadow-lg px-3 py-2 text-xs leading-relaxed text-foreground pointer-events-none"
          style={{ fontFamily: "var(--font-body-serif)" }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          <span className="font-semibold text-accent mr-1" style={{ fontFamily: "var(--font-sans)" }}>[{index}]</span>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border" />
        </span>
      )}
    </span>
  );
}
```

**Step 2: Update PortableTextRenderer to accept footnotesMap**

In `src/components/PortableTextRenderer.tsx`:

1. Import `FootnoteTooltip`.
2. Change `buildComponents(locale: string)` to `buildComponents(locale: string, footnotesMap?: Map<number, string>)`.
3. Update the `footnote` type renderer:

```tsx
footnote: ({ value }: { value: Record<string, unknown> }) => {
  const n = (value._fnIndex as number | undefined) ?? 0;
  const tooltipText = footnotesMap?.get(n);
  const anchor = (
    <sup className="text-accent font-medium text-xs leading-none" style={{ fontFamily: "var(--font-sans)" }}>
      <a href={`#fn-${n}`} id={`fnref-${n}`} aria-label={locale === "de" ? `Fußnote ${n}` : `Footnote ${n}`}>
        [{n}]
      </a>
    </sup>
  );
  if (!tooltipText) return anchor;
  return (
    <FootnoteTooltip index={n} text={tooltipText}>
      {anchor}
    </FootnoteTooltip>
  );
},
```

4. Update `PortableTextRenderer` props and pass map through:

```tsx
export function PortableTextRenderer({
  value,
  locale = "de",
  footnotesMap,
}: {
  value: unknown[];
  locale?: string;
  footnotesMap?: Map<number, string>;
}) {
  return (
    <PortableText
      value={value as Parameters<typeof PortableText>[0]["value"]}
      components={buildComponents(locale, footnotesMap)}
    />
  );
}
```

**Step 3: Build footnotesMap in the article page**

In `src/app/[locale]/blog/[slug]/page.tsx`, after `annotateFootnotes` is called, build the map. Find the section where `annotateFootnotes` is called and add:

```tsx
const { annotated: annotatedBody, footnotes } = annotateFootnotes(body);

// Build tooltip map: fnIndex → display text
const footnotesMap = new Map<number, string>();
for (const fn of footnotes) {
  if (fn.text) {
    footnotesMap.set(fn._fnIndex!, fn.text);
  } else if (fn.sourceId) {
    const source = sources?.find((s: Source) => s._id === fn.sourceId);
    if (source) {
      const pages = fn.pages ? `, S. ${fn.pages}` : "";
      footnotesMap.set(fn._fnIndex!, formatChicago(source) + pages);
    }
  }
}
```

Then pass `footnotesMap={footnotesMap}` to `<PortableTextRenderer>`.

You need to read `src/app/[locale]/blog/[slug]/page.tsx` in full to find where `PortableTextRenderer` is rendered and `annotateFootnotes` is called. The `sources` variable is available from the article fetch.

**Step 4: Manual test**

Open any article with footnotes. Hover over `[1]` — tooltip should appear above the superscript.

**Step 5: Commit**

```bash
git add src/components/FootnoteTooltip.tsx src/components/PortableTextRenderer.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: footnote hover tooltips"
```

---

### Task 3: Client-side search on blog listing

**Files:**
- Create: `src/components/BlogSearchList.tsx`
- Modify: `src/app/[locale]/blog/page.tsx`

The blog page is a server component. We extract the article list rendering into a client component `BlogSearchList` that receives articles as props and handles search filtering client-side. No external dependency needed.

**Step 1: Create BlogSearchList**

Create `src/components/BlogSearchList.tsx`:

```tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle, formatDate } from "@/lib/utils";
import { Search, X } from "lucide-react";

interface BlogSearchListProps {
  articles: Record<string, unknown>[];
  locale: string;
  labels: {
    searchPlaceholder: string;
    noResults: string;
    noArticles: string;
  };
}

export function BlogSearchList({ articles, locale, labels }: BlogSearchListProps) {
  const [query, setQuery] = useState("");

  const filtered = query.trim().length < 2
    ? articles
    : articles.filter((article) => {
        const q = query.toLowerCase();
        const title = getLocalizedTitle(article, locale).toLowerCase();
        const excerpt = getLocalizedExcerpt(article, locale).toLowerCase();
        const category = getLocalizedCategoryTitle(
          article.category as Record<string, unknown> | null,
          locale
        ).toLowerCase();
        return title.includes(q) || excerpt.includes(q) || category.includes(q);
      });

  if (articles.length === 0) {
    return (
      <p className="text-muted text-center py-16" style={{ fontFamily: "var(--font-sans)" }}>
        {labels.noArticles}
      </p>
    );
  }

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="w-full pl-10 pr-9 py-2.5 bg-transparent border border-border rounded-sm text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-center py-10 text-sm" style={{ fontFamily: "var(--font-sans)" }}>
          {labels.noResults} „{query}"
        </p>
      )}

      {/* Article list — broadsheet rows */}
      <div>
        {filtered.map((article, i) => {
          const title = getLocalizedTitle(article, locale);
          const excerpt = getLocalizedExcerpt(article, locale);
          const category = article.category as Record<string, unknown> | null;
          const categoryTitle = getLocalizedCategoryTitle(category, locale);
          const categorySlug = (category?.slug as { current: string })?.current;
          const slug = (article.slug as { current: string })?.current;
          const publishedAt = article.publishedAt as string | undefined;
          const articleHref = `/${locale}/blog/${slug}`;
          const isFirst = i === 0 && !query;

          return (
            <article
              key={article._id as string}
              className="group py-6 border-b border-border md:grid md:grid-cols-[180px_1fr] md:gap-8 md:py-7"
            >
              <div className="flex items-center gap-2 mb-2 md:flex-col md:items-start md:gap-1 md:pt-0.5 md:mb-0">
                {categoryTitle && (
                  categorySlug ? (
                    <Link
                      href={`/${locale}/kategorien/${categorySlug}`}
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent hover:underline"
                      style={{ fontFamily: "var(--font-sans)" }}
                    >
                      {categoryTitle}
                    </Link>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                      {categoryTitle}
                    </span>
                  )
                )}
                {publishedAt && (
                  <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                    <span className="md:hidden">· </span>{formatDate(publishedAt, locale)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <Link href={articleHref}>
                  <h2
                    className={`font-bold leading-snug mb-2 group-hover:text-accent transition-colors ${isFirst ? "text-2xl md:text-3xl" : "text-lg md:text-xl"}`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {title}
                  </h2>
                  {excerpt && (
                    <p
                      className={`text-muted leading-relaxed line-clamp-2 ${isFirst ? "text-base" : "text-sm"}`}
                      style={{ fontFamily: "var(--font-body-serif)" }}
                    >
                      {excerpt}
                    </p>
                  )}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Update blog/page.tsx**

Replace the `{articles.length === 0 && ...}` block and the entire `{/* Article list */}` section with:

```tsx
<BlogSearchList
  articles={articles}
  locale={locale}
  labels={{
    searchPlaceholder: locale === "de" ? "Artikel suchen…" : "Search articles…",
    noResults: locale === "de" ? "Keine Artikel gefunden für" : "No articles found for",
    noArticles: locale === "de" ? "Noch keine Artikel." : "No articles yet.",
  }}
/>
```

Import `BlogSearchList` from `@/components/BlogSearchList`.

**Step 3: Manual test**

Open /de/blog, type in the search box — results filter instantly. Empty results message shows with query.

**Step 4: Commit**

```bash
git add src/components/BlogSearchList.tsx src/app/[locale]/blog/page.tsx
git commit -m "feat: client-side search on blog listing page"
```

---

### Task 4: Verify and improve sticky ToC

The ToC is already `sticky top-24` with IntersectionObserver. Check if it actually sticks properly and improve the active indicator.

**Files:**
- Modify: `src/components/TableOfContents.tsx`

**Step 1: Read the article layout structure**

Read `src/app/[locale]/blog/[slug]/page.tsx` fully to see how the ToC is positioned in the layout (is it in a flex container with the body? what's the parent structure?).

**Step 2: Improve active indicator with a left border**

Update the active link style in TableOfContents.tsx from the current class-only approach to include a visual indicator:

```tsx
<a
  href={`#${h.id}`}
  className={`block text-xs leading-relaxed transition-colors pl-3 border-l-2 ${
    active === h.id
      ? "text-accent border-accent"
      : "text-muted border-transparent hover:text-foreground hover:border-border"
  }`}
  style={{ fontFamily: "var(--font-sans)" }}
>
  {h.text}
</a>
```

Remove the `{h.level === 3 ? "pl-3" : ""}` from the `<li>` and handle indentation differently:

```tsx
<li key={h.id} className={h.level === 3 ? "ml-3" : ""}>
```

**Step 3: Manual test**

Open a long article, scroll — ToC stays fixed on right, active section highlighted with gold border.

**Step 4: Commit**

```bash
git add src/components/TableOfContents.tsx
git commit -m "feat: improve sticky ToC active indicator"
```

---

## Priority 2

### Task 5: Link-type icons (external + PDF)

**Files:**
- Modify: `src/app/globals.css`

Pure CSS — no component changes needed.

**Step 1: Add link icon styles to globals.css**

At the end of `src/app/globals.css`, add:

```css
/* Link type indicators */
.prose a[href^="http"]:not([href*="theologik.org"])::after,
.prose a[href^="https"]:not([href*="theologik.org"])::after {
  content: " ↗";
  font-size: 0.75em;
  opacity: 0.6;
}

.prose a[href$=".pdf"]::after {
  content: " PDF↗" !important;
  font-size: 0.75em;
  opacity: 0.6;
}
```

**Note:** The article body is rendered inside a `prose` class container. Check `src/app/[locale]/blog/[slug]/page.tsx` to confirm the prose wrapper. If not using `.prose`, use the actual container class.

**Step 2: Manual test**

Open an article with external links. External links show `↗` after them. PDF links show `PDF↗`.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: link type icons for external and PDF links"
```

---

### Task 6: "Zitieren / Cite" button

**Files:**
- Create: `src/components/CiteButton.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (add CiteButton near ShareButton)

**Step 1: Create CiteButton**

Create `src/components/CiteButton.tsx`:

```tsx
"use client";
import { useState } from "react";
import { Quote, Check } from "lucide-react";

interface CiteButtonProps {
  author: string;
  title: string;
  publishedAt: string;
  url: string;
  locale: string;
}

export function CiteButton({ author, title, publishedAt, url, locale }: CiteButtonProps) {
  const [copied, setCopied] = useState(false);

  const year = new Date(publishedAt).getFullYear();
  const citation = locale === "de"
    ? `${author}: „${title}". Theologik, ${year}. ${url}`
    : `${author}: "${title}". Theologik, ${year}. ${url}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-muted hover:text-accent transition-colors"
      style={{ fontFamily: "var(--font-sans)" }}
      title={locale === "de" ? "Zitation kopieren" : "Copy citation"}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{locale === "de" ? "Kopiert!" : "Copied!"}</span>
        </>
      ) : (
        <>
          <Quote className="w-3.5 h-3.5" />
          <span>{locale === "de" ? "Zitieren" : "Cite"}</span>
        </>
      )}
    </button>
  );
}
```

**Step 2: Add CiteButton to the article page**

In `src/app/[locale]/blog/[slug]/page.tsx`, import `CiteButton` and add it in the share buttons row. You need to read the page to find the ShareButton usage and add CiteButton next to it:

```tsx
<CiteButton
  author={article.author?.name ?? "Theologik"}
  title={getLocalizedTitle(article, locale)}
  publishedAt={article.publishedAt}
  url={absoluteUrl(`/${locale}/blog/${slug}`)}
  locale={locale}
/>
```

**Step 3: Manual test**

Open an article, click "Zitieren" — citation text copied to clipboard. Button briefly shows "Kopiert!".

**Step 4: Commit**

```bash
git add src/components/CiteButton.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: cite button for academic citation copy"
```

---

### Task 7: Tags / Schlagworte

This requires a Sanity schema change. Tags are added to the article schema as an array of strings.

**Files:**
- Modify: `src/sanity/schemas/article.ts` (add `tags` field)
- Modify: `src/sanity/queries.ts` (include `tags` in articleBySlugQuery, allArticlesQuery, etc.)
- Modify: `src/components/ArticleCard.tsx` (show tags)
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (show tags on article page)

**Step 1: Add tags field to article schema**

In `src/sanity/schemas/article.ts`, read the file first to find the right location. Add after `keywords` field:

```ts
{
  name: "tags",
  title: "Tags / Schlagworte",
  type: "array",
  of: [{ type: "string" }],
  description: "Spezifische Schlagworte (z.B. Taufe, Didache, Trinitätslehre)",
  options: {
    layout: "tags",
  },
},
```

**Step 2: Add tags to queries**

In `allArticlesQuery`, `articleBySlugQuery`, `articlesByCategoryQuery`, `recommendedArticlesQuery`, `latestArticlesQuery`, `relatedArticlesQuery`, add:

```groq
tags,
```

**Step 3: Show tags on article detail page**

In `src/app/[locale]/blog/[slug]/page.tsx`, find the header section (near difficulty badge and category) and add tags after the header metadata:

```tsx
{article.tags && (article.tags as string[]).length > 0 && (
  <div className="flex flex-wrap gap-1.5 mt-3">
    {(article.tags as string[]).map((tag) => (
      <span
        key={tag}
        className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {tag}
      </span>
    ))}
  </div>
)}
```

**Step 4: Show tags on ArticleCard (optional, small)**

In `src/components/ArticleCard.tsx`, in the default card variant, add tags below the excerpt (only first 3, to avoid clutter):

```tsx
{article.tags && (article.tags as string[]).length > 0 && (
  <div className="flex flex-wrap gap-1 mt-2">
    {(article.tags as string[]).slice(0, 3).map((tag) => (
      <span
        key={tag}
        className="text-[9px] px-1.5 py-0.5 rounded-full border border-border text-muted"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {tag}
      </span>
    ))}
  </div>
)}
```

**Step 5: Manual test**

In Sanity Studio (http://localhost:3333), add tags to an article. Verify they show in the article detail and card.

**Step 6: Commit**

```bash
git add src/sanity/schemas/article.ts src/sanity/queries.ts src/components/ArticleCard.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: tags/Schlagworte for articles"
```

---

### Task 8: Sidenotes (Tufte-style on wide screens)

On `xl` screens (≥1280px), footnotes appear in the right margin instead of at the bottom. On smaller screens, the existing footnote section remains unchanged.

**Files:**
- Create: `src/components/SidenotesWrapper.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Approach:**
- On `xl`, change the article layout from `max-w-prose` single column to a two-column grid: `[1fr_280px]`
- Sidenotes are rendered as a right-margin column using CSS Grid
- At `< xl`, the column collapses and footnotes show at bottom as before
- Each sidenote is absolutely positioned relative to where its `[N]` superscript appears

**Simpler approach (no absolute positioning needed):**
Use CSS Grid `subgrid` or simple right-column approach where sidenotes appear roughly in order, not exactly aligned with their references. This is the 90% solution.

**Step 1: Create SidenotesWrapper**

Create `src/components/SidenotesWrapper.tsx`:

```tsx
"use client";

interface Sidenote {
  index: number;
  text: string;
}

interface SidenotesWrapperProps {
  sidenotes: Sidenote[];
  locale: string;
}

export function SidenotesColumn({ sidenotes, locale }: SidenotesWrapperProps) {
  if (sidenotes.length === 0) return null;

  return (
    <aside className="hidden xl:block w-[260px] shrink-0 relative" aria-label={locale === "de" ? "Randnotizen" : "Sidenotes"}>
      <div className="sticky top-24 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {sidenotes.map((note) => (
          <div
            key={note.index}
            id={`sn-${note.index}`}
            className="text-[11px] leading-relaxed text-muted border-l-2 border-border pl-3"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            <span className="font-semibold text-accent mr-1" style={{ fontFamily: "var(--font-sans)" }}>
              [{note.index}]
            </span>
            {note.text}
          </div>
        ))}
      </div>
    </aside>
  );
}
```

**Step 2: Update article page layout**

In `src/app/[locale]/blog/[slug]/page.tsx`:

1. Import `SidenotesColumn`.
2. Build `sidenotes` array from `footnotes` (same logic as `footnotesMap` in Task 2).
3. Wrap the `[article body + ToC]` section in a wider container and add sidenotes column:

The current layout is roughly:
```tsx
<div className="flex gap-8 items-start">
  <div className="min-w-0 flex-1 prose ...">
    <PortableTextRenderer ... />
  </div>
  <TableOfContents ... />
</div>
```

Change to:
```tsx
<div className="flex gap-8 items-start">
  <div className="min-w-0 flex-1 prose ...">
    <PortableTextRenderer ... />
  </div>
  <div className="flex gap-8 items-start shrink-0">
    <TableOfContents ... />
    <SidenotesColumn sidenotes={sidenotes} locale={locale} />
  </div>
</div>
```

On `< xl`, SidenotesColumn is hidden (the `hidden xl:block` class). The existing footnotes section at the bottom still renders for all screen sizes.

You **must read the full article page** before making this change to understand the exact current structure.

**Step 3: Manual test**

On a wide (≥1280px) screen with a article with footnotes, sidenotes appear on the right. On mobile, only the bottom footnotes show.

**Step 4: Commit**

```bash
git add src/components/SidenotesColumn.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: Tufte-style sidenotes on wide screens"
```

---

## Priority 3

### Task 9: Print stylesheet

**Files:**
- Modify: `src/app/globals.css`

**Step 1: Add print styles**

Append to `src/app/globals.css`:

```css
@media print {
  /* Hide navigation chrome */
  header, footer, nav[aria-label="Table of contents"],
  .reading-progress, [data-share-button], [data-back-to-top],
  .comments-section, .related-articles {
    display: none !important;
  }

  /* Reset background/colors for paper */
  body {
    background: white !important;
    color: black !important;
    font-size: 11pt;
  }

  /* Full-width article */
  .prose, article {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Show URLs after links */
  a[href]::after {
    content: " (" attr(href) ")";
    font-size: 0.75em;
    color: #666;
  }

  /* Don't show URL for internal fragment links */
  a[href^="#"]::after {
    content: none;
  }

  /* Make footnotes visible and clean */
  .footnotes-section {
    border-top: 1pt solid black;
    margin-top: 2em;
    page-break-before: avoid;
  }

  /* Avoid page breaks inside paragraphs */
  p, li, blockquote {
    page-break-inside: avoid;
  }

  /* Headings stay with content */
  h1, h2, h3 {
    page-break-after: avoid;
  }
}
```

**Note:** The selectors for `reading-progress`, `share-button`, etc. may need to be adjusted based on the actual class names or structure in the article page. Read the page before applying. Use `data-` attributes or actual class names from the components.

**Step 2: Manual test**

Open an article, Cmd+P (print preview) — navigation hidden, text is full width, links show URLs.

**Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: print stylesheet for article pages"
```

---

### Task 10: Font size controls

**Files:**
- Create: `src/components/FontSizeControls.tsx`
- Modify: `src/app/globals.css` (CSS variable for font size)
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (add FontSizeControls to article header)

**Step 1: Add CSS variable support**

In `src/app/globals.css`, inside the prose body text selectors, replace hardcoded `1.0625rem` with a CSS variable where used. Since Tailwind v4 uses `@theme`, add:

```css
@theme {
  /* existing theme variables ... */
  --article-font-size: 1.0625rem;
}
```

Then the `normal` block renderer already uses inline `text-[1.0625rem]` — we'll override via a class on the article container instead. The font size control will set `font-size` on a wrapper div via inline style.

**Step 2: Create FontSizeControls component**

Create `src/components/FontSizeControls.tsx`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { Minus, Plus } from "lucide-react";

const STORAGE_KEY = "theologik-font-size";
const SIZES = [0.9, 1, 1.0625, 1.125, 1.25];
const DEFAULT_INDEX = 2; // 1.0625rem

interface FontSizeControlsProps {
  locale: string;
}

export function FontSizeControls({ locale: _locale }: FontSizeControlsProps) {
  const [index, setIndex] = useState(DEFAULT_INDEX);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const i = parseInt(stored, 10);
      if (i >= 0 && i < SIZES.length) setIndex(i);
    }
  }, []);

  useEffect(() => {
    const root = document.getElementById("article-body");
    if (root) root.style.fontSize = `${SIZES[index]}rem`;
    localStorage.setItem(STORAGE_KEY, String(index));
  }, [index]);

  return (
    <div className="flex items-center gap-1" aria-label="Font size">
      <button
        onClick={() => setIndex((i) => Math.max(0, i - 1))}
        disabled={index === 0}
        className="text-muted hover:text-accent disabled:opacity-30 transition-colors p-1"
        aria-label="Decrease font size"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setIndex((i) => Math.min(SIZES.length - 1, i + 1))}
        disabled={index === SIZES.length - 1}
        className="text-muted hover:text-accent disabled:opacity-30 transition-colors p-1"
        aria-label="Increase font size"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
```

**Step 3: Add id="article-body" to the prose wrapper**

In `src/app/[locale]/blog/[slug]/page.tsx`, find the `<div className="... prose ...">` wrapping `<PortableTextRenderer>` and add `id="article-body"`.

**Step 4: Add FontSizeControls to article header**

Place it near the ShareButton / CiteButton area in the article header:

```tsx
<FontSizeControls locale={locale} />
```

**Step 5: Manual test**

Open an article. Click `+` — text gets bigger. Refresh — size persists. Click `-` — text shrinks back.

**Step 6: Commit**

```bash
git add src/components/FontSizeControls.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: font size controls with localStorage persistence"
```

---

### Task 11: Hover previews on internal links

When hovering over an `internalLink` mark, show a popup with the linked article's title and excerpt — fetched via an API route.

**Files:**
- Create: `src/app/api/preview/[slug]/route.ts`
- Create: `src/components/InternalLinkPreview.tsx`
- Modify: `src/components/PortableTextRenderer.tsx` (use InternalLinkPreview for internalLink marks)

**Step 1: Create preview API route**

Create `src/app/api/preview/[slug]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { groq } from "next-sanity";

const previewQuery = groq`
  *[_type == "article" && slug.current == $slug && (status == "published" || !defined(status))][0] {
    titleDe, titleEn, excerptDe, excerptEn, publishedAt,
    "category": category->{ titleDe, titleEn }
  }
`;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const article = await client.fetch(previewQuery, { slug }, { next: { revalidate: 300 } });
    if (!article) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json(article);
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 500 });
  }
}
```

**Step 2: Create InternalLinkPreview component**

Create `src/components/InternalLinkPreview.tsx`:

```tsx
"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { getLocalizedTitle, getLocalizedExcerpt } from "@/lib/utils";

interface InternalLinkPreviewProps {
  slug: string;
  children: React.ReactNode;
}

interface PreviewData {
  titleDe?: string;
  titleEn?: string;
  excerptDe?: string;
  excerptEn?: string;
}

export function InternalLinkPreview({ slug, children }: InternalLinkPreviewProps) {
  const locale = useLocale();
  const [data, setData] = useState<PreviewData | null>(null);
  const [open, setOpen] = useState(false);
  const fetchedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      try {
        const res = await fetch(`/api/preview/${slug}`);
        if (res.ok) setData(await res.json());
      } catch {
        // silent fail
      }
    }
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }

  const title = data ? getLocalizedTitle(data as Record<string, unknown>, locale) : null;
  const excerpt = data ? getLocalizedExcerpt(data as Record<string, unknown>, locale) : null;

  return (
    <span className="relative inline" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        href={`/${locale}/blog/${slug}`}
        className="text-accent underline underline-offset-2 hover:opacity-75 transition-opacity"
      >
        {children}
      </Link>
      {open && (
        <span
          className="absolute z-50 bottom-full left-0 mb-2 w-72 max-w-xs rounded-sm border border-border bg-surface shadow-lg px-4 py-3 pointer-events-none"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {title ? (
            <>
              <span className="block font-semibold text-sm leading-snug mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                {title}
              </span>
              {excerpt && (
                <span className="block text-xs text-muted leading-relaxed line-clamp-3" style={{ fontFamily: "var(--font-body-serif)" }}>
                  {excerpt}
                </span>
              )}
            </>
          ) : (
            <span className="block text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>…</span>
          )}
        </span>
      )}
    </span>
  );
}
```

**Step 3: Use InternalLinkPreview in PortableTextRenderer**

In `src/components/PortableTextRenderer.tsx`, update the `internalLink` mark renderer:

```tsx
internalLink: ({ children, value }) => {
  const slug = (value as Record<string, unknown>).slug as string ?? "";
  return (
    <InternalLinkPreview slug={slug}>
      {children}
    </InternalLinkPreview>
  );
},
```

Import `InternalLinkPreview` at the top. Remove the old `Link` import for internalLink (keep it if used elsewhere).

**Step 4: Manual test**

Open an article with internal links. Hover over an internal link — after ~200ms a popup appears with the linked article title and excerpt.

**Step 5: Commit**

```bash
git add src/app/api/preview/[slug]/route.ts src/components/InternalLinkPreview.tsx src/components/PortableTextRenderer.tsx
git commit -m "feat: hover previews for internal links"
```

---

### Task 12: Bidirectional backlinks

Show at the bottom of each article: "Dieser Artikel wird referenziert in: [list]"

**Files:**
- Modify: `src/sanity/queries.ts` (add backlinksQuery)
- Modify: `src/app/[locale]/blog/[slug]/page.tsx` (fetch and display backlinks)

**Step 1: Add backlinksQuery**

In `src/sanity/queries.ts`, add:

```groq
export const backlinksQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && (
    $slug in bodyDe[].children[].slug ||
    $slug in bodyEn[].children[].slug
  )] | order(publishedAt desc) [0..9] {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt
  }
`;
```

**Note:** This GROQ query checks if any `internalLink` mark's `slug` field matches the current article's slug. The actual path through portable text marks depends on how internalLink marks are stored in the Sanity document. Read `src/sanity/schemas/article.ts` to verify the mark structure. The mark might store slug at `bodyDe[].children[].marks[]._ref` or similar. Adjust the GROQ path accordingly.

Alternative simpler query (uses `pt::text` if available, or scan via match):
```groq
export const backlinksQuery = groq`
  *[_type == "article" && (status == "published" || !defined(status)) && slug.current != $slug &&
    (count((bodyDe[].children[].marks[]).[@._type == "internalLink" && @.slug == $slug]) > 0 ||
     count((bodyEn[].children[].marks[]).[@._type == "internalLink" && @.slug == $slug]) > 0)
  ] | order(publishedAt desc) [0..9] {
    _id, titleDe, titleEn, slug, publishedAt
  }
`;
```

If this GROQ query is too complex to get right without testing, use a simpler approach: fetch all articles and filter in JS on the server. This is the fallback.

**Step 2: Fetch and render backlinks in article page**

In `src/app/[locale]/blog/[slug]/page.tsx`:

1. Import `backlinksQuery`.
2. Add to the parallel fetch:
```tsx
const backlinks = await client.fetch(backlinksQuery, { slug }, { next: { revalidate: 3600 } });
```

3. Add backlinks section after the author card, before comments:

```tsx
{backlinks && backlinks.length > 0 && (
  <section className="mt-12 pt-8 border-t border-border">
    <p className="text-xs uppercase tracking-widest text-muted mb-4" style={{ fontFamily: "var(--font-sans)" }}>
      {locale === "de" ? "Referenziert in" : "Referenced in"}
    </p>
    <ul className="space-y-2">
      {(backlinks as Record<string, unknown>[]).map((ref) => (
        <li key={ref._id as string}>
          <Link
            href={`/${locale}/blog/${(ref.slug as { current: string }).current}`}
            className="text-sm text-accent hover:underline"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {getLocalizedTitle(ref, locale)}
          </Link>
        </li>
      ))}
    </ul>
  </section>
)}
```

**Step 3: Manual test**

If Article A links to Article B via internalLink, open Article B — it shows Article A in "Referenziert in".

**Step 4: Commit**

```bash
git add src/sanity/queries.ts src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: bidirectional backlinks on article pages"
```

---

## Execution Order

Run tasks in this order (dependencies flow downward):

1. Task 1 (reading time) — quick win, no dependencies
2. Task 2 (footnote tooltips) — needs footnote structure
3. Task 3 (search) — isolated client component
4. Task 4 (sticky ToC) — small improvement, isolated
5. Task 5 (link icons) — pure CSS, 5 minutes
6. Task 6 (cite button) — needs article page structure
7. Task 7 (tags) — schema change + multi-file
8. Task 8 (sidenotes) — needs Task 2's footnotesMap
9. Task 9 (print CSS) — pure CSS
10. Task 10 (font size) — needs article page id
11. Task 11 (hover previews) — needs API route
12. Task 12 (backlinks) — most complex GROQ, do last
