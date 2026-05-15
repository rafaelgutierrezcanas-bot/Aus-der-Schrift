# Analytics Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a DSGVO-compliant analytics dashboard integrated into the admin panel, tracking page views, unique visitors, top articles, and referrers — stored in Vercel KV (Redis), no cookies, no external services.

**Architecture:** A public `POST /api/track` endpoint records anonymized page view data into Vercel KV on every page load. An auth-protected `GET /api/admin/analytics` aggregates that data. The admin page at `/admin/analytics` fetches and renders it as a client component.

**Tech Stack:** Next.js App Router, Vercel KV (`@vercel/kv`), Tailwind CSS, pure CSS bar chart (no chart library).

---

## Pre-requisite: Vercel KV Setup (manual step, do NOT skip)

Before writing any code, the Vercel KV database must exist and env vars must be available locally:

1. Go to vercel.com → project → Storage → Create Database → KV (Upstash)
2. Connect it to the project
3. Run locally: `npx vercel env pull .env.local`

This adds `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, and `KV_REST_API_READ_ONLY_TOKEN` to `.env.local`.

If you skip this step, all KV operations will throw and nothing will work. Confirm env vars are present before proceeding.

---

### Task 1: Install package and create Redis client

**Files:**
- Create: `src/lib/redis.ts`

**Step 1: Install the package**

```bash
npm install @vercel/kv
```

Expected: package added to `node_modules` and `package.json`

**Step 2: Create the client file**

Create `src/lib/redis.ts`:

```ts
import { kv } from "@vercel/kv";
export { kv };
```

That's it. `@vercel/kv` reads the env vars automatically (`KV_REST_API_URL`, `KV_REST_API_TOKEN`).

**Step 3: Verify env vars are present**

```bash
grep KV .env.local
```

Expected: lines with `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`

**Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/redis.ts
git commit -m "feat: install @vercel/kv and create Redis client"
```

---

### Task 2: Create the track API route

**Files:**
- Create: `src/app/api/track/route.ts`

**Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/redis";
import { createHash } from "crypto";

const BOT_UA = /bot|crawler|spider|scraper|headless|lighthouse|pingdom|uptimerobot/i;

export async function POST(req: NextRequest) {
  try {
    const ua = req.headers.get("user-agent") ?? "";
    if (BOT_UA.test(ua)) return NextResponse.json({ ok: true });

    const body = await req.json().catch(() => null);
    const path: string = body?.path ?? "";
    const referrer: string = body?.referrer ?? "";

    if (!path || typeof path !== "string") return NextResponse.json({ ok: true });

    // Anonymize visitor: hash IP + UA + daily salt. Never store raw IP.
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const visitorHash = createHash("sha256")
      .update(`${ip}|${ua}|${today}|theologik-analytics`)
      .digest("hex");

    // Normalize referrer: store only domain, not full URL
    let referrerDomain = "direct";
    if (referrer) {
      try {
        referrerDomain = new URL(referrer).hostname.replace(/^www\./, "");
      } catch {
        // malformed referrer header → treat as direct
      }
    }

    // Normalize path: strip locale prefix (/de, /en) for consistent grouping
    const normalizedPath = path.replace(/^\/(de|en)(\/|$)/, "/").replace(/\/$/, "") || "/";

    const TTL = 60 * 60 * 24 * 92; // 92 days in seconds

    await Promise.all([
      kv.incr(`views:day:${today}:${normalizedPath}`),
      kv.incr(`views:total:${normalizedPath}`),
      kv.sadd(`visitors:day:${today}`, visitorHash),
      kv.hincrby(`referrers:${today}`, referrerDomain, 1),
    ]);

    // Set TTL on daily keys (best effort — if already set, that's fine)
    await Promise.allSettled([
      kv.expire(`views:day:${today}:${normalizedPath}`, TTL),
      kv.expire(`visitors:day:${today}`, TTL),
      kv.expire(`referrers:${today}`, TTL),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    // Never let analytics errors surface to users
    return NextResponse.json({ ok: true });
  }
}
```

**Step 2: Manual verification**

Start dev server (`npm run dev`), then in a new terminal:

```bash
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{"path":"/blog/test-artikel","referrer":"https://google.com/search?q=test"}'
```

Expected: `{"ok":true}`

**Step 3: Commit**

```bash
git add "src/app/api/track/route.ts"
git commit -m "feat: add /api/track endpoint for DSGVO-compliant page view recording"
```

---

### Task 3: TrackPageView client component + layout integration

**Files:**
- Create: `src/components/TrackPageView.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Step 1: Create the component**

Create `src/components/TrackPageView.tsx`:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function TrackPageView() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    // Don't track admin routes
    if (pathname.startsWith("/admin")) return;
    // Deduplicate (React StrictMode fires effects twice in dev)
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer }),
    }).catch(() => {
      // Silently ignore — analytics errors must never affect the user
    });
  }, [pathname]);

  return null;
}
```

**Step 2: Add to the public layout**

Open `src/app/[locale]/layout.tsx`. Add the import after the existing imports:

```ts
import { TrackPageView } from "@/components/TrackPageView";
```

Then inside the returned JSX, add `<TrackPageView />` just before the closing `</NextIntlClientProvider>`:

```tsx
  return (
    <NextIntlClientProvider messages={messages}>
      <TrackPageView />        {/* ← add this line */}
      <Header locale={locale} />
      <main className="min-h-screen">{children}</main>
      {/* ... footer ... */}
    </NextIntlClientProvider>
  );
