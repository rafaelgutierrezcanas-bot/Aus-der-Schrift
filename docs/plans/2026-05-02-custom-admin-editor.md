# Custom Admin Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a password-protected WYSIWYG blog editor at `/admin` using TipTap, saving directly to Sanity CMS.

**Architecture:** Custom Next.js App Router pages under `src/app/admin/` (outside `[locale]` so i18n routing doesn't interfere). TipTap handles editing; a custom converter transforms TipTap JSON ↔ Sanity Portable Text on save/load. API routes handle all Sanity write operations server-side using a write token.

**Tech Stack:** TipTap v2, @sanity/client (already installed), Next.js App Router, Tailwind CSS 4

---

## Task 1: Install TipTap & Add Environment Variables

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.local`
- Modify: `src/sanity/client.ts`

**Step 1: Install TipTap dependencies**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-character-count
```

**Step 2: Add environment variables to `.env.local`**

Append to `.env.local`:
```env
SANITY_API_WRITE_TOKEN=         # get from sanity.io/manage → API → Tokens → Add Editor token
ADMIN_PASSWORD=                  # choose a strong password
ADMIN_SECRET=                    # random 32-char string (e.g. run: openssl rand -hex 16)
```

To get the write token:
1. Go to https://sanity.io/manage
2. Select project `y5fwmpkn`
3. API → Tokens → Add API Token
4. Name: "Admin Editor", Permissions: Editor
5. Copy the token into `.env.local`

**Step 3: Create a write-capable Sanity client at `src/sanity/writeClient.ts`**

```typescript
import { createClient } from "@sanity/client";
import { apiVersion, dataset, projectId } from "./env";

export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});
```

**Step 4: Verify dev server still starts**

```bash
npm run dev
```
Expected: Server starts on http://localhost:3000 with no errors.

**Step 5: Commit**

```bash
git add src/sanity/writeClient.ts .env.local
git commit -m "feat: add TipTap dependencies and Sanity write client"
```

---

## Task 2: Password Auth Middleware + Login Page

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/admin/login/page.tsx`
- Create: `src/app/api/admin/auth/route.ts`

**Step 1: Create middleware at `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip login page and auth API
  if (pathname === "/admin/login" || pathname.startsWith("/api/admin/auth")) {
    return NextResponse.next();
  }

  // Check auth cookie
  const auth = request.cookies.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

**Step 2: Create auth API route at `src/app/api/admin/auth/route.ts`**

```typescript
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set("admin_auth", process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
  return NextResponse.json({ ok: true });
}
```

**Step 3: Create login page at `src/app/admin/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
    } else {
      setError("Falsches Passwort");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-stone-800">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Passwort"
          className="w-full border border-stone-200 rounded-lg px-4 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-stone-800 text-white rounded-lg px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          Einloggen
        </button>
      </form>
    </div>
  );
}
```

**Step 4: Manually test auth flow**

1. Visit http://localhost:3000/admin → should redirect to `/admin/login`
2. Enter wrong password → should show error
3. Enter correct password → should redirect to `/admin` (404 is fine for now)

**Step 5: Commit**

```bash
git add src/middleware.ts src/app/admin/login/page.tsx src/app/api/admin/auth/route.ts
git commit -m "feat: add password auth middleware and login page for /admin"
```

---

## Task 3: Admin API Routes (Articles & Categories)

**Files:**
- Create: `src/app/api/admin/articles/route.ts`
- Create: `src/app/api/admin/articles/[slug]/route.ts`
- Create: `src/app/api/admin/categories/route.ts`
- Create: `src/app/api/admin/upload/route.ts`

**Step 1: Create articles list + create route at `src/app/api/admin/articles/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

// GET all articles (for dashboard)
export async function GET() {
  const articles = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      language,
      "category": category->{ _id, titleDe, slug }
    }
  `);
  return NextResponse.json(articles);
}

// POST create new article
export async function POST(request: NextRequest) {
  const body = await request.json();
  const doc = await writeClient.create({ _type: "article", ...body });
  return NextResponse.json(doc, { status: 201 });
}
```

**Step 2: Create single article route at `src/app/api/admin/articles/[slug]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { writeClient } from "@/sanity/writeClient";

