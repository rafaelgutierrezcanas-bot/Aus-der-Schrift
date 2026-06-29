# Comment System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow readers to post comments on blog posts; comments are only shown after admin approval.

**Architecture:** Comments are stored as a `comment` Sanity document. A public API route `POST /api/comments` accepts new comments (status: "pending"). Admin-protected routes handle listing/approving/deleting. The blog post page renders a `CommentsSection` server component (fetches approved comments) + a `CommentForm` client component (submits new ones). Admin panel gets a new `/admin/kommentare` page.

**Tech Stack:** Next.js 16 App Router, Sanity (writeClient + client), TypeScript, Tailwind CSS, React 19

---

## Context

- **Auth pattern:** All admin routes use `requireAuth()` — see `src/app/api/admin/quotes/route.ts:7-14`
- **Schema registration:** `src/sanity/schemas/index.ts` — import and add to `schemaTypes` array
- **Admin sidebar:** `src/components/admin/AdminNav.tsx:82-92` — add to `navItems`; same pattern in `AdminMobileNav.tsx:34-44`
- **Blog post page end:** `src/app/[locale]/blog/[slug]/page.tsx:402-418` — insert `<CommentsSection>` after related posts, before the closing `</div>`
- **Read client:** `import { client } from "@/sanity/client"`
- **Write client:** `import { writeClient } from "@/sanity/writeClient"`
- **revalidate:** after mutations call `revalidatePath("/de/blog/[slug]", "page")` — but for comments we'll revalidate the layout so all blog pages update

---

## Task 1: Sanity Schema `comment`

**Files:**
- Create: `src/sanity/schemas/comment.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create the schema file**

```typescript
// src/sanity/schemas/comment.ts
import { defineField, defineType } from "sanity";

export default defineType({
  name: "comment",
  title: "Kommentar",
  type: "document",
  fields: [
    defineField({
      name: "articleId",
      title: "Artikel-ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authorName",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authorEmail",
      title: "E-Mail (nicht öffentlich)",
      type: "string",
    }),
    defineField({
      name: "body",
      title: "Kommentar",
      type: "text",
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Ausstehend", value: "pending" },
          { title: "Freigegeben", value: "approved" },
          { title: "Abgelehnt", value: "rejected" },
        ],
        layout: "radio",
      },
      initialValue: "pending",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "authorName",
      subtitle: "body",
    },
  },
});
```

**Step 2: Register the schema**

In `src/sanity/schemas/index.ts`, add:
```typescript
import comment from "./comment";
// ...existing imports...

export const schemaTypes = [
  article, category, author, source, idea, project,
  hermeneutikSchritt, hermeneutikText,
  bookRecommendation, quote,
  ausarbeitung,
  comment,  // ← add this
];
```

**Step 3: Verify build compiles**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```
Expected: no TypeScript errors about `comment`

**Step 4: Commit**

```bash
git add src/sanity/schemas/comment.ts src/sanity/schemas/index.ts
git commit -m "feat: add comment Sanity schema"
```

---

## Task 2: Public POST `/api/comments`

**Files:**
- Create: `src/app/api/comments/route.ts`

**Step 1: Create the route**

```typescript
// src/app/api/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { writeClient } from "@/sanity/writeClient";

// In-memory rate limit: 3 submissions per IP per hour
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_BODY_LENGTH = 2000;

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Zu viele Kommentare. Bitte warte eine Stunde." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const { articleId, authorName, authorEmail, body: commentBody } =
    body as Record<string, unknown>;

  if (
    typeof articleId !== "string" ||
    typeof authorName !== "string" ||
    typeof commentBody !== "string"
  ) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  if (
    articleId.trim().length === 0 ||
    authorName.trim().length === 0 ||
    commentBody.trim().length === 0
  ) {
    return NextResponse.json({ error: "Felder dürfen nicht leer sein" }, { status: 400 });
  }

  if (authorName.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "Name zu lang" }, { status: 400 });
  }
  if (commentBody.length > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "Kommentar zu lang (max. 2000 Zeichen)" }, { status: 400 });
  }
  if (authorEmail !== undefined && authorEmail !== null) {
    if (typeof authorEmail !== "string" || authorEmail.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json({ error: "Ungültige E-Mail" }, { status: 400 });
    }
  }

  const doc: Record<string, unknown> = {
    _type: "comment",
    articleId: articleId.trim(),
    authorName: authorName.trim(),
    body: commentBody.trim(),
    status: "pending",
  };
  if (typeof authorEmail === "string" && authorEmail.trim()) {
    doc.authorEmail = authorEmail.trim();
  }

  try {
    await writeClient.create(doc);
  } catch (err) {
    console.error("[POST /api/comments] Sanity write failed:", err);
    return NextResponse.json({ error: "Speichern fehlgeschlagen" }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
```

