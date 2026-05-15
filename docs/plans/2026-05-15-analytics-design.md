# Analytics Panel — Design

## Goal

A DSGVO-compliant analytics dashboard integrated into the existing admin panel, showing page views, unique visitors, top articles, and traffic sources without cookies or external services.

## Architecture

**Stack:**
- Vercel KV (Upstash Redis, free tier) as storage
- `/api/track` POST endpoint records page views
- `<TrackPageView />` client component fires on every public page load
- `/admin/analytics` page reads and displays the data

**Redis data structure:**
```
views:day:{YYYY-MM-DD}:{path}     INCR      → daily views per path
views:total:{path}                INCR      → all-time views per path
visitors:day:{YYYY-MM-DD}         SADD      → set of anonymized visitor hashes
referrers:{YYYY-MM-DD}            ZINCRBY   → referrer domain → count
```

Keys for `views:day` and `visitors:day` get a 92-day TTL (auto-expiry).

## DSGVO Compliance

- No cookies set, no localStorage used
- IP is hashed with SHA-256 + a daily rotating salt → original IP discarded immediately
- Hash changes every day → cross-day tracking impossible
- Referrer stored as domain only (e.g. `google.com`, not full URL)
- All data stored on Vercel infrastructure (EU region selectable)
- No third-party scripts loaded on the public site

## Tracking Component

`<TrackPageView />` is a client component added to `src/app/[locale]/layout.tsx`.

- Fires `POST /api/track` with `{ path, referrer }` on mount
- Admin routes (`/admin/*`) are excluded
- Known bot User-Agents are filtered on the API side

## API Routes

**`POST /api/track`**
1. Read `x-forwarded-for` header → hash with SHA-256 + daily salt → discard raw IP
2. Write to Redis: daily views, total views, unique visitor set, referrers
3. Return `200 OK`
- No auth required (public endpoint, write-only, no sensitive data exposed)

**`GET /api/admin/analytics?days=30`**
- Auth-protected (admin cookie)
- Aggregates Redis data for the requested period
- Returns: daily view counts, total views per path, unique visitor counts, referrer breakdown

## Admin Panel UI

New page `/admin/analytics` with a new nav entry "Statistiken".

**Layout:**
```
4 stat cards: Aufrufe (30d) | Besucher (30d) | Heute | Artikel aufgerufen

Bar chart: views per day for selected period (7 / 30 / 90 days)
  → pure CSS bars, no external chart library

Two tables side by side:
  Left:  Top articles (title + view count, linked to /admin/{slug})
  Right: Top referrers (domain + count + percentage)
```

**Period selector:** 7 Tage / 30 Tage / 90 Tage (client-side state, re-fetches from API)

## New Files

| File | Purpose |
|------|---------|
| `src/lib/redis.ts` | Vercel KV client singleton |
| `src/components/TrackPageView.tsx` | Client component, fires track request |
| `src/app/api/track/route.ts` | Public track endpoint |
| `src/app/api/admin/analytics/route.ts` | Auth-protected data API |
| `src/app/admin/analytics/page.tsx` | Analytics dashboard page |

## Modified Files

| File | Change |
|------|--------|
| `src/app/[locale]/layout.tsx` | Add `<TrackPageView />` |
| `src/components/admin/AdminNav.tsx` | Add "Statistiken" nav item |
| `src/components/admin/AdminMobileNav.tsx` | Add "Statistiken" mobile nav item |

## Setup Required (one-time, manual)

1. In Vercel dashboard: Storage → Create KV database → connect to project
2. `VERCEL_KV_URL`, `VERCEL_KV_REST_API_URL`, `VERCEL_KV_REST_API_TOKEN` are auto-added to env
3. `npx vercel env pull` to get them locally for development