```

**Step 3: Verify in browser**

1. Run `npm run dev`
2. Open http://localhost:3000/de in browser
3. Open DevTools → Network → filter "track"
4. Reload the page

Expected: a `POST /api/track` request with status 200, payload containing current path and referrer.

**Step 4: Commit**

```bash
git add src/components/TrackPageView.tsx "src/app/[locale]/layout.tsx"
git commit -m "feat: add TrackPageView component to public layout"
```

---

### Task 4: Analytics data API route

**Files:**
- Create: `src/app/api/admin/analytics/route.ts`

This route is auth-protected (same cookie pattern as other admin routes: `admin_auth` cookie must equal `ADMIN_SECRET` env var).

**Step 1: Create the file**

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { kv } from "@/lib/redis";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function getDates(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export async function GET(req: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const days = Math.min(Math.max(parseInt(req.nextUrl.searchParams.get("days") ?? "30"), 7), 90);
  const dates = getDates(days);
  const today = new Date().toISOString().slice(0, 10);

  // --- Daily view counts ---
  const dailyViews = await Promise.all(
    dates.map(async (date) => {
      const keys = await kv.keys(`views:day:${date}:*`);
      if (keys.length === 0) return { date, views: 0 };
      const counts = await Promise.all(keys.map((k) => kv.get<number>(k)));
      return { date, views: counts.reduce((s, c) => s + (c ?? 0), 0) };
    })
  );

  // --- Unique visitors per day ---
  const uniqueVisitors = await Promise.all(
    dates.map(async (date) => {
      const count = await kv.scard(`visitors:day:${date}`);
      return { date, visitors: count };
    })
  );

  // --- Top pages (all-time) ---
  const totalKeys = await kv.keys("views:total:*");
  const topPagesRaw = await Promise.all(
    totalKeys.map(async (key) => ({
      path: key.replace("views:total:", ""),
      views: (await kv.get<number>(key)) ?? 0,
    }))
  );
  topPagesRaw.sort((a, b) => b.views - a.views);
  const topPages = topPagesRaw.slice(0, 10);

  // --- Referrers (aggregated over the period) ---
  const referrerMap = new Map<string, number>();
  await Promise.all(
    dates.map(async (date) => {
      const refs = await kv.hgetall<Record<string, number>>(`referrers:${date}`);
      if (!refs) return;
      for (const [domain, count] of Object.entries(refs)) {
        referrerMap.set(domain, (referrerMap.get(domain) ?? 0) + Number(count));
      }
    })
  );
  const referrers = Array.from(referrerMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalViews = dailyViews.reduce((s, d) => s + d.views, 0);
  const totalVisitors = uniqueVisitors.reduce((s, d) => s + d.visitors, 0);
  const todayViews = dailyViews.find((d) => d.date === today)?.views ?? 0;

  return NextResponse.json({ totalViews, totalVisitors, todayViews, dailyViews, topPages, referrers });
}
```