**Step 2: Verify build**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```

**Step 3: Commit**

```bash
git add src/app/api/comments/route.ts
git commit -m "feat: add public POST /api/comments with rate limiting"
```

---

## Task 3: Admin API routes for comments

**Files:**
- Create: `src/app/api/admin/comments/route.ts`
- Create: `src/app/api/admin/comments/[id]/route.ts`

**Step 1: Create list route**

```typescript
// src/app/api/admin/comments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { client } from "@/sanity/client";

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

  const articleId = request.nextUrl.searchParams.get("articleId");

  const filter = articleId
    ? `_type == "comment" && articleId == $articleId`
    : `_type == "comment"`;

  const params = articleId ? { articleId } : {};

  const comments = await client.fetch(
    `*[${filter}] | order(_createdAt desc) {
      _id, articleId, authorName, authorEmail, body, status, _createdAt
    }`,
    params
  );

  return NextResponse.json(comments);
}
```

**Step 2: Create single-item route**

```typescript
// src/app/api/admin/comments/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
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
  const { status } = body as { status?: string };

  if (!status || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
  }

  const updated = await writeClient.patch(id).set({ status }).commit();
  revalidatePath("/", "layout");
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { id } = await params;
  await writeClient.delete(id);
  revalidatePath("/", "layout");
  return NextResponse.json({ deleted: true });
}
```

**Step 3: Verify build**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/app/api/admin/comments/route.ts src/app/api/admin/comments/[id]/route.ts
git commit -m "feat: add admin API routes for comment moderation"
```

---

## Task 4: `CommentsSection` and `CommentForm` components

**Files:**
- Create: `src/components/CommentsSection.tsx`
- Create: `src/components/CommentForm.tsx`

**Step 1: Create `CommentForm.tsx` (client component)**

```typescript
// src/components/CommentForm.tsx
"use client";

import { useState } from "react";

interface CommentFormProps {
  articleId: string;
  locale: string;
}

export function CommentForm({ articleId, locale }: CommentFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, authorName: name, authorEmail: email || undefined, body }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg((data as { error?: string }).error ?? "Fehler");
        setStatus("error");
        return;
      }

      setStatus("success");
      setName("");
      setEmail("");
      setBody("");
    } catch {
      setErrorMsg(locale === "de" ? "Netzwerkfehler" : "Network error");
      setStatus("error");
    }
  }

  const isDE = locale === "de";

  if (status === "success") {
    return (
      <p
        className="text-sm px-4 py-3 rounded-xl border"
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          color: "var(--color-muted)",
          fontFamily: "var(--font-body-serif)",
        }}
      >
        {isDE
          ? "Danke! Dein Kommentar wird geprüft und dann veröffentlicht."
          : "Thank you! Your comment will be reviewed before publishing."}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="comment-name"
            className="block text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
          >
            {isDE ? "Name" : "Name"} *
          </label>
          <input
            id="comment-name"
            type="text"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              fontFamily: "var(--font-body-serif)",
              color: "var(--color-foreground)",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="comment-email"
            className="block text-xs uppercase tracking-widest mb-1"
            style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
          >
            {isDE ? "E-Mail (optional)" : "Email (optional)"}
          </label>
          <input
            id="comment-email"
            type="email"
            maxLength={254}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border)",
              fontFamily: "var(--font-body-serif)",
              color: "var(--color-foreground)",
            }}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="comment-body"
          className="block text-xs uppercase tracking-widest mb-1"
          style={{ fontFamily: "var(--font-sans)", color: "var(--color-muted)" }}
        >
          {isDE ? "Kommentar" : "Comment"} *
        </label>
        <textarea
          id="comment-body"
          required
          maxLength={2000}
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] resize-none"
          style={{
            borderColor: "var(--color-border)",
            fontFamily: "var(--font-body-serif)",
            color: "var(--color-foreground)",
          }}
        />
        <p
          className="text-[11px] mt-1 text-right"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
        >
          {body.length}/2000
        </p>
      </div>

      {status === "error" && (
        <p className="text-sm" style={{ color: "var(--color-accent)", fontFamily: "var(--font-sans)" }}>
          {errorMsg}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-5 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{
            background: "var(--color-accent)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
          }}
        >
          {status === "loading"
            ? (isDE ? "Wird gesendet…" : "Sending…")
            : (isDE ? "Kommentar absenden →" : "Submit comment →")}
        </button>
        <p
          className="text-xs"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
        >
          {isDE
            ? "Dein Kommentar wird vor der Veröffentlichung geprüft."
            : "Your comment will be reviewed before publishing."}
        </p>
      </div>
    </form>
  );
}
```

