# Landing Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the header, homepage, and footer of Aus der Schrift to be editorial, elegant, and modern.

**Architecture:** Three isolated file changes — Header component (server component fetching categories + client LanguageToggle), homepage page.tsx (hero split + articles grid), and footer inside layout.tsx. No new dependencies needed.

**Tech Stack:** Next.js 16, Tailwind v4, next-intl, Sanity (categories already fetched via existing `allCategoriesQuery`)

---

### Task 1: Rewrite Header

**Files:**
- Modify: `src/components/Header.tsx`

The header must be a server component (async) so it can fetch categories from Sanity.
`LanguageToggle` stays as-is (already a client component).

**Step 1: Replace Header.tsx with this code**

```tsx
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LanguageToggle } from "./LanguageToggle";
import { client } from "@/sanity/client";
import { allCategoriesQuery } from "@/sanity/queries";
import { getLocalizedCategoryTitle } from "@/lib/utils";

interface HeaderProps {
  locale: string;
}

export async function Header({ locale }: HeaderProps) {
  const t = await getTranslations("nav");

  let categories: Record<string, unknown>[] = [];
  try {
    categories = await client.fetch(allCategoriesQuery);
  } catch {
    // show header without categories if Sanity unavailable
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 shrink-0 hover:text-accent transition-colors"
        >
          <span className="text-accent text-lg leading-none">✦</span>
          <span
            className="text-lg font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Aus der Schrift
          </span>
        </Link>

        {/* Category nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {categories.map((cat) => (
            <Link
              key={cat._id as string}
              href={`/${locale}/kategorien/${(cat.slug as { current: string }).current}`}
              className="text-xs px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-border/60 transition-colors whitespace-nowrap"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {getLocalizedCategoryTitle(cat, locale)}
            </Link>
          ))}
          <Link
            href={`/${locale}/blog`}
            className="text-xs px-3 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-border/60 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("blog")}
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href={`/${locale}/uber-uns`}
            className="hidden md:block text-xs text-muted hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("about")}
          </Link>
          <LanguageToggle />
        </div>

      </div>
    </header>
  );
}
```

**Step 2: Update LanguageToggle to pill-switch style**

Replace `src/components/LanguageToggle.tsx` with:

```tsx
"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: string) {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/") || "/");
  }

  return (
    <div
      className="flex items-center rounded-full border border-border p-0.5 text-xs"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <button
        onClick={() => switchLocale("de")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          locale === "de"
            ? "bg-accent text-white font-medium"
            : "text-muted hover:text-foreground"
        }`}
      >
        DE
      </button>
      <button
        onClick={() => switchLocale("en")}
        className={`px-2.5 py-1 rounded-full transition-colors ${
          locale === "en"
            ? "bg-accent text-white font-medium"
            : "text-muted hover:text-foreground"
        }`}
      >
        EN
      </button>
    </div>
  );
}
```

**Step 3: Build check**
```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build
```
Expected: no TypeScript errors.

**Step 4: Commit**
```bash
git add src/components/Header.tsx src/components/LanguageToggle.tsx
git commit -m "feat: redesign header with category nav and language pill toggle"
```

---

### Task 2: Rewrite Homepage

**Files:**
- Modify: `src/app/[locale]/page.tsx`

**Step 1: Replace page.tsx with this code**

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

  const [featured, ...rest] = articles;
  const latest = rest.slice(0, 5);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 gap-12 items-center">

        {/* Left: text */}
        <div>
          <p
            className="text-xs uppercase tracking-[0.2em] text-accent mb-4"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t("tagline")}
          </p>
          <h1
            className="text-5xl md:text-6xl font-bold leading-tight mb-6"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Theologie<br />aus der Schrift.
          </h1>
          <p
            className="text-muted text-lg leading-relaxed mb-10 max-w-md"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            {t("subtitle")}
          </p>
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-accent/90 transition-colors"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Alle Artikel lesen
            <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Right: manuscript image */}
        <div className="relative hidden md:block">
          <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80"
              alt="Altes Manuskript"
              className="w-full h-full object-cover"
            />
          </div>
          {/* decorative accent blob */}
          <div
            className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-20 -z-10"
            style={{ background: "var(--color-accent)" }}
          />
        </div>

      </section>

      {/* ── Articles ── */}
      <section className="max-w-6xl mx-auto px-6 pb-24">

        {/* Section heading */}
        <div className="flex items-center gap-4 mb-12">
          <span
            className="text-sm uppercase tracking-widest text-muted"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Neueste Artikel
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {articles.length === 0 && (
          <p className="text-center text-muted py-12" style={{ fontFamily: "var(--font-sans)" }}>
            {locale === "de" ? "Noch keine Artikel veröffentlicht." : "No articles published yet."}
          </p>
        )}

        {/* Featured article */}
        {featured && (
          <div className="mb-12">
            <ArticleCard article={featured} featured />
          </div>
        )}

        {/* Article grid */}
        {latest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latest.map((article) => (
              <ArticleCard key={article._id as string} article={article} />
            ))}
          </div>
        )}

        {/* Show more link */}
        {articles.length > 6 && (
          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Alle {articles.length} Artikel ansehen →
            </Link>
          </div>
        )}

      </section>
    </div>
  );
}
```

**Step 2: Build check**
```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build
```
Expected: clean build.

**Step 3: Commit**
```bash
git add src/app/[locale]/page.tsx
git commit -m "feat: redesign homepage with hero split layout and articles section"
```

---

### Task 3: Rewrite Footer

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Replace the footer in layout.tsx**

Replace the existing `<footer>` block with:

```tsx
<footer className="mt-24 border-t border-border bg-background">
  <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-10">

    {/* Col 1: Logo + tagline */}
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-accent">✦</span>
        <span
          className="text-lg font-semibold"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Aus der Schrift
        </span>
      </div>
      <p
        className="text-sm text-muted leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        Fundierte Theologie aus der Heiligen Schrift.
      </p>
      <p
        className="mt-4 text-xs text-muted italic"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Soli Deo Gloria
      </p>
    </div>

    {/* Col 2: Kategorien */}
    <div>
      <p
        className="text-xs uppercase tracking-widest text-muted mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Kategorien
      </p>
      <ul className="space-y-2">
        {[
          { label: "Theologie", slug: "theologie" },
          { label: "Apologetik", slug: "apologetik" },
          { label: "Kirchengeschichte", slug: "kirchengeschichte" },
          { label: "Geistliches Leben", slug: "geistliches-leben" },
        ].map((cat) => (
          <li key={cat.slug}>
            <a
              href={`/${locale}/kategorien/${cat.slug}`}
              className="text-sm text-muted hover:text-accent transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {cat.label}
            </a>
          </li>
        ))}
      </ul>
    </div>

    {/* Col 3: Blog links */}
    <div>
      <p
        className="text-xs uppercase tracking-widest text-muted mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Blog
      </p>
      <ul className="space-y-2">
        {[
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

  {/* Bottom bar */}
  <div className="border-t border-border">
    <div
      className="max-w-6xl mx-auto px-6 py-4 text-center text-xs text-muted"
      style={{ fontFamily: "var(--font-sans)" }}
    >
      © {new Date().getFullYear()} Aus der Schrift · Soli Deo Gloria
    </div>
  </div>
</footer>
```

Note: `locale` is already available in the layout's scope.

**Step 2: Build check**
```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build
```
Expected: clean build.

**Step 3: Commit**
```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat: redesign footer with 3-column layout"
```

---

### Task 4: Final push

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && git push
```
