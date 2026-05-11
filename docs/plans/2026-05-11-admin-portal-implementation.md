# Admin Portal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Erweiterung und Redesign des bestehenden `/admin`-Portals zu einem vollständigen akademischen Redaktionstool mit Quellen-Manager, Ideen-Board, verbessertem Editor und elegantem Design.

**Architecture:** Das bestehende Passwort-Cookie-Auth-System bleibt unverändert. Die Admin-UI wird mit einer Sidebar-Navigation neu strukturiert. Neue Sanity-Schemas (source, idea) und API-Routen werden nach dem gleichen Muster wie die bestehenden gebaut.

**Tech Stack:** Next.js 16 (App Router), TipTap 3, Sanity 5, TailwindCSS 4, Cookie-Auth

---

## Task 1: Login-Icon im Haupt-Header

**Files:**
- Modify: `src/components/Header.tsx`

**Step 1: Login-Icon rechts im Header einfügen**

In `src/components/Header.tsx` den rechten Bereich (Zeile 104–114) erweitern. Das Icon ist ein kleines SVG-Schloss, das zu `/admin` verlinkt und nur sichtbar ist wenn man drüber fährt:

```tsx
{/* Right side */}
<div className="flex items-center gap-3 shrink-0">
  <Link
    href={`/${locale}/kontakt`}
    className="hidden md:inline-flex items-center text-xs px-4 py-1.5 rounded-full border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
    style={{ fontFamily: "var(--font-sans)" }}
  >
    Kontakt
  </Link>
  <DarkModeToggle />
  <LanguageToggle />
  {/* Admin-Zugang */}
  <Link
    href="/admin"
    className="text-muted hover:text-foreground transition-colors opacity-40 hover:opacity-100"
    aria-label="Admin"
    title="Admin"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  </Link>
</div>
```

**Step 2: Prüfen**

```bash
npm run dev
```
Öffne `http://localhost:3000/de` — rechts neben dem Language-Toggle sollte ein dezentes Schloss-Icon erscheinen. Klick führt zu `/admin` (Login wenn nicht eingeloggt).

**Step 3: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat: add subtle admin login icon to main header"
```

---

## Task 2: Admin-Layout Redesign (Sidebar + Mobile-Tabs)

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Create: `src/components/admin/AdminNav.tsx`
- Create: `src/components/admin/AdminMobileNav.tsx`

**Step 1: AdminNav Sidebar-Komponente erstellen**

Erstelle `src/components/admin/AdminNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/admin/artikel", label: "Artikel", icon: "✍️" },
  { href: "/admin/quellen", label: "Quellen", icon: "📚" },
  { href: "/admin/ideen", label: "Ideen", icon: "💡" },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/admin/login";
  }

  return (
    <aside className="hidden md:flex flex-col w-52 shrink-0 min-h-screen border-r border-[var(--color-border)] bg-[var(--color-background)] pt-8 pb-6 px-3">
      <div className="mb-8 px-3">
        <span className="font-serif text-sm font-semibold text-[var(--color-foreground)] opacity-60 tracking-wide uppercase">
          Theologik
        </span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive(item.href, item.exact)
                ? "bg-[var(--color-accent)] text-white font-medium"
                : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="px-3 mt-4 border-t border-[var(--color-border)] pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface)] transition-colors"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className="text-base">↩</span>
          Ausloggen
        </button>
      </div>
    </aside>
  );
}
```

**Step 2: Mobile Tab-Leiste erstellen**

Erstelle `src/components/admin/AdminMobileNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "⊞", exact: true },
  { href: "/admin/artikel", label: "Artikel", icon: "✍️" },
  { href: "/admin/quellen", label: "Quellen", icon: "📚" },
  { href: "/admin/ideen", label: "Ideen", icon: "💡" },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-background)] border-t border-[var(--color-border)] flex">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
            isActive(item.href, item.exact)
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)]"
          }`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <span className="text-xl leading-none">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

**Step 3: Admin-Layout neu aufbauen**

Ersetze `src/app/admin/layout.tsx` komplett:

```tsx
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <AdminNav />
      <div className="flex-1 flex flex-col min-h-screen">
        <main className="flex-1 px-6 py-8 pb-24 md:pb-8 max-w-4xl w-full mx-auto">
          {children}
        </main>
      </div>
      <AdminMobileNav />
    </div>
  );
}
```

**Step 4: Prüfen**

```bash
npm run dev
```
Navigiere zu `http://localhost:3000/admin`. Auf Desktop: linke Sidebar mit 4 Navpunkten. Auf Handy (DevTools → Mobile): untere Tab-Leiste.