// GET single article by slug (full content for editing)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      titleDe,
      titleEn,
      slug,
      publishedAt,
      language,
      excerptDe,
      excerptEn,
      featuredImage,
      bodyDe,
      bodyEn,
      "category": category->{ _id, titleDe, slug },
      "author": author->{ _id, name }
    }
  `, { slug });
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(article);
}

// PATCH update article
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const body = await request.json();

  // Find article _id by slug first
  const article = await client.fetch(
    `*[_type == "article" && slug.current == $slug][0]{ _id }`,
    { slug }
  );
  if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await writeClient.patch(article._id).set(body).commit();
  return NextResponse.json(updated);
}
```

**Step 3: Create categories route at `src/app/api/admin/categories/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

export async function GET() {
  const categories = await client.fetch(`
    *[_type == "category"] | order(titleDe asc) {
      _id,
      titleDe,
      slug
    }
  `);
  return NextResponse.json(categories);
}
```

**Step 4: Create image upload route at `src/app/api/admin/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await writeClient.assets.upload("image", buffer, {
    filename: file.name,
    contentType: file.type,
  });

  return NextResponse.json({ _ref: asset._id, url: asset.url });
}
```

**Step 5: Test API routes manually**

```bash
# In a second terminal (while npm run dev is running):
curl http://localhost:3000/api/admin/articles
# Expected: redirect to login or empty array (if cookie is set)

curl http://localhost:3000/api/admin/categories
# Expected: list of categories
```

Note: For testing with auth, use browser after logging in, or use curl with cookie header.

**Step 6: Commit**

```bash
git add src/app/api/admin/
git commit -m "feat: add admin API routes for articles, categories, and image upload"
```

---

## Task 4: Admin Dashboard Page

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/layout.tsx`

**Step 1: Create admin layout at `src/app/admin/layout.tsx`**

```tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-lg font-semibold text-stone-800">
          ✍️ aus-der-schrift Admin
        </Link>
        <Link
          href="/admin/neu"
          className="bg-stone-800 text-white text-sm rounded-lg px-4 py-2 hover:bg-stone-700 transition-colors"
        >
          + Neuer Artikel
        </Link>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
```

**Step 2: Create dashboard at `src/app/admin/page.tsx`**

```tsx
import Link from "next/link";
import { client } from "@/sanity/client";

interface ArticleSummary {
  _id: string;
  titleDe: string;
  slug: { current: string };
  publishedAt: string;
  language: string;
  category?: { titleDe: string };
}

export default async function AdminDashboard() {
  const articles: ArticleSummary[] = await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id, titleDe, slug, publishedAt, language,
      "category": category->{ titleDe }
    }
  `);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Alle Artikel</h1>
      {articles.length === 0 && (
        <p className="text-stone-500">Noch keine Artikel vorhanden.</p>
      )}
      <div className="space-y-2">
        {articles.map((article) => (
          <Link
            key={article._id}
            href={`/admin/${article.slug.current}`}
            className="flex items-center justify-between bg-white rounded-xl px-5 py-4 border border-stone-200 hover:border-stone-400 transition-colors group"
          >
            <div>
              <p className="font-medium text-stone-800 group-hover:text-stone-600">
                {article.titleDe}
              </p>
              <p className="text-sm text-stone-400 mt-0.5">
                {article.category?.titleDe ?? "Keine Kategorie"} ·{" "}
                {new Date(article.publishedAt).toLocaleDateString("de-DE")} ·{" "}
                <span className="uppercase">{article.language}</span>
              </p>
            </div>
            <span className="text-stone-400 text-sm">Bearbeiten →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 3: Verify dashboard**

1. Visit http://localhost:3000/admin
2. Should show list of existing articles
3. Each row links to `/admin/[slug]` (404 for now)

**Step 4: Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/page.tsx
git commit -m "feat: add admin dashboard listing all articles"
```

---

## Task 5: TipTap ↔ Portable Text Converters

This is the most critical task. TipTap uses its own JSON format; Sanity uses Portable Text. We need converters in both directions.

**Files:**
- Create: `src/lib/tiptapToPortableText.ts`
- Create: `src/lib/portableTextToTiptap.ts`

**Step 1: Create TipTap → Portable Text converter at `src/lib/tiptapToPortableText.ts`**