**Step 2: Manual verification**

With dev server running, and logged in as admin (so the cookie is set):

```bash
curl -s 'http://localhost:3000/api/admin/analytics?days=7' \
  --cookie "admin_auth=<your ADMIN_SECRET value from .env.local>"
```

Expected: JSON with `totalViews`, `totalVisitors`, `todayViews`, `dailyViews`, `topPages`, `referrers`.

If you get `{"error":"Unauthorized"}` — verify the cookie value matches `ADMIN_SECRET` in `.env.local`.

**Step 3: Commit**

```bash
git add "src/app/api/admin/analytics/route.ts"
git commit -m "feat: add auth-protected /api/admin/analytics data route"
```

---

### Task 5: Analytics admin page

**Files:**
- Create: `src/app/admin/analytics/page.tsx`

This is a client component because it needs period-selector state and fetches data on the client.

**Step 1: Create the page**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DayEntry = { date: string; views: number };
type PageEntry = { path: string; views: number };
type ReferrerEntry = { domain: string; count: number };

type AnalyticsData = {
  totalViews: number;
  totalVisitors: number;
  todayViews: number;
  dailyViews: DayEntry[];
  topPages: PageEntry[];
  referrers: ReferrerEntry[];
};

function BarChart({ data }: { data: DayEntry[] }) {
  const max = Math.max(...data.map((d) => d.views), 1);
  return (
    <div className="flex items-end gap-0.5 h-20 w-full">
      {data.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.views} Aufrufe`}
          className="flex-1 bg-[var(--color-accent)] rounded-t-sm opacity-70 hover:opacity-100 transition-opacity min-h-[2px]"
          style={{ height: `${Math.max((d.views / max) * 100, d.views > 0 ? 4 : 2)}%` }}
        />
      ))}
    </div>
  );
}

function articleHref(path: string): string | null {
  const m = path.match(/^\/blog\/(.+)$/);
  return m ? `/admin/${m[1]}` : null;
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/analytics?days=${days}`)
      .then((r) => r.json())
      .then((d: AnalyticsData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  const totalReferrerCount = data?.referrers.reduce((s, r) => s + r.count, 0) ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-serif text-2xl text-[var(--color-foreground)]">Statistiken</h1>
        <div className="flex gap-1" style={{ fontFamily: "var(--font-sans)" }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                days === d
                  ? "bg-[var(--color-accent)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              }`}
            >
              {d} Tage
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
          Lade Daten…
        </p>
      )}

      {!loading && data && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: `Aufrufe (${days} Tage)`, value: data.totalViews },
              { label: `Besucher (${days} Tage)`, value: data.totalVisitors },
              { label: "Heute", value: data.todayViews },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)]"
              >
                <p className="text-2xl font-semibold text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-sans)" }}>
                  {s.value.toLocaleString("de-DE")}
                </p>
                <p className="text-xs text-[var(--color-muted)] mt-1" style={{ fontFamily: "var(--font-sans)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
              Aufrufe pro Tag
            </p>
            <BarChart data={data.dailyViews} />
            <div className="flex justify-between mt-2 text-[10px] text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
              <span>{data.dailyViews[0]?.date}</span>
              <span>{data.dailyViews[data.dailyViews.length - 1]?.date}</span>
            </div>
          </div>

          {/* Top pages + Referrers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top pages */}
            <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                Meist gelesene Seiten
              </p>
              {data.topPages.length === 0 && (
                <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                  Noch keine Daten
                </p>
              )}
              <ol className="space-y-2">
                {data.topPages.map((p, i) => {
                  const href = articleHref(p.path);
                  return (
                    <li key={p.path} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--color-muted)] w-4 shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
                        {i + 1}
                      </span>
                      <span className="flex-1 text-sm truncate" style={{ fontFamily: "var(--font-sans)" }}>
                        {href ? (
                          <Link href={href} className="hover:text-[var(--color-accent)] transition-colors">
                            {p.path}
                          </Link>
                        ) : (
                          p.path
                        )}
                      </span>
                      <span className="text-xs text-[var(--color-muted)] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
                        {p.views.toLocaleString("de-DE")}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Referrers */}
            <div className="bg-[var(--color-surface)] rounded-xl p-5 border border-[var(--color-border)]">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)] mb-4" style={{ fontFamily: "var(--font-sans)" }}>
                Woher kommen Leser
              </p>
              {data.referrers.length === 0 && (
                <p className="text-sm text-[var(--color-muted)]" style={{ fontFamily: "var(--font-sans)" }}>
                  Noch keine Daten
                </p>
              )}
              <ol className="space-y-3">
                {data.referrers.map((r, i) => {
                  const pct = totalReferrerCount > 0 ? Math.round((r.count / totalReferrerCount) * 100) : 0;
                  return (
                    <li key={r.domain}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-[var(--color-muted)] w-4 shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
                          {i + 1}
                        </span>
                        <span className="flex-1 text-sm truncate" style={{ fontFamily: "var(--font-sans)" }}>
                          {r.domain}
                        </span>
                        <span className="text-xs text-[var(--color-muted)] shrink-0" style={{ fontFamily: "var(--font-sans)" }}>
                          {pct}%
                        </span>
                      </div>
                      <div className="ml-6 h-1 bg-[var(--color-border)] rounded-full">
                        <div
                          className="h-1 bg-[var(--color-accent)] rounded-full opacity-60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
```

**Step 2: Verify in browser**

1. Navigate to http://localhost:3000/admin/analytics (must be logged in)
2. You should see the analytics page with stat cards, bar chart, top pages, referrers
3. First visit: all values will be 0 or empty — that's correct, data needs to accumulate
4. Open a new tab, visit a public page, return to analytics, switch period to "7 Tage" — today's count should be 1

**Step 3: Commit**

```bash
git add "src/app/admin/analytics/page.tsx"
git commit -m "feat: add analytics dashboard page to admin panel"
```

---

### Task 6: Add Statistiken to AdminNav and AdminMobileNav

**Files:**
- Modify: `src/components/admin/AdminNav.tsx`
- Modify: `src/components/admin/AdminMobileNav.tsx`

**Step 1: Add BarChartIcon to AdminNav**

Open `src/components/admin/AdminNav.tsx`.

Add the new icon function after the existing `FolderIcon` function (around line 45):

```tsx
function BarChartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="3" height="7" rx="0.5"/>
      <rect x="6" y="4" width="3" height="10" rx="0.5"/>
      <rect x="11" y="1" width="3" height="13" rx="0.5"/>
    </svg>
  );
}
```

Then add the new nav item to the `navItems` array (after the `projekte` entry):

```ts
{ href: "/admin/analytics", label: "Statistiken", Icon: BarChartIcon },
```

**Step 2: Add BarChartIcon to AdminMobileNav**

Open `src/components/admin/AdminMobileNav.tsx`.

Add the icon function after `FolderIcon` (around line 20):

```tsx
function BarChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="7" width="3" height="7" rx="0.5"/>
      <rect x="6" y="4" width="3" height="10" rx="0.5"/>
      <rect x="11" y="1" width="3" height="13" rx="0.5"/>
    </svg>
  );
}
```

Add to `navItems` array:

```ts
{ href: "/admin/analytics", label: "Statistiken", Icon: BarChartIcon },
```

**Step 3: Verify in browser**

1. Go to http://localhost:3000/admin
2. Sidebar should show a "Statistiken" entry with bar chart icon
3. On mobile (or narrow browser), bottom nav should also show "Statistiken"
4. Clicking it should load the analytics page

**Step 4: Commit**

```bash
git add src/components/admin/AdminNav.tsx src/components/admin/AdminMobileNav.tsx
git commit -m "feat: add Statistiken nav item to admin sidebar and mobile nav"
```

---

## Done

After all tasks are complete:

- Public pages send anonymous page view events to `/api/track`
- Admin panel shows analytics at `/admin/analytics`
- Period selector (7 / 30 / 90 days) works
- Data accumulates over time — first day will show only today's numbers

**Reminder: push to Vercel so the KV database is connected in production.**