**Step 5: Commit**

```bash
git add src/app/admin/layout.tsx src/components/admin/AdminNav.tsx src/components/admin/AdminMobileNav.tsx
git commit -m "feat: redesign admin layout with sidebar and mobile tab bar"
```

---

## Task 3: Artikel-Bereich unter /admin/artikel

Die bestehenden Artikel-Seiten liegen unter `/admin` (Dashboard) und `/admin/neu`, `/admin/[slug]`. Wir verschieben nicht, sondern erstellen `/admin/artikel` als neue Listenansicht.

**Files:**
- Create: `src/app/admin/artikel/page.tsx`
- Create: `src/app/admin/artikel/neu/page.tsx` (redirect zu `/admin/neu`)

**Step 1: Artikel-Listenseite erstellen**

Erstelle `src/app/admin/artikel/page.tsx`:

```tsx
import Link from "next/link";
import { client } from "@/sanity/client";

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
  idea:      { label: "Idee",          color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  draft:     { label: "Entwurf",       color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" },
  ready:     { label: "Bereit",        color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  published: { label: "Veröffentlicht", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  archived:  { label: "Archiviert",    color: "bg-[var(--color-surface)] text-[var(--color-muted)]" },
};

export default async function ArtikelPage() {
  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, language, status,
      "category": category->{ titleDe }
    }
  `);

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

      {articles.length === 0 && (
        <p className="text-[var(--color-muted)] text-sm" style={{ fontFamily: "var(--font-sans)" }}>
          Noch keine Artikel vorhanden.
        </p>
      )}

      <div className="space-y-2">
        {articles.map((article) => {
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
                  {new Date(article.publishedAt).toLocaleDateString("de-DE")} ·{" "}
                  <span className="uppercase">{article.language}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.color}`} style={{ fontFamily: "var(--font-sans)" }}>
                  {badge.label}
                </span>
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

**Step 2: Prüfen**

```bash
npm run dev
```
Navigiere zu `http://localhost:3000/admin/artikel` — die Artikelliste erscheint mit Status-Badges.

**Step 3: Commit**

```bash
git add src/app/admin/artikel/page.tsx
git commit -m "feat: add artikel list page with status badges"
```

---

## Task 4: Sanity Schema — Status-Feld für Artikel

**Files:**
- Modify: `src/sanity/schemas/article.ts`

**Step 1: Status-Feld hinzufügen**

In `src/sanity/schemas/article.ts` nach dem `language`-Feld (Zeile 76) einfügen:

```ts
defineField({
  name: "status",
  title: "Status",
  type: "string",
  options: {
    list: [
      { title: "Idee", value: "idea" },
      { title: "Entwurf", value: "draft" },
      { title: "Bereit", value: "ready" },
      { title: "Veröffentlicht", value: "published" },
      { title: "Archiviert", value: "archived" },
    ],
    layout: "radio",
  },
  initialValue: "draft",
  validation: (r) => r.required(),
}),
```

**Step 2: Prüfen**

```bash
npm run build
```
Keine TypeScript-Fehler.

**Step 3: Commit**

```bash
git add src/sanity/schemas/article.ts
git commit -m "feat: add status field to article schema"
```

---

## Task 5: Sanity Schema — Source (Quellen)

**Files:**
- Create: `src/sanity/schemas/source.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Source-Schema erstellen**

Erstelle `src/sanity/schemas/source.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "source",
  title: "Quelle",
  type: "document",
  fields: [
    defineField({
      name: "type",
      title: "Typ",
      type: "string",
      options: {
        list: [
          { title: "Buch", value: "book" },
          { title: "Zeitschriftenartikel", value: "journal" },
          { title: "Website", value: "website" },
          { title: "Bibelausgabe", value: "bible" },
        ],
        layout: "radio",
      },
      initialValue: "book",
      validation: (r) => r.required(),
    }),
    defineField({ name: "authors", title: "Autor(en)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", title: "Jahr", type: "number", validation: (r) => r.required() }),
    defineField({ name: "publisher", title: "Verlag / Zeitschrift", type: "string" }),
    defineField({ name: "doi", title: "DOI", type: "string" }),
    defineField({ name: "isbn", title: "ISBN", type: "string" }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({ name: "pages", title: "Seiten", type: "string" }),
    defineField({ name: "notes", title: "Eigene Notizen", type: "text", rows: 4 }),
    defineField({ name: "fileLink", title: "Link zur Datei (Google Drive, JSTOR etc.)", type: "url" }),
  ],
  preview: {
    select: { title: "title", subtitle: "authors" },
  },
});
```

**Step 2: Schema registrieren**

Ersetze `src/sanity/schemas/index.ts`:

```ts
import article from "./article";
import category from "./category";
import author from "./author";
import source from "./source";
import idea from "./idea";

export const schemaTypes = [article, category, author, source, idea];
```

Hinweis: `idea` wird in Task 6 erstellt. Wenn Task 5 zuerst committed wird, erst nur `source` hinzufügen:

```ts
export const schemaTypes = [article, category, author, source];
```

**Step 3: Prüfen**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add src/sanity/schemas/source.ts src/sanity/schemas/index.ts
git commit -m "feat: add source schema to Sanity"
```

---

## Task 6: Sanity Schema — Idea (Ideen)

**Files:**
- Create: `src/sanity/schemas/idea.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Idea-Schema erstellen**

Erstelle `src/sanity/schemas/idea.ts`:

```ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "idea",
  title: "Idee",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "notes", title: "Gedanken / Notizen", type: "text", rows: 5 }),
    defineField({
      name: "createdAt",
      title: "Erstellt am",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "notes" },
  },
});
```

**Step 2: Schema registrieren**

Aktualisiere `src/sanity/schemas/index.ts`:

```ts
import article from "./article";
import category from "./category";
import author from "./author";
import source from "./source";
import idea from "./idea";

