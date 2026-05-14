# Article Fixes & Share Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix broken featured image on article pages, add excerpt standfirst, replace Vercel OG image with Theologik branding, and add a share button.

**Architecture:** Four independent fixes. The image bug is in the GROQ query — `asset` is stored as a Sanity reference (`_ref`) which `urlFor` may not resolve reliably; switching to `asset->` (dereference) returns the full asset document including `_id`, which `@sanity/image-url` handles reliably. The OG image uses `next/og` (built-in Next.js API, zero dependencies). The share button is a client component using the Web Share API with clipboard fallback.

**Tech Stack:** Next.js 16 App Router, GROQ (Sanity query language), `@sanity/image-url`, `next/og` (ImageResponse), TypeScript, Tailwind CSS v4.

---

### Task 1: Fix image remotePatterns and dereference asset in GROQ

The `next.config.ts` uses `new URL()` for `remotePatterns`, which may parse `protocol` as `"https:"` (with colon) instead of `"https"`. Switch to the explicit object format. Also update all GROQ queries that fetch `featuredImage` to dereference `asset->` — this returns the full asset document (including `_id` and `url`) instead of just a `_ref`, making `urlFor` work reliably everywhere.

**Files:**
- Modify: `next.config.ts`
- Modify: `src/sanity/queries.ts`

**Step 1: Fix `next.config.ts` remotePatterns**

Change from:
```ts
images: {
  remotePatterns: [new URL("https://cdn.sanity.io/**")],
},
```
To:
```ts
images: {
  remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
},
```

**Step 2: Update all GROQ queries in `src/sanity/queries.ts`**

Every query that has `featuredImage,` as a bare field gets changed to dereference the asset. The `...` spread keeps existing fields (hotspot, crop, _type), and `"asset": asset->` replaces the reference with the full asset document.

In `allArticlesQuery`, change:
```groq
featuredImage,
```
To:
```groq
"featuredImage": featuredImage { ..., "asset": asset-> },
```

Apply the same change to `articleBySlugQuery`, `articlesByCategoryQuery`, and `relatedArticlesQuery`.

The full updated `src/sanity/queries.ts`:
```ts
import { groq } from "next-sanity";

export const allArticlesQuery = groq`
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name }
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    bodyDe,
    bodyEn,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name, bio, image },
    "sources": sources[]->{ _id, title, authors, year, type, publisher, pages }
  }
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    language,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug },
    "author": author->{ name }
  }
`;

export const relatedArticlesQuery = groq`
  *[_type == "article" && category->slug.current == $categorySlug && slug.current != $currentSlug] | order(publishedAt desc)[0..2] {
    _id,
    titleDe,
    titleEn,
    slug,
    publishedAt,
    excerptDe,
    excerptEn,
    "featuredImage": featuredImage { ..., "asset": asset-> },
    "category": category->{ titleDe, titleEn, slug }
  }
`;

export const allCategoriesQuery = groq`
  *[_type == "category"] | order(titleDe asc) {
    _id,
    titleDe,
    titleEn,
    slug,
    descriptionDe,
    descriptionEn
  }
`;

export const allArticleSlugsQuery = groq`
  *[_type == "article"] { "slug": slug.current }
`;
```

**Step 3: Verify TypeScript still compiles**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors (or pre-existing errors only). The `urlFor()` calls in `ArticleCard` and the article detail page still work because `@sanity/image-url` checks `asset._id` when `asset._ref` is absent.

**Step 4: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add next.config.ts src/sanity/queries.ts
git commit -m "fix: dereference featuredImage asset in GROQ queries, fix remotePatterns format"
```

---

### Task 2: Add excerpt standfirst to article detail page

The excerpt (`excerptDe`/`excerptEn`) is currently only used for SEO meta. Users often also type it as the first paragraph of the body, making it appear twice. Fix: render the excerpt as a distinct styled standfirst paragraph between the header (title + image) and the body. Users can then remove the duplicate from the body.

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Locate the body rendering block**

In `src/app/[locale]/blog/[slug]/page.tsx`, find the section around line 301:
```jsx
{/* Article Body with ToC */}
<div className="flex items-start">
  <div className="max-w-prose mx-auto flex-1 min-w-0">
    {body && body.length > 0 && <PortableTextRenderer value={body} />}
  </div>
