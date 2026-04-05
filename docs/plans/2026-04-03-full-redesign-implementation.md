# Full Redesign Implementation Plan — Aus der Schrift

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete visual and structural redesign matching Dial In Ministries layout with manuscript/theological design spec.

**Architecture:** 5 targeted file changes — CSS tokens, ArticleCard, homepage, Header, Footer. No new dependencies.

**Tech Stack:** Next.js 16, Tailwind v4, Sanity CMS, Playfair Display + Source Serif 4 + Inter

---

## Design Tokens (reference for all tasks)

```
Background:   #F7F3EC  (Pergament/Ivory)
Foreground:   #1C1812  (Ink)
Accent:       #C4933A  (muted Gold)
Muted:        #7A7468  (warm stone gray)
Border:       #E2D9CA  (warm beige)
Surface:      #F0EBE1  (slightly darker parchment for cards)
```

---

### Task 1: Update global CSS tokens + typography

**File:** `src/app/globals.css`

Replace the entire file with:

```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Inter:wght@400;500;600&display=swap');

@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-background: #F7F3EC;
  --color-foreground: #1C1812;
  --color-accent:     #C4933A;
  --color-muted:      #7A7468;
  --color-border:     #E2D9CA;
  --color-surface:    #F0EBE1;

  --font-serif:       "Playfair Display", Georgia, serif;
  --font-body-serif:  "Source Serif 4", Georgia, serif;
  --font-sans:        Inter, system-ui, sans-serif;

  --max-width-prose: 68ch;
}

@layer base {
  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-body-serif);
  }

  /* Fine horizontal rule — manuscript-style divider */
  hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 2rem 0;
  }
}
```

Run build, commit:
```bash
git add src/app/globals.css
git commit -m "feat: update design tokens to manuscript/pergament palette"
```

---

### Task 2: Redesign ArticleCard component

**File:** `src/components/ArticleCard.tsx`

Replace entirely with editorial card style — fine border, no heavy shadow, clean typographic hierarchy:

```tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { urlFor } from "@/sanity/image";
import { formatDate, getLocalizedTitle, getLocalizedExcerpt, getLocalizedCategoryTitle } from "@/lib/utils";

interface ArticleCardProps {
  article: Record<string, unknown>;
  featured?: boolean;
  horizontal?: boolean;
}

export function ArticleCard({ article, featured = false, horizontal = false }: ArticleCardProps) {
  const locale = useLocale();
  const title = getLocalizedTitle(article, locale);
  const excerpt = getLocalizedExcerpt(article, locale);
  const category = article.category as Record<string, unknown> | null;
  const categoryTitle = getLocalizedCategoryTitle(category, locale);
  const slug = (article.slug as { current: string })?.current;
  const publishedAt = article.publishedAt as string | undefined;
  const hasImage = !!article.featuredImage;

  if (horizontal) {
    return (
      <article className="group flex gap-6 py-6 border-b border-border">
        {hasImage && (
          <Link href={`/${locale}/blog/${slug}`} className="shrink-0">
            <div className="w-32 h-24 overflow-hidden rounded-sm">
              <Image
                src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(300).url()}
                alt={title}
                width={300}
                height={200}
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </Link>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {categoryTitle && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                {categoryTitle}
              </span>
            )}
            {publishedAt && (
              <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                {formatDate(publishedAt, locale)}
              </span>
            )}
          </div>
          <Link href={`/${locale}/blog/${slug}`}>
            <h3 className="font-semibold leading-snug mb-1 group-hover:text-accent transition-colors text-base" style={{ fontFamily: "var(--font-serif)" }}>
              {title}
            </h3>
          </Link>
        </div>
      </article>
    );
  }

  if (featured) {
    return (
      <article className="group">
        <Link href={`/${locale}/blog/${slug}`}>
          {hasImage && (
            <div className="aspect-[16/7] overflow-hidden rounded-sm mb-5">
              <Image
                src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(1400).url()}
                alt={title}
                width={1400}
                height={612}
                className="object-cover w-full h-full group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          )}
          <div className="flex items-center gap-3 mb-3">
            {categoryTitle && (
              <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                {categoryTitle}
              </span>
            )}
            {publishedAt && (
              <span className="text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                {formatDate(publishedAt, locale)}
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold leading-tight mb-3 group-hover:text-accent transition-colors" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h2>
          {excerpt && (
            <p className="text-muted leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-body-serif)" }}>
              {excerpt}
            </p>
          )}
        </Link>
      </article>
    );
  }

  // Default card
  return (
    <article className="group border border-border rounded-sm bg-surface/40 hover:border-accent/40 transition-colors">
      <Link href={`/${locale}/blog/${slug}`}>
        {hasImage && (
          <div className="aspect-[16/9] overflow-hidden rounded-t-sm">
            <Image
              src={urlFor(article.featuredImage as Parameters<typeof urlFor>[0]).width(800).url()}
              alt={title}
              width={800}
              height={450}
              className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            {categoryTitle && (
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent" style={{ fontFamily: "var(--font-sans)" }}>
                {categoryTitle}
              </span>
            )}
            {publishedAt && (
              <span className="text-[11px] text-muted" style={{ fontFamily: "var(--font-sans)" }}>
                {formatDate(publishedAt, locale)}
              </span>
            )}
          </div>
          <h3 className="font-semibold leading-snug mb-2 group-hover:text-accent transition-colors" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h3>
          {excerpt && (
            <p className="text-muted text-sm leading-relaxed line-clamp-2" style={{ fontFamily: "var(--font-body-serif)" }}>
              {excerpt}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
```