export const schemaTypes = [article, category, author, source, idea];
```

**Step 3: Commit**

```bash
git add src/sanity/schemas/idea.ts src/sanity/schemas/index.ts
git commit -m "feat: add idea schema to Sanity"
```

---

## Task 7: API-Routen — Quellen

**Files:**
- Create: `src/app/api/admin/sources/route.ts`
- Create: `src/app/api/admin/sources/[id]/route.ts`

**Step 1: Sources-Listenroute erstellen**

Erstelle `src/app/api/admin/sources/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const sources = await client.fetch(`
    *[_type == "source"] | order(authors asc) {
      _id, type, authors, title, year, publisher, doi, isbn, url, pages, notes, fileLink
    }
  `);
  return NextResponse.json(sources);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "source", ...body });
  return NextResponse.json(doc, { status: 201 });
}
```

**Step 2: Source-Einzelroute erstellen**

Erstelle `src/app/api/admin/sources/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const doc = await writeClient.patch(id).set(body).commit();
  return NextResponse.json(doc);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  await writeClient.delete(id);
  return NextResponse.json({ ok: true });
}
```

**Step 3: Commit**

```bash
git add src/app/api/admin/sources/route.ts src/app/api/admin/sources/[id]/route.ts
git commit -m "feat: add sources API routes"
```

---

## Task 8: API-Routen — Ideen

**Files:**
- Create: `src/app/api/admin/ideas/route.ts`
- Create: `src/app/api/admin/ideas/[id]/route.ts`

**Step 1: Ideas-Listenroute erstellen**

Erstelle `src/app/api/admin/ideas/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const denied = await requireAuth();
  if (denied) return denied;

  const ideas = await client.fetch(`
    *[_type == "idea"] | order(createdAt desc) {
      _id, title, notes, createdAt
    }
  `);
  return NextResponse.json(ideas);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({
    _type: "idea",
    ...body,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(doc, { status: 201 });
}
```

**Step 2: Idea-Einzelroute erstellen**

Erstelle `src/app/api/admin/ideas/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json();
  const doc = await writeClient.patch(id).set(body).commit();
  return NextResponse.json(doc);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  await writeClient.delete(id);
  return NextResponse.json({ ok: true });
}
```

**Step 3: Commit**

```bash
git add src/app/api/admin/ideas/route.ts src/app/api/admin/ideas/[id]/route.ts
git commit -m "feat: add ideas API routes"
```

---

## Task 9: API-Route — DOI-Lookup

**Files:**
- Create: `src/app/api/admin/doi-lookup/route.ts`

**Step 1: DOI-Lookup-Route erstellen**

Erstelle `src/app/api/admin/doi-lookup/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const doi = request.nextUrl.searchParams.get("doi");
  if (!doi) return NextResponse.json({ error: "DOI required" }, { status: 400 });

  try {
    const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
      headers: { "User-Agent": "Theologik/1.0 (mailto:admin@theologik.org)" },
    });
    if (!res.ok) return NextResponse.json({ error: "DOI not found" }, { status: 404 });

    const data = await res.json();
    const w = data.message;

    const authors = (w.author ?? [])
      .map((a: { family?: string; given?: string }) =>
        [a.family, a.given].filter(Boolean).join(", ")
      )
      .join("; ");

    const year =
      w.published?.["date-parts"]?.[0]?.[0] ??
      w["published-print"]?.["date-parts"]?.[0]?.[0] ??
      null;

    return NextResponse.json({
      title: w.title?.[0] ?? "",
      authors,
      year,
      publisher: w.publisher ?? w["container-title"]?.[0] ?? "",
      doi,
      type: w.type === "journal-article" ? "journal" : "book",
    });
  } catch {
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
```

**Step 2: Commit**

```bash
git add src/app/api/admin/doi-lookup/route.ts
git commit -m "feat: add DOI lookup API route via CrossRef"
```

---

## Task 10: Dashboard redesignen

**Files:**
- Modify: `src/app/admin/page.tsx`

**Step 1: Dashboard-Seite neu aufbauen**

Ersetze `src/app/admin/page.tsx` komplett:

```tsx
import Link from "next/link";
import { client } from "@/sanity/client";

async function getDashboardData() {
  const [articles, sources, ideas] = await Promise.all([
    client.fetch(`*[_type == "article"] | order(publishedAt desc)[0...5] {
      _id, titleDe, slug, publishedAt, status
    }`),
    client.fetch(`count(*[_type == "source"])`),
    client.fetch(`count(*[_type == "idea"])`),
  ]);
  const totalArticles = await client.fetch(`count(*[_type == "article"])`);
  const drafts = await client.fetch(`count(*[_type == "article" && status in ["draft", "idea"]])`);
  return { articles, totalArticles, drafts, sources, ideas };
}

const STATUS_COLOR: Record<string, string> = {
  idea:      "bg-purple-100 text-purple-700",
  draft:     "bg-yellow-100 text-yellow-700",
  ready:     "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  archived:  "bg-[var(--color-surface)] text-[var(--color-muted)]",
};
const STATUS_LABEL: Record<string, string> = {
  idea: "Idee", draft: "Entwurf", ready: "Bereit",
  published: "Veröffentlicht", archived: "Archiviert",
};

export default async function AdminDashboard() {
  const { articles, totalArticles, drafts, sources, ideas } = await getDashboardData();

  const stats = [
    { label: "Artikel gesamt", value: totalArticles, href: "/admin/artikel" },
    { label: "Entwürfe", value: drafts, href: "/admin/artikel" },
    { label: "Quellen", value: sources, href: "/admin/quellen" },
    { label: "Ideen", value: ideas, href: "/admin/ideen" },
  ];

  const quickActions = [
    { label: "Neuer Artikel", href: "/admin/neu", icon: "✍️" },
    { label: "Neue Quelle", href: "/admin/quellen/neu", icon: "📚" },
    { label: "Neue Idee", href: "/admin/ideen/neu", icon: "💡" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <p className="text-2xl font-semibold text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-sans)" }}>{s.value}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-serif text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Schnellzugriff</h2>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <span>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Zuletzt bearbeitet */}
      <div>
        <h2 className="font-serif text-sm font-semibold text-[var(--color-muted)] uppercase tracking-wide mb-3">Zuletzt bearbeitet</h2>
        <div className="space-y-2">
          {articles.map((a: { _id: string; titleDe: string; slug: { current: string }; publishedAt: string; status?: string }) => {
            const st = a.status ?? "published";
            return (
              <Link
                key={a._id}
                href={`/admin/${a.slug.current}`}
                className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-3 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
              >
                <p className="text-sm font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)]" style={{ fontFamily: "var(--font-sans)" }}>
                  {a.titleDe}
                </p>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[st] ?? STATUS_COLOR.published}`} style={{ fontFamily: "var(--font-sans)" }}>
                    {STATUS_LABEL[st] ?? st}
                  </span>
                  <span className="text-[var(--color-muted)] text-xs" style={{ fontFamily: "var(--font-sans)" }}>
                    {new Date(a.publishedAt).toLocaleDateString("de-DE")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Prüfen**

```bash
npm run dev
```
Navigiere zu `http://localhost:3000/admin` — Dashboard mit 4 Stat-Karten, Schnellzugriff, zuletzt bearbeitete Artikel.

**Step 3: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: redesign admin dashboard with stats and quick actions"
```

---

## Task 11: Quellen-Manager UI

**Files:**
- Create: `src/app/admin/quellen/page.tsx`
- Create: `src/app/admin/quellen/neu/page.tsx`
- Create: `src/app/admin/quellen/[id]/page.tsx`

**Step 1: Quellen-Listenseite erstellen**

Erstelle `src/app/admin/quellen/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Source {
  _id: string;
  type: string;
  authors: string;
  title: string;
  year: number;
  publisher?: string;
  notes?: string;
}

const TYPE_ICON: Record<string, string> = {
  book: "📖", journal: "📄", website: "🌐", bible: "✝️",
};
const TYPE_LABEL: Record<string, string> = {
  book: "Buch", journal: "Artikel", website: "Website", bible: "Bibel",
};

export default function QuellenPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/sources")
      .then((r) => r.json())
      .then((data) => { setSources(data); setLoading(false); });
  }, []);

  const filtered = sources.filter((s) =>
    `${s.title} ${s.authors}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Quellen</h1>
        <Link
          href="/admin/quellen/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neue Quelle
        </Link>
      </div>

      <input
        type="search"
        placeholder="Suche nach Titel oder Autor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-2.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"
        style={{ fontFamily: "var(--font-sans)" }}
      />

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {filtered.map((s) => (
          <Link
            key={s._id}
            href={`/admin/quellen/${s._id}`}
            className="flex items-start gap-4 bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors group"
          >
            <span className="text-xl leading-none mt-0.5">{TYPE_ICON[s.type] ?? "📄"}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] text-sm leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
                {s.title}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {s.authors} · {s.year} · {TYPE_LABEL[s.type] ?? s.type}
              </p>
              {s.notes && (
                <p className="text-xs text-[var(--color-muted)] mt-1 line-clamp-1 italic" style={{ fontFamily: "var(--font-sans)" }}>
                  {s.notes}
                </p>
              )}
            </div>
            <span className="text-[var(--color-muted)] text-sm shrink-0">→</span>
          </Link>
        ))}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Keine Quellen gefunden.
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Neue Quelle Formular erstellen**

Erstelle `src/app/admin/quellen/neu/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const EMPTY = {
  type: "book",
  authors: "",
  title: "",
  year: new Date().getFullYear(),
  publisher: "",
  doi: "",
  isbn: "",
  url: "",
  pages: "",
  notes: "",
  fileLink: "",
};

export default function NeueQuelleePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [doiLoading, setDoiLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field: string, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  async function lookupDoi() {
    if (!form.doi) return;
    setDoiLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/doi-lookup?doi=${encodeURIComponent(form.doi)}`);
      if (!res.ok) { setError("DOI nicht gefunden."); return; }
      const data = await res.json();
      setForm((f) => ({
        ...f,
        title: data.title || f.title,
        authors: data.authors || f.authors,
        year: data.year || f.year,
        publisher: data.publisher || f.publisher,
        type: data.type || f.type,
      }));
    } catch {
      setError("DOI-Lookup fehlgeschlagen.");
    } finally {
      setDoiLoading(false);
    }
  }

  async function save() {
    if (!form.title || !form.authors || !form.year) {
      setError("Titel, Autor und Jahr sind Pflichtfelder.");
      return;
    }
    setSaving(true);
    await fetch("/api/admin/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/quellen");
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";
  const labelClass = "block text-xs font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neue Quelle</h1>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg" style={{ fontFamily: "var(--font-sans)" }}>
          {error}
        </p>
      )}

      {/* DOI Lookup */}
      <div className="mb-6 p-4 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
        <p className="text-xs font-medium text-[var(--color-muted)] mb-2" style={{ fontFamily: "var(--font-sans)" }}>
          DOI-Schnellimport (optional)
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="z.B. 10.1234/example"
            value={form.doi}
            onChange={(e) => set("doi", e.target.value)}
            className={inputClass + " flex-1"}
            style={{ fontFamily: "var(--font-sans)" }}
          />
          <button
            onClick={lookupDoi}
            disabled={doiLoading || !form.doi}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {doiLoading ? "..." : "Laden"}
          </button>
        </div>
      </div>

      <div className="space-y-4" style={{ fontFamily: "var(--font-sans)" }}>
        {/* Typ */}
        <div>
          <label className={labelClass}>Typ *</label>
          <select
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className={inputClass}
          >
            <option value="book">Buch</option>
            <option value="journal">Zeitschriftenartikel</option>
            <option value="website">Website</option>
            <option value="bible">Bibelausgabe</option>
          </select>
        </div>

        {/* Autor + Titel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Autor(en) *</label>
            <input type="text" placeholder="Pannenberg, Wolfhart" value={form.authors} onChange={(e) => set("authors", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jahr *</label>
            <input type="number" placeholder="1988" value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Titel *</label>
          <input type="text" placeholder="Systematische Theologie Bd. 1" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Verlag / Zeitschrift</label>
            <input type="text" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Seiten</label>
            <input type="text" placeholder="143–158" value={form.pages} onChange={(e) => set("pages", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>ISBN</label>
            <input type="text" value={form.isbn} onChange={(e) => set("isbn", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>URL</label>
            <input type="url" value={form.url} onChange={(e) => set("url", e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Link zur Datei (Google Drive, JSTOR etc.)</label>
          <input type="url" value={form.fileLink} onChange={(e) => set("fileLink", e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Eigene Notizen</label>
          <textarea
            rows={4}
            placeholder="Wichtige Argumente, Seitenverweise, Gedanken..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={inputClass + " resize-none"}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Quelle speichern"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Quelle bearbeiten/löschen**

Erstelle `src/app/admin/quellen/[id]/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

interface Source {
  _id: string;
  type: string;
  authors: string;
  title: string;
  year: number;
  publisher?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  pages?: string;
  notes?: string;
  fileLink?: string;
}

export default function QuelleEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [form, setForm] = useState<Source | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/sources")
      .then((r) => r.json())
      .then((sources: Source[]) => {
        const s = sources.find((s) => s._id === id);
        if (s) setForm(s);
      });
  }, [id]);

  const set = (field: string, value: string | number) =>
    setForm((f) => f ? { ...f, [field]: value } : f);

  async function save() {
    if (!form) return;
    setSaving(true);
    await fetch(`/api/admin/sources/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    router.push("/admin/quellen");
  }

  async function remove() {
    if (!confirm("Quelle wirklich löschen?")) return;
    setDeleting(true);
    await fetch(`/api/admin/sources/${id}`, { method: "DELETE" });
    router.push("/admin/quellen");
  }

  if (!form) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)]";
  const labelClass = "block text-xs font-medium text-[var(--color-muted)] mb-1";

  return (
    <div className="max-w-2xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Quelle bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className={labelClass}>Typ</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputClass}>
            <option value="book">Buch</option>
            <option value="journal">Zeitschriftenartikel</option>
            <option value="website">Website</option>
            <option value="bible">Bibelausgabe</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Autor(en)</label>
            <input type="text" value={form.authors} onChange={(e) => set("authors", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Jahr</label>
            <input type="number" value={form.year} onChange={(e) => set("year", parseInt(e.target.value))} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Titel</label>
          <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Verlag / Zeitschrift</label>
            <input type="text" value={form.publisher ?? ""} onChange={(e) => set("publisher", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Seiten</label>
            <input type="text" value={form.pages ?? ""} onChange={(e) => set("pages", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>DOI</label>
            <input type="text" value={form.doi ?? ""} onChange={(e) => set("doi", e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>ISBN</label>
            <input type="text" value={form.isbn ?? ""} onChange={(e) => set("isbn", e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>URL</label>
          <input type="url" value={form.url ?? ""} onChange={(e) => set("url", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Link zur Datei</label>
          <input type="url" value={form.fileLink ?? ""} onChange={(e) => set("fileLink", e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Eigene Notizen</label>
          <textarea rows={4} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} className={inputClass + " resize-none"} />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button onClick={save} disabled={saving} className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
          <button onClick={remove} disabled={deleting} className="ml-auto px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            {deleting ? "..." : "Löschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Prüfen**

```bash
npm run dev
```
Navigiere zu `http://localhost:3000/admin/quellen` — Quellenliste erscheint. Klick auf "+ Neue Quelle" → Formular mit DOI-Lookup. DOI eingeben und "Laden" klicken → Felder füllen sich.

**Step 5: Commit**

```bash
git add src/app/admin/quellen/
git commit -m "feat: add sources manager (list, create, edit, delete, DOI lookup)"
```

---

## Task 12: Ideen-Board UI

**Files:**
- Create: `src/app/admin/ideen/page.tsx`
- Create: `src/app/admin/ideen/neu/page.tsx`

**Step 1: Ideen-Board Seite erstellen**

Erstelle `src/app/admin/ideen/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Idea {
  _id: string;
  title: string;
  notes?: string;
  createdAt: string;
}

export default function IdeenPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ideas")
      .then((r) => r.json())
      .then((data) => { setIdeas(data); setLoading(false); });
  }, []);

  async function toEntwurf(idea: Idea) {
    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleDe: idea.title,
        titleEn: "",
        slug: { _type: "slug", current: idea.title.toLowerCase().replace(/\s+/g, "-").replace(/[äöü]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue" }[c] ?? c)) },
        status: "idea",
        language: "de",
        publishedAt: new Date().toISOString(),
      }),
    });
    const article = await res.json();
    router.push(`/admin/${article.slug.current}`);
  }

  async function deleteIdea(id: string) {
    if (!confirm("Idee löschen?")) return;
    await fetch(`/api/admin/ideas/${id}`, { method: "DELETE" });
    setIdeas((prev) => prev.filter((i) => i._id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Ideen</h1>
        <Link
          href="/admin/ideen/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neue Idee
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ideas.map((idea) => (
          <div
            key={idea._id}
            className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)] flex flex-col gap-3"
          >
            <p className="font-medium text-[var(--color-foreground)] text-sm leading-snug" style={{ fontFamily: "var(--font-sans)" }}>
              {idea.title}
            </p>
            {idea.notes && (
              <p className="text-xs text-[var(--color-muted)] leading-relaxed line-clamp-3" style={{ fontFamily: "var(--font-sans)" }}>
                {idea.notes}
              </p>
            )}
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--color-border)]">
              <button
                onClick={() => toEntwurf(idea)}
                className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Zu Entwurf machen →
              </button>
              <button
                onClick={() => deleteIdea(idea._id)}
                className="text-xs px-3 py-1.5 rounded-lg text-[var(--color-muted)] hover:text-red-500 transition-colors ml-auto"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && ideas.length === 0 && (
          <p className="text-sm text-[var(--color-muted)] col-span-2" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Ideen. Füge deine erste Idee hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Neue Idee Formular**

Erstelle `src/app/admin/ideen/neu/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NeueIdeePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!title.trim()) return;
    setSaving(true);
    await fetch("/api/admin/ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), notes: notes.trim() }),
    });
    router.push("/admin/ideen");
  }

  const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neue Idee</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input
            type="text"
            placeholder="Worum geht es?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Gedanken / Notizen</label>
          <textarea
            rows={6}
            placeholder="Erste Gedanken, Kernthesen, offene Fragen..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputClass + " resize-none"}
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving || !title.trim()}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Idee speichern"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Prüfen**

```bash
npm run dev
```
Navigiere zu `http://localhost:3000/admin/ideen` — Karten-Grid. "+ Neue Idee" → Formular. Idee speichern → erscheint als Karte. "Zu Entwurf machen" → neuer Artikel im Editor.

**Step 4: Commit**

```bash
git add src/app/admin/ideen/
git commit -m "feat: add ideas board with create, delete, and convert-to-draft"
```

---

## Task 13: Auto-Save & Status-Feld im Artikel-Editor

**Files:**
- Modify: `src/app/admin/neu/page.tsx`
- Modify: `src/app/admin/[slug]/page.tsx`

**Step 1: Status-Dropdown zu beiden Editor-Seiten hinzufügen**

In `src/app/admin/neu/page.tsx` und `src/app/admin/[slug]/page.tsx` das Formular um ein Status-Feld erweitern.

In beiden Dateien: nach dem `language`-Feld im Formular einfügen:

```tsx
{/* Status */}
<div>
  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
  <select
    value={form.status ?? "draft"}
    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm"
  >
    <option value="idea">Idee</option>
    <option value="draft">Entwurf</option>
    <option value="ready">Bereit</option>
    <option value="published">Veröffentlicht</option>
    <option value="archived">Archiviert</option>
  </select>
</div>
```

Und den `form`-State erweitern um `status: "draft"` als Standardwert.

**Step 2: Wortanzahl + Lesezeit im Editor anzeigen**

In `src/components/admin/TiptapEditor.tsx` nach dem Editor-Content einen Stats-Balken hinzufügen.

Lese zuerst die Datei um die genaue Stelle zu identifizieren:

```bash
# Lese die Datei:
cat src/components/admin/TiptapEditor.tsx
```

Dann nach dem `<EditorContent editor={editor} />` Block einfügen:

```tsx
{/* Stats */}
{editor && (
  <div className="flex items-center gap-4 px-4 py-2 border-t border-stone-200 text-xs text-stone-400">
    {(() => {
      const text = editor.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const minutes = Math.ceil(words / 200);
      return (
        <>
          <span>{words} Wörter</span>
          <span>~{minutes} Min. Lesezeit</span>
        </>
      );
    })()}
  </div>
)}
```

**Step 3: Commit**

```bash
git add src/app/admin/neu/page.tsx src/app/admin/[slug]/page.tsx src/components/admin/TiptapEditor.tsx
git commit -m "feat: add status field to article editor and word count/reading time display"
```

---

## Task 14: Build & Deploy-Check

**Step 1: Build prüfen**

```bash
npm run build
```

Alle TypeScript-Fehler beheben. Häufige Probleme:
- `params` muss `await`-ed werden (Next.js 16): `const { id } = await params`
- CSS-Variablen in `className` müssen als String funktionieren

**Step 2: Produktions-Deployment**

Das Projekt auf Vercel deployen (falls noch nicht konfiguriert):

```bash
npx vercel --prod
```

Oder via Git-Push wenn Vercel-Integration besteht:

```bash
git push origin main
```

**Step 3: Online-Zugang prüfen**

- `https://www.theologik.org` öffnen → Schloss-Icon rechts im Header prüfen
- `https://www.theologik.org/admin` → Login-Formular erscheint
- Einloggen → Dashboard mit Sidebar erscheint
- Auf Handy navigieren → untere Tab-Leiste erscheint

---

## Zusammenfassung

| Task | Feature | Dateien |
|------|---------|---------|
| 1 | Login-Icon im Header | `Header.tsx` |
| 2 | Sidebar + Mobile-Tabs | `AdminNav.tsx`, `AdminMobileNav.tsx`, `layout.tsx` |
| 3 | Artikel-Liste mit Status-Badges | `admin/artikel/page.tsx` |
| 4 | Status-Feld in Sanity | `schemas/article.ts` |
| 5 | Source-Schema | `schemas/source.ts` |
| 6 | Idea-Schema | `schemas/idea.ts` |
| 7 | Sources API | `api/admin/sources/` |
| 8 | Ideas API | `api/admin/ideas/` |
| 9 | DOI-Lookup API | `api/admin/doi-lookup/` |
| 10 | Dashboard Redesign | `admin/page.tsx` |
| 11 | Quellen-Manager UI | `admin/quellen/` |
| 12 | Ideen-Board UI | `admin/ideen/` |
| 13 | Status + Wortanzahl im Editor | `neu/page.tsx`, `[slug]/page.tsx`, `TiptapEditor.tsx` |
| 14 | Build & Deploy | — |