```

**Step 2: Add standfirst before the body**

Insert the excerpt standfirst between the `</header>` closing tag and the body div. The full updated block (replace from `{/* Article Body with ToC */}` to the existing `</div>` that wraps the ToC):

```jsx
      {/* Excerpt standfirst */}
      {!!excerpt && (
        <p
          className="max-w-prose mx-auto mb-10 text-[1.125rem] italic text-muted leading-relaxed border-l-2 border-border pl-5"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {excerpt}
        </p>
      )}

      {/* Article Body with ToC */}
      <div className="flex items-start">
        <div className="max-w-prose mx-auto flex-1 min-w-0">
          {body && body.length > 0 && <PortableTextRenderer value={body} />}
        </div>
        {body && body.length > 0 && (
          <TableOfContents
            body={body as Parameters<typeof TableOfContents>[0]["body"]}
            label={locale === "de" ? "Inhalt" : "Contents"}
          />
        )}
      </div>
```

**Step 3: Verify TypeScript**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "feat: render excerpt as standfirst on article page"
```

---

### Task 3: Create default OG image using next/og

When sharing any page link (homepage, blog list, articles without a featured image), the social preview currently shows no branded image (may fall back to Vercel's logo). Create a `opengraph-image.tsx` at the app root — Next.js automatically serves this as `og:image` for any route that doesn't override it.

**Files:**
- Create: `src/app/opengraph-image.tsx`

**Step 1: Create the file**

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Theologik";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#faf8f5",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Logo wordmark */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "#1a1a1a",
            letterSpacing: "-3px",
            lineHeight: 1,
            marginBottom: 28,
          }}
        >
          THEOLOGIK
        </div>
        {/* Divider */}
        <div
          style={{
            width: 64,
            height: 2,
            background: "#b5956a",
            marginBottom: 28,
          }}
        />
        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "#8b7d6b",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Theologie · Bibelauslegung · Kirchengeschichte
        </div>
      </div>
    ),
    { ...size }
  );
}
```

**Step 2: Verify the file compiles**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npx tsc --noEmit 2>&1 | head -20
```

**Step 3: Test locally (optional)**

```bash
npm run dev
```

Open `http://localhost:3000/opengraph-image` in the browser — you should see a 1200×630 PNG with the Theologik wordmark on a warm cream background.

**Step 4: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat: add default branded OG image via next/og"
```

---

### Task 4: Add share button to article page

Add a "Teilen" button in the article header. On mobile/supported browsers, it opens the native Web Share sheet. On desktop, it copies the URL to clipboard and shows a "Kopiert!" confirmation for 2 seconds.

**Files:**
- Create: `src/components/ShareButton.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Create `src/components/ShareButton.tsx`**

```tsx
"use client";
import { useState } from "react";

interface Props {
  url: string;
  title: string;
}

export function ShareButton({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ url, title });
      } catch {
        // user cancelled — ignore
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-accent transition-colors"
      style={{ fontFamily: "var(--font-sans)" }}
      aria-label="Artikel teilen"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
      {copied ? "Kopiert!" : "Teilen"}
    </button>
  );
}
```

**Step 2: Import and add to article page**

In `src/app/[locale]/blog/[slug]/page.tsx`, add the import at the top:
```tsx
import { ShareButton } from "@/components/ShareButton";
```

Find the article header metadata row (the `<div>` with category, date, author, around line 246):
```jsx
<div className="flex items-center flex-wrap gap-3 mb-6">
  {categoryTitle && ( ... )}
  {!!article.publishedAt && ( ... )}
  {!!(article.author as ...).name && ( ... )}
</div>
```

Add `<ShareButton>` at the end of that div, after the author span:
```jsx
<div className="flex items-center flex-wrap gap-3 mb-6">
  {categoryTitle && (
    // ... existing category link
  )}
  {!!article.publishedAt && (
    // ... existing date span
  )}
  {!!(article.author as Record<string, unknown> | null)?.name && (
    // ... existing author span
  )}
  <ShareButton
    url={absoluteUrl(localePath(locale, `/blog/${slug}`))}
    title={title}
  />
</div>
```

Note: `absoluteUrl` and `localePath` are already imported in the file.

**Step 3: Verify TypeScript**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npx tsc --noEmit 2>&1 | head -20
```

**Step 4: Commit**

```bash
git add src/components/ShareButton.tsx src/app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "feat: add share button with Web Share API and clipboard fallback"
```

---

### Task 5: Push to production

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git push origin main
```

Vercel deploys automatically. After deployment (~2 min):
- Visit an article page → featured image should load
- Check the excerpt standfirst appears below the title
- Share an article URL on a messaging app → Theologik branding should appear in the preview
- Click "Teilen" → share sheet (mobile) or "Kopiert!" (desktop)

To test the OG image directly: visit `https://your-domain.com/opengraph-image`.