Run build, commit:
```bash
git add src/components/ArticleCard.tsx
git commit -m "feat: redesign ArticleCard with editorial manuscript style"
```

---

### Task 3: Redesign Homepage (full Dial In structure)

**File:** `src/app/[locale]/page.tsx`

Structure: Hero → Divider → Featured (top 4) → Divider → Latest (6 in grid) → Footer

```tsx
import { client } from "@/sanity/client";
import { allArticlesQuery } from "@/sanity/queries";
import { ArticleCard } from "@/components/ArticleCard";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("homepage");

  let articles: Record<string, unknown>[] = [];
  try {
    articles = await client.fetch(allArticlesQuery);
  } catch {
    // empty state
  }

  const featured = articles.slice(0, 4);
  const latest = articles.slice(4, 10);

  return (
    <div>

      {/* ── Hero ── */}
      <section className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            {/* Manuscript ornament line */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 bg-border" />
              <span className="text-accent text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "var(--font-sans)" }}>
                {t("tagline")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <h1
              className="text-5xl md:text-6xl font-bold leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              Theologie<br />
              <em className="not-italic text-accent">aus der Schrift.</em>
            </h1>

            <p
              className="text-muted text-lg leading-relaxed mb-10 max-w-lg"
              style={{ fontFamily: "var(--font-body-serif)" }}
            >
              {t("subtitle")}
            </p>

            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-2.5 text-sm font-medium hover:bg-accent hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-sans)", letterSpacing: "0.05em" }}
            >
              {locale === "de" ? "Alle Artikel lesen" : "Read all articles"}
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Right: manuscript image */}
          <div className="hidden md:block relative">
            <div className="aspect-[4/5] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=85"
                alt="Altes Manuskript"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Fine border overlay — manuscript frame */}
            <div className="absolute inset-3 border border-border pointer-events-none" />
          </div>

        </div>
      </section>

      {/* ── Featured Articles ── */}
      {featured.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-16">

            {/* Section label */}
            <div className="flex items-center gap-4 mb-10">
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Empfohlen" : "Featured"}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Top: large featured */}
            <div className="mb-12">
              <ArticleCard article={featured[0]} featured />
            </div>

            {/* Bottom: 3 smaller cards */}
            {featured.slice(1, 4).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featured.slice(1, 4).map((article) => (
                  <ArticleCard key={article._id as string} article={article} />
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* ── Latest Articles ── */}
      {latest.length > 0 && (
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-16">

            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  {locale === "de" ? "Neueste Artikel" : "Latest Articles"}
                </span>
                <div className="w-16 h-px bg-border" />
              </div>
              <Link
                href={`/${locale}/blog`}
                className="text-xs text-muted hover:text-accent transition-colors flex items-center gap-1"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {locale === "de" ? "Alle ansehen" : "View all"} →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latest.map((article) => (
                <ArticleCard key={article._id as string} article={article} />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* Empty state */}
      {articles.length === 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="text-muted" style={{ fontFamily: "var(--font-sans)" }}>
            {locale === "de" ? "Noch keine Artikel veröffentlicht." : "No articles published yet."}
          </p>
        </section>
      )}

    </div>
  );
}
```