```typescript
// Converts TipTap editor JSON to Sanity Portable Text array

type TipTapMark = { type: string; attrs?: Record<string, unknown> };
type TipTapNode = {
  type: string;
  text?: string;
  marks?: TipTapMark[];
  content?: TipTapNode[];
  attrs?: Record<string, unknown>;
};

function convertMarks(marks: TipTapMark[] = []) {
  return marks
    .map((m) => {
      if (m.type === "bold") return { _type: "strong" };
      if (m.type === "italic") return { _type: "em" };
      if (m.type === "link") return { _type: "link", href: m.attrs?.href };
      return null;
    })
    .filter(Boolean);
}

function convertInline(node: TipTapNode) {
  if (node.type === "text") {
    return {
      _type: "span",
      _key: crypto.randomUUID(),
      text: node.text ?? "",
      marks: convertMarks(node.marks).map((m: any) => m._type),
    };
  }
  return null;
}

function headingStyle(level: number): string {
  const map: Record<number, string> = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" };
  return map[level] ?? "normal";
}

export function tiptapToPortableText(doc: TipTapNode): unknown[] {
  const blocks: unknown[] = [];

  for (const node of doc.content ?? []) {
    // Paragraph
    if (node.type === "paragraph") {
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "normal",
        children: (node.content ?? []).map(convertInline).filter(Boolean),
        markDefs: [],
      });
    }

    // Heading
    else if (node.type === "heading") {
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: headingStyle(node.attrs?.level as number),
        children: (node.content ?? []).map(convertInline).filter(Boolean),
        markDefs: [],
      });
    }

    // Blockquote (regular, ❓, or 📌 determined by prefix in first text)
    else if (node.type === "blockquote") {
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID(),
        style: "blockquote",
        children: (node.content?.[0]?.content ?? []).map(convertInline).filter(Boolean),
        markDefs: [],
      });
    }

    // Bullet list
    else if (node.type === "bulletList") {
      for (const item of node.content ?? []) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID(),
          style: "normal",
          listItem: "bullet",
          children: (item.content?.[0]?.content ?? []).map(convertInline).filter(Boolean),
          markDefs: [],
        });
      }
    }

    // Ordered list
    else if (node.type === "orderedList") {
      for (const item of node.content ?? []) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID(),
          style: "normal",
          listItem: "number",
          children: (item.content?.[0]?.content ?? []).map(convertInline).filter(Boolean),
          markDefs: [],
        });
      }
    }

    // Bible Verse (custom node)
    else if (node.type === "bibleVerse") {
      blocks.push({
        _type: "bibleVerse",
        _key: crypto.randomUUID(),
        reference: node.attrs?.reference ?? "",
        text: node.attrs?.text ?? "",
        translation: node.attrs?.translation ?? "",
      });
    }

    // Image
    else if (node.type === "image") {
      blocks.push({
        _type: "image",
        _key: crypto.randomUUID(),
        asset: { _type: "reference", _ref: node.attrs?.sanityRef },
        alt: node.attrs?.alt ?? "",
        caption: node.attrs?.caption ?? "",
      });
    }
  }

  return blocks;
}
```

**Step 2: Create Portable Text → TipTap converter at `src/lib/portableTextToTiptap.ts`**

```typescript
// Converts Sanity Portable Text array to TipTap editor JSON

type PTSpan = { _type: "span"; text: string; marks?: string[] };
type PTBlock = {
  _type: string;
  style?: string;
  listItem?: string;
  children?: PTSpan[];
  reference?: string;
  text?: string;
  translation?: string;
  asset?: { _ref: string };
  alt?: string;
  caption?: string;
};

function convertSpans(children: PTSpan[] = []) {
  return children.map((span) => ({
    type: "text",
    text: span.text,
    marks: (span.marks ?? []).map((m) => {
      if (m === "strong") return { type: "bold" };
      if (m === "em") return { type: "italic" };
      return { type: m };
    }),
  }));
}

export function portableTextToTiptap(blocks: PTBlock[]) {
  const content: unknown[] = [];

  for (const block of blocks) {
    if (block._type === "block") {
      if (block.listItem === "bullet") {
        // Wrap in bulletList - handled below
        content.push({
          type: "bulletList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: convertSpans(block.children) }] }],
        });
      } else if (block.listItem === "number") {
        content.push({
          type: "orderedList",
          content: [{ type: "listItem", content: [{ type: "paragraph", content: convertSpans(block.children) }] }],
        });
      } else if (block.style === "blockquote") {
        content.push({
          type: "blockquote",
          content: [{ type: "paragraph", content: convertSpans(block.children) }],
        });
      } else if (block.style && block.style.startsWith("h")) {
        const level = parseInt(block.style[1]);
        content.push({
          type: "heading",
          attrs: { level },
          content: convertSpans(block.children),
        });
      } else {
        content.push({
          type: "paragraph",
          content: convertSpans(block.children),
        });
      }
    }

    else if (block._type === "bibleVerse") {
      content.push({
        type: "bibleVerse",
        attrs: {
          reference: block.reference ?? "",
          text: block.text ?? "",
          translation: block.translation ?? "",
        },
      });
    }

    else if (block._type === "image") {
      content.push({
        type: "image",
        attrs: {
          sanityRef: block.asset?._ref,
          alt: block.alt ?? "",
          caption: block.caption ?? "",
        },
      });
    }
  }

  return { type: "doc", content };
}
```

