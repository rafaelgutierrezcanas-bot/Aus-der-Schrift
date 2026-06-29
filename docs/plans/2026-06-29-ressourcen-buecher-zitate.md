# Ressourcen: Bücher & Zitate — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Public filterable book recommendations and quotes section on `/ressourcen`, managed via the custom admin portal.

**Architecture:** Two new Sanity schemas (`bookRecommendation`, `quote`) with full admin CRUD pages and API routes following existing patterns (like `ideen`/`ideas`). Public page fetches data server-side, passes to a client component for tab-switching and filtering.

**Tech Stack:** Next.js 15 App Router, Sanity CMS, TypeScript, Tailwind CSS v4 with CSS variables, `@sanity/client` writeClient

---

## Shared context

**Existing patterns to follow exactly:**
- Admin list page: `src/app/admin/ideen/page.tsx` — `"use client"`, fetch in `useEffect`, `useState` for list
- Admin new page: `src/app/admin/ideen/neu/page.tsx` — `"use client"`, `useState` per field, POST to API, redirect on save
- Admin API (collection): `src/app/api/admin/ideas/route.ts` — `requireAuth()`, GET + POST
- Admin API (single item): `src/app/api/admin/articles/[slug]/route.ts` — GET, PATCH, DELETE
- Sanity schema: `src/sanity/schemas/idea.ts` — `defineField` / `defineType`
- CSS variables: `--color-foreground`, `--color-muted`, `--color-accent`, `--color-surface`, `--color-border`
- Input class pattern: `"w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]"`

**Topic options** (used in both schemas and forms):
```
theologie, apologetik, bibelauslegung, kirchengeschichte, geistliches-leben
```

**Difficulty options** (books only):
```
einsteiger, mittel, fortgeschritten
```

---

## Task 1: Sanity schemas + shared constants

**Files:**
- Create: `src/sanity/schemas/bookRecommendation.ts`
- Create: `src/sanity/schemas/quote.ts`
- Create: `src/lib/ressourcen.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create shared constants**

```ts
// src/lib/ressourcen.ts
export const TOPIC_OPTIONS = [
  { label: "Theologie", value: "theologie" },
  { label: "Apologetik", value: "apologetik" },
  { label: "Bibelauslegung", value: "bibelauslegung" },
  { label: "Kirchengeschichte", value: "kirchengeschichte" },
  { label: "Geistliches Leben", value: "geistliches-leben" },
] as const;

export const DIFFICULTY_OPTIONS = [
  { label: "Einsteiger", value: "einsteiger" },
  { label: "Mittel", value: "mittel" },
  { label: "Fortgeschritten", value: "fortgeschritten" },
] as const;