**Step 2: Create `CommentsSection.tsx` (server component)**

```typescript
// src/components/CommentsSection.tsx
import { client } from "@/sanity/client";
import { formatDate } from "@/lib/utils";
import { CommentForm } from "./CommentForm";

interface Comment {
  _id: string;
  authorName: string;
  body: string;
  _createdAt: string;
}

interface CommentsSectionProps {
  articleId: string;
  locale: string;
}

export async function CommentsSection({ articleId, locale }: CommentsSectionProps) {
  const comments = await client.fetch<Comment[]>(
    `*[_type == "comment" && articleId == $articleId && status == "approved"] | order(_createdAt asc) {
      _id, authorName, body, _createdAt
    }`,
    { articleId }
  );

  const isDE = locale === "de";

  return (
    <section className="mt-20 pt-12 border-t border-border max-w-prose mx-auto">
      <h2
        className="text-xl font-semibold mb-8"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {isDE
          ? `Kommentare${comments.length > 0 ? ` (${comments.length})` : ""}`
          : `Comments${comments.length > 0 ? ` (${comments.length})` : ""}`}
      </h2>

      {comments.length === 0 ? (
        <p
          className="mb-10 text-sm"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
        >
          {isDE
            ? "Noch keine Kommentare — sei der Erste."
            : "No comments yet — be the first."}
        </p>
      ) : (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border p-6"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="flex items-baseline justify-between gap-4 mb-3">
                <span
                  className="font-medium text-sm"
                  style={{ fontFamily: "var(--font-sans)", color: "var(--color-foreground)" }}
                >
                  {c.authorName}
                </span>
                <span
                  className="text-xs shrink-0"
                  style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                >
                  {formatDate(c._createdAt, locale)}
                </span>
              </div>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--color-foreground)", fontFamily: "var(--font-body-serif)" }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      <h3
        className="text-base font-semibold mb-5"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {isDE ? "Kommentar schreiben" : "Leave a comment"}
      </h3>
      <CommentForm articleId={articleId} locale={locale} />
    </section>
  );
}
```

**Step 3: Verify build**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/components/CommentsSection.tsx src/components/CommentForm.tsx
git commit -m "feat: add CommentsSection and CommentForm components"
```

---

## Task 5: Integrate CommentsSection into blog post page

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Read the current end of the file**

The page currently ends (around line 402–420):
```tsx
      {/* Related Posts */}
      {related.length > 0 && (
        <section className="mt-20 pt-12 border-t border-border max-w-prose mx-auto">
          ...
        </section>
      )}
    </div>
  );
}
```

**Step 2: Add import at top of file**

Add this import after the existing imports (around line 18):
```typescript
import { CommentsSection } from "@/components/CommentsSection";
```

**Step 3: Insert CommentsSection before closing `</div>`**

Find the closing sequence `    </div>\n  );\n}` at the end of the non-paper layout and insert the CommentsSection:

```tsx
      {/* Comments */}
      <CommentsSection articleId={article._id as string} locale={locale} />
    </div>
  );
}
```

The `article._id` is always available because the `notFound()` guard runs earlier.

**Step 4: Verify build**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```

**Step 5: Commit**

```bash
git add src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: integrate CommentsSection into blog post page"
```

---

## Task 6: Admin page `/admin/kommentare`

**Files:**
- Create: `src/app/admin/kommentare/page.tsx`

**Step 1: Create admin kommentare page**

```typescript
// src/app/admin/kommentare/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Comment {
  _id: string;
  articleId: string;
  authorName: string;
  authorEmail?: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  _createdAt: string;
}

function StatusBadge({ status }: { status: Comment["status"] }) {
  const config = {
    pending: { label: "Ausstehend", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    approved: { label: "Freigegeben", className: "bg-green-100 text-green-800 border-green-200" },
    rejected: { label: "Abgelehnt", className: "bg-red-100 text-red-800 border-red-200" },
  };
  const { label, className } = config[status];
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${className}`}>
      {label}
    </span>
  );
}