**Step 3: Verify converters compile**

```bash
npx tsc --noEmit
```
Expected: No errors related to converter files.

**Step 4: Commit**

```bash
git add src/lib/tiptapToPortableText.ts src/lib/portableTextToTiptap.ts
git commit -m "feat: add TipTap <-> Portable Text converters"
```

---

## Task 6: TipTap Editor Component with Custom Extensions

**Files:**
- Create: `src/components/admin/EditorToolbar.tsx`
- Create: `src/components/admin/BibleVerseBlock.tsx`
- Create: `src/components/admin/TiptapEditor.tsx`

**Step 1: Create Bible Verse TipTap extension + component at `src/components/admin/BibleVerseBlock.tsx`**

```tsx
"use client";
import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { useState } from "react";

// TipTap Extension
export const BibleVerseExtension = Node.create({
  name: "bibleVerse",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      reference: { default: "" },
      text: { default: "" },
      translation: { default: "LUT" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type=\"bibleVerse\"]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "bibleVerse" })];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BibleVerseView);
  },
});

// React component for rendering in editor
function BibleVerseView({ node, updateAttributes }: { node: any; updateAttributes: (attrs: any) => void }) {
  const [editing, setEditing] = useState(false);
  const { reference, text, translation } = node.attrs;

  if (editing) {
    return (
      <NodeViewWrapper>
        <div className="border-2 border-amber-300 rounded-xl p-4 bg-amber-50 space-y-2 my-4">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">📖 Bibelvers bearbeiten</p>
          <input
            placeholder="Referenz (z.B. Joh 1,1)"
            value={reference}
            onChange={(e) => updateAttributes({ reference: e.target.value })}
            className="w-full border border-amber-200 rounded px-3 py-1.5 text-sm"
          />
          <textarea
            placeholder="Vers-Text..."
            value={text}
            onChange={(e) => updateAttributes({ text: e.target.value })}
            rows={3}
            className="w-full border border-amber-200 rounded px-3 py-1.5 text-sm"
          />
          <input
            placeholder="Übersetzung (z.B. LUT, ESV)"
            value={translation}
            onChange={(e) => updateAttributes({ translation: e.target.value })}
            className="w-full border border-amber-200 rounded px-3 py-1.5 text-sm"
          />
          <button onClick={() => setEditing(false)} className="text-xs text-amber-700 underline">
            Fertig
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper>
      <div
        onClick={() => setEditing(true)}
        className="border-l-4 border-amber-400 pl-4 my-4 cursor-pointer hover:bg-amber-50 rounded-r-lg py-2"
      >
        <p className="text-sm font-semibold text-amber-700">{reference || "Referenz..."}</p>
        <p className="text-stone-700 italic">{text || "Vers-Text..."}</p>
        <p className="text-xs text-stone-400 mt-1">{translation}</p>
      </div>
    </NodeViewWrapper>
  );
}
```

**Step 2: Create toolbar at `src/components/admin/EditorToolbar.tsx`**

```tsx
"use client";
import { Editor } from "@tiptap/react";

interface Props {
  editor: Editor;
}

export default function EditorToolbar({ editor }: Props) {
  function addBibleVerse() {
    editor.chain().focus().insertContent({
      type: "bibleVerse",
      attrs: { reference: "", text: "", translation: "LUT" },
    }).run();
  }

  function addExplanationBox() {
    editor.chain().focus().insertContent({
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "📌 " }] }],
    }).run();
  }

  function addQuestionBox() {
    editor.chain().focus().insertContent({
      type: "blockquote",
      content: [{ type: "paragraph", content: [{ type: "text", text: "❓ " }] }],
    }).run();
  }

  const btn = (active: boolean) =>
    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${active ? "bg-stone-800 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200"}`;

  return (
    <div className="flex flex-wrap gap-1.5 p-3 border-b border-stone-200 bg-stone-50">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}>B</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}>I</button>
      <div className="w-px bg-stone-200 mx-1" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
      <div className="w-px bg-stone-200 mx-1" />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• Liste</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. Liste</button>
      <div className="w-px bg-stone-200 mx-1" />
      <button onClick={addBibleVerse} className={btn(false)}>📖 Bibelvers</button>
      <button onClick={addExplanationBox} className={btn(false)}>📌 Erklärung</button>
      <button onClick={addQuestionBox} className={btn(false)}>❓ Frage</button>
    </div>
  );
}
```

**Step 3: Create main editor component at `src/components/admin/TiptapEditor.tsx`**

```tsx
"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import EditorToolbar from "./EditorToolbar";
import { BibleVerseExtension } from "./BibleVerseBlock";