export type TopicValue = typeof TOPIC_OPTIONS[number]["value"];
export type DifficultyValue = typeof DIFFICULTY_OPTIONS[number]["value"];
```

**Step 2: Create bookRecommendation schema**

```ts
// src/sanity/schemas/bookRecommendation.ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "bookRecommendation",
  title: "Buchempfehlung",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Titel", type: "string", validation: (r) => r.required() }),
    defineField({ name: "author", title: "Autor(en)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "year", title: "Jahr", type: "number" }),
    defineField({ name: "coverImage", title: "Cover", type: "image", options: { hotspot: true } }),
    defineField({
      name: "description",
      title: "Kurzbeschreibung",
      type: "text",
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "difficulty",
      title: "Schwierigkeitsgrad",
      type: "string",
      options: {
        list: [
          { title: "Einsteiger", value: "einsteiger" },
          { title: "Mittel", value: "mittel" },
          { title: "Fortgeschritten", value: "fortgeschritten" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "topics",
      title: "Themen",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Theologie", value: "theologie" },
          { title: "Apologetik", value: "apologetik" },
          { title: "Bibelauslegung", value: "bibelauslegung" },
          { title: "Kirchengeschichte", value: "kirchengeschichte" },
          { title: "Geistliches Leben", value: "geistliches-leben" },
        ],
        layout: "grid",
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "buyLink", title: "Kauflink", type: "url" }),
  ],
  preview: {
    select: { title: "title", subtitle: "author", media: "coverImage" },
  },
});
```

**Step 3: Create quote schema**

```ts
// src/sanity/schemas/quote.ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "quote",
  title: "Zitat",
  type: "document",
  fields: [
    defineField({
      name: "text",
      title: "Zitattext",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({ name: "author", title: "Autor", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "source",
      title: "Quelle (Buchempfehlung)",
      type: "reference",
      to: [{ type: "bookRecommendation" }],
    }),
    defineField({
      name: "topics",
      title: "Themen",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Theologie", value: "theologie" },
          { title: "Apologetik", value: "apologetik" },
          { title: "Bibelauslegung", value: "bibelauslegung" },
          { title: "Kirchengeschichte", value: "kirchengeschichte" },
          { title: "Geistliches Leben", value: "geistliches-leben" },
        ],
        layout: "grid",
      },
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: {
    select: { title: "text", subtitle: "author" },
  },
});
```

**Step 4: Register schemas in index.ts**

Modify `src/sanity/schemas/index.ts` — add the two new imports and include them in the array:

```ts
import article from "./article";
import category from "./category";
import author from "./author";
import source from "./source";
import idea from "./idea";
import project from "./project";
import hermeneutikSchritt from "./hermeneutikSchritt";
import hermeneutikText from "./hermeneutikText";
import bookRecommendation from "./bookRecommendation";
import quote from "./quote";

export const schemaTypes = [
  article, category, author, source, idea, project,
  hermeneutikSchritt, hermeneutikText,
  bookRecommendation, quote,
];
```

**Step 5: Commit**

```bash
git add src/sanity/schemas/bookRecommendation.ts src/sanity/schemas/quote.ts src/sanity/schemas/index.ts src/lib/ressourcen.ts
git commit -m "feat: add bookRecommendation and quote Sanity schemas"
```

---

## Task 2: API routes for books

**Files:**
- Create: `src/app/api/admin/books/route.ts`
- Create: `src/app/api/admin/books/[id]/route.ts`

**Step 1: Create collection route (GET + POST)**

```ts
// src/app/api/admin/books/route.ts
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

  const books = await client.fetch(`
    *[_type == "bookRecommendation"] | order(_createdAt desc) {
      _id, title, author, year, difficulty, topics, buyLink, coverImage,
      description
    }
  `);
  return NextResponse.json(books);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "bookRecommendation", ...body });
  return NextResponse.json(doc, { status: 201 });
}
```

**Step 2: Create single-item route (GET + PATCH + DELETE)**

```ts
// src/app/api/admin/books/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { revalidatePath } from "next/cache";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const book = await client.fetch(
    `*[_type == "bookRecommendation" && _id == $id][0]`,
    { id }
  );
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(book);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json({ deleted: true });
}
```

**Step 3: Commit**

```bash
git add 'src/app/api/admin/books/route.ts' 'src/app/api/admin/books/[id]/route.ts'
git commit -m "feat: add admin API routes for book recommendations"
```

---

## Task 3: API routes for quotes

**Files:**
- Create: `src/app/api/admin/quotes/route.ts`
- Create: `src/app/api/admin/quotes/[id]/route.ts`

**Step 1: Create collection route**

```ts
// src/app/api/admin/quotes/route.ts
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

  const quotes = await client.fetch(`
    *[_type == "quote"] | order(_createdAt desc) {
      _id, text, author, topics,
      "source": source->{ _id, title, author, year }
    }
  `);
  return NextResponse.json(quotes);
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const body = await request.json();
  const doc = await writeClient.create({ _type: "quote", ...body });
  return NextResponse.json(doc, { status: 201 });
}
```

**Step 2: Create single-item route**

```ts
// src/app/api/admin/quotes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";
import { revalidatePath } from "next/cache";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const quote = await client.fetch(
    `*[_type == "quote" && _id == $id][0]{ _id, text, author, topics, "source": source->{ _id, title, author, year } }`,
    { id }
  );
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(quote);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  const body = await request.json();
  const toSet: Record<string, unknown> = {};
  const toUnset: string[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) toUnset.push(key);
    else toSet[key] = value;
  }
  let op = writeClient.patch(id).set(toSet);
  if (toUnset.length > 0) op = op.unset(toUnset);
  const updated = await op.commit();
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth();
  if (denied) return denied;
  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/de/ressourcen");
  revalidatePath("/en/ressourcen");
  return NextResponse.json({ deleted: true });
}
```

**Step 3: Commit**

```bash
git add 'src/app/api/admin/quotes/route.ts' 'src/app/api/admin/quotes/[id]/route.ts'
git commit -m "feat: add admin API routes for quotes"
```

---

## Task 4: Admin pages for books

**Files:**
- Create: `src/app/admin/buecher/page.tsx`
- Create: `src/app/admin/buecher/neu/page.tsx`
- Create: `src/app/admin/buecher/[id]/page.tsx`

**Step 1: Create list page**

```tsx
// src/app/admin/buecher/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIFFICULTY_OPTIONS, TOPIC_OPTIONS } from "@/lib/ressourcen";