Run build, commit:
```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: restructure homepage with featured + latest sections (Dial In layout)"
```

---

### Task 4: Refine Header + Footer

**Files:**
- `src/components/Header.tsx`
- `src/app/[locale]/layout.tsx`

#### Header changes:
- Remove `bg-background/95`, use `bg-background` (solid pergament)
- Pill nav: change `hover:bg-border/70` to `hover:bg-surface`
- Add subtle bottom shadow: `shadow-sm`

#### Footer changes (in layout.tsx):
Replace the entire footer with a richer editorial footer matching the design spec:

```tsx
<footer className="border-t border-border bg-surface/50">
  {/* Main footer */}
  <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">

    {/* Col 1: Brand + mission */}
    <div className="md:col-span-1">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-accent">✦</span>
        <span className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          Aus der Schrift
        </span>
      </div>
      <p className="text-sm text-muted leading-relaxed mb-4" style={{ fontFamily: "var(--font-body-serif)" }}>
        {locale === "de"
          ? "Fundierte Theologie, Bibelauslegung und Kirchengeschichte — aus der Heiligen Schrift."
          : "Well-researched theology, biblical exegesis and church history — from Holy Scripture."}
      </p>
      <p className="text-xs text-muted/60 italic" style={{ fontFamily: "var(--font-sans)" }}>
        Soli Deo Gloria
      </p>
    </div>

    {/* Col 2: Kategorien */}
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-5" style={{ fontFamily: "var(--font-sans)" }}>
        {locale === "de" ? "Themen" : "Topics"}
      </p>
      <ul className="space-y-3">
        {[
          { de: "Theologie", en: "Theology", slug: "theologie" },
          { de: "Bibelauslegung", en: "Bible Interpretation", slug: "bibelauslegung" },
          { de: "Apologetik", en: "Apologetics", slug: "apologetik" },
          { de: "Kirchengeschichte", en: "Church History", slug: "kirchengeschichte" },
          { de: "Geistliches Leben", en: "Spiritual Life", slug: "geistliches-leben" },
        ].map((cat) => (
          <li key={cat.slug}>
            <a
              href={`/${locale}/kategorien/${cat.slug}`}
              className="text-sm text-muted hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {locale === "de" ? cat.de : cat.en}
            </a>
          </li>
        ))}
      </ul>
    </div>

    {/* Col 3: Navigation */}
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent mb-5" style={{ fontFamily: "var(--font-sans)" }}>
        Navigation
      </p>
      <ul className="space-y-3">
        {[
          { label: locale === "de" ? "Startseite" : "Home", href: `/${locale}` },
          { label: locale === "de" ? "Alle Artikel" : "All Articles", href: `/${locale}/blog` },
          { label: locale === "de" ? "Über uns" : "About", href: `/${locale}/uber-uns` },
        ].map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-sm text-muted hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

  </div>

  {/* Colophon bottom bar */}
  <div className="border-t border-border">
    <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2">
      <p className="text-[11px] text-muted/70" style={{ fontFamily: "var(--font-sans)" }}>
        © {new Date().getFullYear()} Aus der Schrift
      </p>
      <p className="text-[11px] text-muted/50 italic" style={{ fontFamily: "var(--font-body-serif)" }}>
        „Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege." — Ps 119,105
      </p>
    </div>
  </div>
</footer>
```

Run build, commit:
```bash
git add src/components/Header.tsx src/app/[locale]/layout.tsx
git commit -m "feat: refine header + editorial colophon footer with Bible verse"
```

---

### Task 5: Final push

```bash
git push
```