export default function KommentarePage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/comments");
    if (res.ok) setComments(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    await fetch(`/api/admin/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function deleteComment(id: string) {
    if (!confirm("Kommentar wirklich löschen?")) return;
    await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
    await load();
  }

  const filtered = filter === "all" ? comments : comments.filter((c) => c.status === filter);
  const pendingCount = comments.filter((c) => c.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            Kommentare
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm mt-1" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
              {pendingCount} ausstehend
            </p>
          )}
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              filter === f
                ? "bg-[var(--color-accent)] text-white border-transparent"
                : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {f === "pending" ? "Ausstehend" : f === "approved" ? "Freigegeben" : f === "rejected" ? "Abgelehnt" : "Alle"}
            {f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
          Wird geladen…
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
          Keine Kommentare.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((c) => (
            <div
              key={c._id}
              className="rounded-2xl border p-5"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <span
                    className="font-medium text-sm"
                    style={{ fontFamily: "var(--font-sans)", color: "var(--color-foreground)" }}
                  >
                    {c.authorName}
                  </span>
                  {c.authorEmail && (
                    <span
                      className="ml-2 text-xs"
                      style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                    >
                      {c.authorEmail}
                    </span>
                  )}
                  <span
                    className="ml-2 text-xs"
                    style={{ color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}
                  >
                    · Artikel: <code className="text-[10px]">{c.articleId}</code>
                  </span>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <p
                className="text-sm leading-relaxed mb-4 whitespace-pre-wrap"
                style={{ color: "var(--color-foreground)", fontFamily: "var(--font-body-serif)" }}
              >
                {c.body}
              </p>

              <div className="flex gap-2 flex-wrap">
                {c.status !== "approved" && (
                  <button
                    onClick={() => setStatus(c._id, "approved")}
                    className="text-xs px-3 py-1 rounded-lg border transition-colors"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-foreground)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    ✓ Freischalten
                  </button>
                )}
                {c.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(c._id, "rejected")}
                    className="text-xs px-3 py-1 rounded-lg border transition-colors"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-muted)",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    ✗ Ablehnen
                  </button>
                )}
                <button
                  onClick={() => deleteComment(c._id)}
                  className="text-xs px-3 py-1 rounded-lg border transition-colors ml-auto"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-muted)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Verify build**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```

**Step 3: Commit**

```bash
git add src/app/admin/kommentare/page.tsx
git commit -m "feat: add admin kommentare page"
```

---

## Task 7: Add Kommentare to Admin Sidebar

**Files:**
- Modify: `src/components/admin/AdminNav.tsx`
- Modify: `src/components/admin/AdminMobileNav.tsx`

**Step 1: Add ChatIcon to AdminNav**

In `src/components/admin/AdminNav.tsx`, add this SVG icon function after `StarIcon` (around line 80):

```typescript
function ChatIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 2h13v9H8.5L5 14v-3H1V2z"/>
    </svg>
  );
}
```

Then add to the `navItems` array (after Ausarbeitungen):
```typescript
{ href: "/admin/kommentare", label: "Kommentare", Icon: ChatIcon },
```

**Step 2: Add ChatIcon to AdminMobileNav**

In `src/components/admin/AdminMobileNav.tsx`, add the same icon (but with `width="18" height="18"`):

```typescript
function ChatIcon() {
  return <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M1 2h13v9H8.5L5 14v-3H1V2z"/></svg>;
}
```

Add to `navItems` in AdminMobileNav:
```typescript
{ href: "/admin/kommentare", label: "Kommentare", Icon: ChatIcon },
```

**Step 3: Verify build**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build 2>&1 | tail -20
```

**Step 4: Commit**

```bash
git add src/components/admin/AdminNav.tsx src/components/admin/AdminMobileNav.tsx
git commit -m "feat: add Kommentare to admin sidebar"
```

---

## Final verification

```bash
cd /Users/rafaelgutierrez/aus-der-schrift && npm run build
```

Expected: build completes with no errors.

Manual smoke test:
1. Run `npm run dev`
2. Open a blog post → see "Kommentare" section at bottom
3. Submit a comment → "Dein Kommentar wird geprüft" message appears
4. Open `/admin/kommentare` → see the pending comment
5. Click "Freischalten" → status changes to approved
6. Reload the blog post → comment appears