interface Props {
  content: object | null;
  onChange: (json: object) => void;
  placeholder?: string;
}

export default function TiptapEditor({ content, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      BibleVerseExtension,
      Placeholder.configure({ placeholder: placeholder ?? "Schreibe hier..." }),
    ],
    content: content ?? undefined,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: "prose prose-stone max-w-none focus:outline-none min-h-[400px] px-6 py-5",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
```

**Step 4: Verify no TypeScript errors**

```bash
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add src/components/admin/
git commit -m "feat: add TipTap editor with custom BibleVerse block and toolbar"
```

---

## Task 7: New Article Page

**Files:**
- Create: `src/app/admin/neu/page.tsx`

**Step 1: Create new article page at `src/app/admin/neu/page.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
  slug: { current: string };
}

export default function NewArticlePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("de");
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0, 16));
  const [excerptDe, setExcerptDe] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories);
  }, []);

  // Auto-generate slug from German title
  useEffect(() => {
    setSlug(
      titleDe
        .toLowerCase()
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    );
  }, [titleDe]);

  async function handleSave(publish: boolean) {
    setSaving(true);
    const doc: Record<string, unknown> = {
      titleDe, titleEn,
      slug: { _type: "slug", current: slug },
      language,
      publishedAt: new Date(publishedAt).toISOString(),
      excerptDe, excerptEn,
      bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : [],
      bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : [],
    };
    if (categoryId) doc.category = { _type: "reference", _ref: categoryId };

    const res = await fetch("/api/admin/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doc),
    });

    if (res.ok) {
      if (publish) {
        const created = await res.json();
        await fetch(`/api/admin/articles/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ _id: created._id }),
        });
      }
      router.push("/admin");
    }
    setSaving(false);
  }

  const inputClass = "w-full border border-stone-200 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white";
  const labelClass = "block text-sm font-medium text-stone-600 mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-800">Neuer Artikel</h1>
        <div className="flex gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="border border-stone-300 text-stone-700 rounded-lg px-4 py-2 text-sm hover:bg-stone-100 transition-colors">
            {saving ? "Speichert..." : "Entwurf speichern"}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="bg-stone-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-stone-700 transition-colors">
            Publizieren
          </button>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Titel (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Slug</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Kategorie</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">— Keine —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.titleDe}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sprache</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            <option value="de">Nur Deutsch</option>
            <option value="en">Only English</option>
            <option value="both">Beide / Both</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Veröffentlicht am</label>
          <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Vorschautext (DE)</label>
          <textarea value={excerptDe} onChange={(e) => setExcerptDe(e.target.value)} rows={2} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Excerpt (EN)</label>
          <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} rows={2} className={inputClass} />
        </div>
      </div>

      {/* Body DE */}
      {(language === "de" || language === "both") && (
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-3">Inhalt (DE)</h2>
          <TiptapEditor content={bodyDe} onChange={setBodyDe} placeholder="Schreibe auf Deutsch..." />
        </div>
      )}

      {/* Body EN */}
      {(language === "en" || language === "both") && (
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-3">Content (EN)</h2>
          <TiptapEditor content={bodyEn} onChange={setBodyEn} placeholder="Write in English..." />
        </div>
      )}
    </div>
  );
}
```

**Step 2: Manually test creating a new article**

1. Visit http://localhost:3000/admin/neu
2. Fill in Titel (DE), check that Slug auto-generates
3. Write some text, add a Bibelvers block (click "📖 Bibelvers" in toolbar)
4. Click "Entwurf speichern"
5. Check Sanity Studio at http://localhost:3000/studio — article should appear

**Step 3: Commit**

```bash
git add src/app/admin/neu/
git commit -m "feat: add new article editor page"
```

---

## Task 8: Edit Article Page

**Files:**
- Create: `src/app/admin/[slug]/page.tsx`

**Step 1: Create edit page at `src/app/admin/[slug]/page.tsx`**

```tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { tiptapToPortableText } from "@/lib/tiptapToPortableText";
import { portableTextToTiptap } from "@/lib/portableTextToTiptap";

const TiptapEditor = dynamic(() => import("@/components/admin/TiptapEditor"), { ssr: false });

interface Category {
  _id: string;
  titleDe: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [titleDe, setTitleDe] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [language, setLanguage] = useState("de");
  const [publishedAt, setPublishedAt] = useState("");
  const [excerptDe, setExcerptDe] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [bodyDe, setBodyDe] = useState<object | null>(null);
  const [bodyEn, setBodyEn] = useState<object | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/articles/${slug}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([article, cats]) => {
      setTitleDe(article.titleDe ?? "");
      setTitleEn(article.titleEn ?? "");
      setLanguage(article.language ?? "de");
      setPublishedAt(article.publishedAt?.slice(0, 16) ?? "");
      setExcerptDe(article.excerptDe ?? "");
      setExcerptEn(article.excerptEn ?? "");
      setCategoryId(article.category?._id ?? "");
      if (article.bodyDe) setBodyDe(portableTextToTiptap(article.bodyDe));
      if (article.bodyEn) setBodyEn(portableTextToTiptap(article.bodyEn));
      setCategories(cats);
      setLoaded(true);
    });
  }, [slug]);

  async function handleSave() {
    setSaving(true);
    const patch: Record<string, unknown> = {
      titleDe, titleEn, language,
      publishedAt: new Date(publishedAt).toISOString(),
      excerptDe, excerptEn,
      bodyDe: bodyDe ? tiptapToPortableText(bodyDe as any) : [],
      bodyEn: bodyEn ? tiptapToPortableText(bodyEn as any) : [],
    };
    if (categoryId) patch.category = { _type: "reference", _ref: categoryId };

    await fetch(`/api/admin/articles/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    setSaving(false);
    router.push("/admin");
  }

  const inputClass = "w-full border border-stone-200 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white";
  const labelClass = "block text-sm font-medium text-stone-600 mb-1.5";

  if (!loaded) return <div className="text-stone-400 py-12 text-center">Lädt...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-stone-800">Artikel bearbeiten</h1>
        <button onClick={handleSave} disabled={saving} className="bg-stone-800 text-white rounded-lg px-4 py-2 text-sm hover:bg-stone-700 transition-colors">
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 p-6 grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Titel (DE)</label>
          <input value={titleDe} onChange={(e) => setTitleDe(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Title (EN)</label>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Kategorie</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="">— Keine —</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.titleDe}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Sprache</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
            <option value="de">Nur Deutsch</option>
            <option value="en">Only English</option>
            <option value="both">Beide / Both</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Veröffentlicht am</label>
          <input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Vorschautext (DE)</label>
          <textarea value={excerptDe} onChange={(e) => setExcerptDe(e.target.value)} rows={2} className={inputClass} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Excerpt (EN)</label>
          <textarea value={excerptEn} onChange={(e) => setExcerptEn(e.target.value)} rows={2} className={inputClass} />
        </div>
      </div>

      {(language === "de" || language === "both") && (
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-3">Inhalt (DE)</h2>
          <TiptapEditor content={bodyDe} onChange={setBodyDe} placeholder="Schreibe auf Deutsch..." />
        </div>
      )}

      {(language === "en" || language === "both") && (
        <div>
          <h2 className="text-lg font-medium text-stone-700 mb-3">Content (EN)</h2>
          <TiptapEditor content={bodyEn} onChange={setBodyEn} placeholder="Write in English..." />
        </div>
      )}
    </div>
  );
}
```

**Step 2: Manually test editing an existing article**

1. Go to http://localhost:3000/admin
2. Click on an existing article
3. Verify it loads with correct title, metadata, and body content in TipTap
4. Make a small change, click "Speichern"
5. Verify change appears in Sanity Studio and eventually on the live blog

**Step 3: Commit**

```bash
git add src/app/admin/[slug]/
git commit -m "feat: add edit article page with Portable Text loading"
```

---

## Done

After all tasks:
- Visit http://localhost:3000/admin
- Full editor works: create, edit, publish articles
- Custom blocks: 📖 Bibelvers, 📌 Erklärung, ❓ Frage
- Sanity remains the backend, CDN, and ISR still work

**Optional future additions:**
- Image upload button in toolbar (using `/api/admin/upload`)
- Footnote extension
- Logout button in header
- Delete article functionality