interface Book {
  _id: string;
  title: string;
  author: string;
  year?: number;
  difficulty: string;
  topics: string[];
  description: string;
}

const difficultyColor: Record<string, string> = {
  einsteiger: "text-emerald-600 bg-emerald-50 border-emerald-200",
  mittel: "text-amber-700 bg-amber-50 border-amber-200",
  fortgeschritten: "text-rose-700 bg-rose-50 border-rose-200",
};

export default function BuecherPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/books")
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); });
  }, []);

  async function deleteBook(id: string) {
    if (!confirm("Buch löschen?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b._id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Bücher</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            Empfehlenswerte theologische Literatur für die Ressourcen-Seite.
          </p>
        </div>
        <Link
          href="/admin/buecher/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neues Buch
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {books.map((book) => (
          <div
            key={book._id}
            className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)]"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-foreground)] text-sm truncate" style={{ fontFamily: "var(--font-sans)" }}>
                {book.title}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                {book.author}{book.year ? ` · ${book.year}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              {book.difficulty && (
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyColor[book.difficulty] ?? ""}`} style={{ fontFamily: "var(--font-sans)" }}>
                  {DIFFICULTY_OPTIONS.find((d) => d.value === book.difficulty)?.label ?? book.difficulty}
                </span>
              )}
              <Link
                href={`/admin/buecher/${book._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Bearbeiten
              </Link>
              <button
                onClick={() => deleteBook(book._id)}
                className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && books.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Bücher. Füge dein erstes Buch hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create new book page**

```tsx
// src/app/admin/buecher/neu/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DIFFICULTY_OPTIONS, TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

export default function NeuesBuchPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("einsteiger");
  const [topics, setTopics] = useState<string[]>([]);
  const [buyLink, setBuyLink] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function save() {
    if (!title.trim() || !author.trim() || !description.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch("/api/admin/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim(),
        year: year ? parseInt(year) : undefined,
        description: description.trim(),
        difficulty,
        topics,
        buyLink: buyLink.trim() || undefined,
      }),
    });
    router.push("/admin/buecher");
  }

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neues Buch</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Buchtitel" autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor(en) *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} placeholder="Vorname Nachname" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Jahr</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="2024" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kurzbeschreibung *</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " resize-none"} placeholder="Warum empfiehlst du dieses Buch?" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Schwierigkeitsgrad *</label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  difficulty === d.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen * (mind. 1)</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kauflink (optional)</label>
          <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="flex gap-3">
          <button
            onClick={save}
            disabled={saving || !title.trim() || !author.trim() || !description.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Buch speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create edit page**

```tsx
// src/app/admin/buecher/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DIFFICULTY_OPTIONS, TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

export default function EditBuchPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("einsteiger");
  const [topics, setTopics] = useState<string[]>([]);
  const [buyLink, setBuyLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/books/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? "");
        setAuthor(data.author ?? "");
        setYear(data.year ? String(data.year) : "");
        setDescription(data.description ?? "");
        setDifficulty(data.difficulty ?? "einsteiger");
        setTopics(data.topics ?? []);
        setBuyLink(data.buyLink ?? "");
        setLoading(false);
      });
  }, [id]);

  function toggleTopic(value: string) {
    setTopics((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }

  async function save() {
    if (!title.trim() || !author.trim() || !description.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch(`/api/admin/books/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        author: author.trim(),
        year: year ? parseInt(year) : null,
        description: description.trim(),
        difficulty,
        topics,
        buyLink: buyLink.trim() || null,
      }),
    });
    setSaving(false);
    router.push("/admin/buecher");
  }

  async function deletebook() {
    if (!confirm("Buch löschen?")) return;
    await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
    router.push("/admin/buecher");
  }

  if (loading) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Buch bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Titel *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor(en) *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Jahr</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="2024" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kurzbeschreibung *</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Schwierigkeitsgrad *</label>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button key={d.value} type="button" onClick={() => setDifficulty(d.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  difficulty === d.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen *</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button key={t.value} type="button" onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Kauflink (optional)</label>
          <input type="url" value={buyLink} onChange={(e) => setBuyLink(e.target.value)} className={inputClass} placeholder="https://..." />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !title.trim() || !author.trim() || !description.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
          <button onClick={deletebook} className="ml-auto text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors">
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/admin/buecher/
git commit -m "feat: add admin pages for book recommendations"
```

---

## Task 5: Admin pages for quotes

**Files:**
- Create: `src/app/admin/zitate/page.tsx`
- Create: `src/app/admin/zitate/neu/page.tsx`
- Create: `src/app/admin/zitate/[id]/page.tsx`

**Step 1: Create list page**

```tsx
// src/app/admin/zitate/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Quote {
  _id: string;
  text: string;
  author: string;
  topics: string[];
  source?: { _id: string; title: string; author: string; year?: number };
}

export default function ZitatePage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then((r) => r.json())
      .then((data) => { setQuotes(data); setLoading(false); });
  }, []);

  async function deleteQuote(id: string) {
    if (!confirm("Zitat löschen?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    setQuotes((prev) => prev.filter((q) => q._id !== id));
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Zitate</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
            Theologische Zitate, thematisch geordnet.
          </p>
        </div>
        <Link
          href="/admin/zitate/neu"
          className="text-sm px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 transition-opacity"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          + Neues Zitat
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>}

      <div className="space-y-2">
        {quotes.map((quote) => (
          <div key={quote._id} className="flex items-start justify-between bg-[var(--color-surface)] rounded-xl px-5 py-4 border border-[var(--color-border)] gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[var(--color-foreground)] line-clamp-2 italic" style={{ fontFamily: "var(--font-sans)" }}>
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                — {quote.author}{quote.source ? `, ${quote.source.title}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={`/admin/zitate/${quote._id}`}
                className="text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                Bearbeiten
              </Link>
              <button onClick={() => deleteQuote(quote._id)} className="text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors" style={{ fontFamily: "var(--font-sans)" }}>
                Löschen
              </button>
            </div>
          </div>
        ))}
        {!loading && quotes.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
            Noch keine Zitate. Füge dein erstes Zitat hinzu!
          </p>
        )}
      </div>
    </div>
  );
}
```

**Step 2: Create new quote page**

```tsx
// src/app/admin/zitate/neu/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

interface Book { _id: string; title: string; author: string; year?: number }

export default function NeuesZitatPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/books").then((r) => r.json()).then(setBooks);
  }, []);

  function toggleTopic(value: string) {
    setTopics((prev) => prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]);
  }

  async function save() {
    if (!text.trim() || !author.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch("/api/admin/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.trim(),
        author: author.trim(),
        topics,
        source: sourceId ? { _type: "reference", _ref: sourceId } : undefined,
      }),
    });
    router.push("/admin/zitate");
  }

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Neues Zitat</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Zitattext *</label>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputClass + " resize-none"} placeholder="Das Zitat..." autoFocus />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} placeholder="Vorname Nachname" />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Quelle (optional)</label>
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className={inputClass}>
            <option value="">— Kein Buch verknüpft —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>{b.title} – {b.author}{b.year ? ` (${b.year})` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen * (mind. 1)</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button key={t.value} type="button" onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={save} disabled={saving || !text.trim() || !author.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Zitat speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Create edit page**

```tsx
// src/app/admin/zitate/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TOPIC_OPTIONS } from "@/lib/ressourcen";

const inputClass = "w-full px-3 py-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)]";

interface Book { _id: string; title: string; author: string; year?: number }

export default function EditZitatPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/quotes/${id}`).then((r) => r.json()),
      fetch("/api/admin/books").then((r) => r.json()),
    ]).then(([quote, bookList]) => {
      setText(quote.text ?? "");
      setAuthor(quote.author ?? "");
      setTopics(quote.topics ?? []);
      setSourceId(quote.source?._id ?? "");
      setBooks(bookList);
      setLoading(false);
    });
  }, [id]);

  function toggleTopic(value: string) {
    setTopics((prev) => prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]);
  }

  async function save() {
    if (!text.trim() || !author.trim() || topics.length === 0) return;
    setSaving(true);
    await fetch(`/api/admin/quotes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text.trim(),
        author: author.trim(),
        topics,
        source: sourceId ? { _type: "reference", _ref: sourceId } : null,
      }),
    });
    setSaving(false);
    router.push("/admin/zitate");
  }

  async function deleteQuote() {
    if (!confirm("Zitat löschen?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    router.push("/admin/zitate");
  }

  if (loading) return <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>Lädt...</p>;

  return (
    <div className="max-w-xl" style={{ fontFamily: "var(--font-sans)" }}>
      <h1 className="font-serif text-2xl text-[var(--color-foreground)] mb-6">Zitat bearbeiten</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Zitattext *</label>
          <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} className={inputClass + " resize-none"} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Autor *</label>
          <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-1">Quelle (optional)</label>
          <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className={inputClass}>
            <option value="">— Kein Buch verknüpft —</option>
            {books.map((b) => (
              <option key={b._id} value={b._id}>{b.title} – {b.author}{b.year ? ` (${b.year})` : ""}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-muted)] mb-2">Themen *</label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((t) => (
              <button key={t.value} type="button" onClick={() => toggleTopic(t.value)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  topics.includes(t.value)
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} disabled={saving || !text.trim() || !author.trim() || topics.length === 0}
            className="px-6 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:opacity-90 disabled:opacity-50">
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors">
            Abbrechen
          </button>
          <button onClick={deleteQuote} className="ml-auto text-xs text-[var(--color-muted)] hover:text-red-500 transition-colors">
            Löschen
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Commit**

```bash
git add src/app/admin/zitate/
git commit -m "feat: add admin pages for quotes"
```

---

## Task 6: Admin navigation (Bücher + Zitate)

**Files:**
- Modify: `src/components/admin/AdminNav.tsx`
- Modify: `src/components/admin/AdminMobileNav.tsx`

**Step 1: Add icons and nav items to AdminNav.tsx**

Add two new icon components after the existing ones (before `const navItems`):

```tsx
function QuoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h4v4H2V4z"/><path d="M2 8c0 2 1 3 4 3"/>
      <path d="M9 4h4v4H9V4z"/><path d="M9 8c0 2 1 3 4 3"/>
    </svg>
  );
}
function LibraryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="3" height="11" rx="0.5"/>
      <rect x="6" y="2" width="3" height="11" rx="0.5"/>
      <rect x="11" y="2" width="3" height="11" rx="0.5"/>
    </svg>
  );
}
```

Add to `navItems` array (after Projekte):
```tsx
{ href: "/admin/buecher", label: "Bücher", Icon: LibraryIcon },
{ href: "/admin/zitate", label: "Zitate", Icon: QuoteIcon },
```

**Step 2: Add same icons and items to AdminMobileNav.tsx**

Same two icon components (with `width="18" height="18"`), same two nav items added after Projekte.

**Step 3: Commit**

```bash
git add src/components/admin/AdminNav.tsx src/components/admin/AdminMobileNav.tsx
git commit -m "feat: add Bücher and Zitate to admin navigation"
```

---

## Task 7: Public Ressourcen page with tabs and filters

**Files:**
- Modify: `src/app/[locale]/ressourcen/page.tsx`
- Create: `src/components/RessourcenClient.tsx`

**Step 1: Create the client filter component**

```tsx
// src/components/RessourcenClient.tsx
"use client";

import { useState } from "react";
import { TOPIC_OPTIONS, DIFFICULTY_OPTIONS } from "@/lib/ressourcen";

interface Book {
  _id: string;
  title: string;
  author: string;
  year?: number;
  description: string;
  difficulty: string;
  topics: string[];
  buyLink?: string;
}

interface Quote {
  _id: string;
  text: string;
  author: string;
  topics: string[];
  source?: { title: string; author: string; year?: number };
}

interface Props {
  books: Book[];
  quotes: Quote[];
  locale: string;
}

const difficultyColor: Record<string, string> = {
  einsteiger: "text-emerald-600 bg-emerald-50 border-emerald-200",
  mittel: "text-amber-700 bg-amber-50 border-amber-200",
  fortgeschritten: "text-rose-700 bg-rose-50 border-rose-200",
};

const difficultyLabel: Record<string, { de: string; en: string }> = {
  einsteiger: { de: "Einsteiger", en: "Beginner" },
  mittel: { de: "Mittel", en: "Intermediate" },
  fortgeschritten: { de: "Fortgeschritten", en: "Advanced" },
};

export function RessourcenClient({ books, quotes, locale }: Props) {
  const [tab, setTab] = useState<"buecher" | "zitate">("buecher");
  const [topicFilter, setTopicFilter] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);
  const [authorFilter, setAuthorFilter] = useState<string | null>(null);

  const filteredBooks = books.filter((b) => {
    if (topicFilter && !b.topics?.includes(topicFilter)) return false;
    if (difficultyFilter && b.difficulty !== difficultyFilter) return false;
    return true;
  });

  const filteredQuotes = quotes.filter((q) => {
    if (topicFilter && !q.topics?.includes(topicFilter)) return false;
    if (authorFilter && q.author !== authorFilter) return false;
    return true;
  });

  const quoteAuthors = Array.from(new Set(quotes.map((q) => q.author))).sort();

  function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
      <button
        onClick={onClick}
        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
          active
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
            : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-foreground)]"
        }`}
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-[var(--color-border)]">
        {(["buecher", "zitate"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setTopicFilter(null); setDifficultyFilter(null); setAuthorFilter(null); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                : "border-transparent text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {t === "buecher"
              ? (locale === "de" ? "Bücher" : "Books")
              : (locale === "de" ? "Zitate" : "Quotes")}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip
          label={locale === "de" ? "Alle Themen" : "All Topics"}
          active={topicFilter === null}
          onClick={() => setTopicFilter(null)}
        />
        {TOPIC_OPTIONS.map((t) => (
          <FilterChip
            key={t.value}
            label={t.label}
            active={topicFilter === t.value}
            onClick={() => setTopicFilter(topicFilter === t.value ? null : t.value)}
          />
        ))}
      </div>

      {tab === "buecher" && (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            <FilterChip
              label={locale === "de" ? "Alle Level" : "All Levels"}
              active={difficultyFilter === null}
              onClick={() => setDifficultyFilter(null)}
            />
            {DIFFICULTY_OPTIONS.map((d) => (
              <FilterChip
                key={d.value}
                label={locale === "de" ? difficultyLabel[d.value].de : difficultyLabel[d.value].en}
                active={difficultyFilter === d.value}
                onClick={() => setDifficultyFilter(difficultyFilter === d.value ? null : d.value)}
              />
            ))}
          </div>

          {filteredBooks.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
              {locale === "de" ? "Keine Bücher gefunden." : "No books found."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredBooks.map((book) => (
                <div key={book._id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-semibold text-[var(--color-foreground)] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
                        {book.title}
                      </p>
                      <p className="text-sm text-[var(--color-muted)] mt-0.5" style={{ fontFamily: "var(--font-sans)" }}>
                        {book.author}{book.year ? ` · ${book.year}` : ""}
                      </p>
                    </div>
                    {book.difficulty && difficultyColor[book.difficulty] && (
                      <span className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${difficultyColor[book.difficulty]}`} style={{ fontFamily: "var(--font-sans)" }}>
                        {locale === "de" ? difficultyLabel[book.difficulty].de : difficultyLabel[book.difficulty].en}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-4" style={{ fontFamily: "var(--font-body-serif)" }}>
                    {book.description}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(book.topics ?? []).map((topic) => (
                        <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--color-border)] text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                          {TOPIC_OPTIONS.find((t) => t.value === topic)?.label ?? topic}
                        </span>
                      ))}
                    </div>
                    {book.buyLink && (
                      <a
                        href={book.buyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                        style={{ fontFamily: "var(--font-sans)" }}
                      >
                        {locale === "de" ? "Kaufen →" : "Buy →"}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "zitate" && (
        <>
          {quoteAuthors.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <FilterChip
                label={locale === "de" ? "Alle Autoren" : "All Authors"}
                active={authorFilter === null}
                onClick={() => setAuthorFilter(null)}
              />
              {quoteAuthors.map((a) => (
                <FilterChip
                  key={a}
                  label={a}
                  active={authorFilter === a}
                  onClick={() => setAuthorFilter(authorFilter === a ? null : a)}
                />
              ))}
            </div>
          )}

          {filteredQuotes.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
              {locale === "de" ? "Keine Zitate gefunden." : "No quotes found."}
            </p>
          ) : (
            <div className="space-y-6">
              {filteredQuotes.map((quote) => (
                <blockquote key={quote._id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-5">
                  <p className="text-base leading-relaxed text-[var(--color-foreground)] italic mb-3" style={{ fontFamily: "var(--font-body-serif)" }}>
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <footer className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                    — {quote.author}
                    {quote.source && (
                      <span className="text-[var(--color-muted)]/70">
                        , <em>{quote.source.title}</em>
                        {quote.source.year ? ` (${quote.source.year})` : ""}
                      </span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**Step 2: Update the server page to fetch data and pass to client component**

Replace `src/app/[locale]/ressourcen/page.tsx` entirely:

```tsx
import Link from "next/link";
import { client } from "@/sanity/client";
import { RessourcenClient } from "@/components/RessourcenClient";

export const revalidate = 60;

export default async function RessourcenPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [books, quotes] = await Promise.all([
    client.fetch(
      `*[_type == "bookRecommendation"] | order(_createdAt desc) {
        _id, title, author, year, description, difficulty, topics, buyLink
      }`,
      {},
      { next: { tags: ["ressourcen"], revalidate: 60 } }
    ),
    client.fetch(
      `*[_type == "quote"] | order(_createdAt desc) {
        _id, text, author, topics,
        "source": source->{ title, author, year }
      }`,
      {},
      { next: { tags: ["ressourcen"], revalidate: 60 } }
    ),
  ]);

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-widest text-accent mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {locale === "de" ? "Weiterführendes" : "Further Reading"}
      </p>
      <h1
        className="text-3xl font-bold mb-4"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        Ressourcen
      </h1>
      <p
        className="text-muted mb-12 leading-relaxed"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {locale === "de"
          ? "Hier findest du eine Auswahl empfehlenswerter Bücher und theologischer Zitate."
          : "Here you will find a selection of recommended books and theological quotes."}
      </p>

      {/* Hermeneutik Program — only shown when enabled */}
      {process.env.NEXT_PUBLIC_HERMENEUTIK_ENABLED === "true" && (
        <Link
          href={`/${locale}/ressourcen/hermeneutik`}
          className="group block rounded-2xl border p-8 mb-12 transition-all hover:scale-[1.01]"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {locale === "de" ? "Hermeneutik lernen" : "Learn Hermeneutics"}
          </h2>
          <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
            {locale === "de"
              ? "Interaktives Lernprogramm für biblische Textanalyse — lerne die hermeneutische Methode Schritt für Schritt."
              : "Interactive learning program for biblical text analysis — learn the hermeneutical method step by step."}
          </p>
        </Link>
      )}

      <RessourcenClient books={books} quotes={quotes} locale={locale} />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/RessourcenClient.tsx src/app/\[locale\]/ressourcen/page.tsx
git commit -m "feat: add public Ressourcen page with Books and Quotes tabs and filters"
```
