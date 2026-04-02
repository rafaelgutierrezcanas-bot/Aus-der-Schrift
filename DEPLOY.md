# Deployment Guide

## Vercel Setup

1. Go to [vercel.com](https://vercel.com) → New Project
2. Import from GitHub: select `aus-der-schrift` from `rafaelgutierrezcanas-bot`
3. Framework: **Next.js** (auto-detected)
4. Add these Environment Variables:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = `y5fwmpkn`
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
   - `NEXT_PUBLIC_SANITY_API_VERSION` = `2024-01-01`
   - `REVALIDATE_SECRET` = (create a strong random string)
5. Click **Deploy**

## Sanity CORS

After deploying, add your Vercel URL to Sanity CORS:
1. Go to [sanity.io/manage](https://sanity.io/manage) → project `y5fwmpkn`
2. API → CORS Origins → Add: `https://your-vercel-url.vercel.app`
3. Check "Allow credentials"

## Sanity Webhook (for ISR)

To automatically revalidate the site when you publish new articles:
1. Sanity → API → Webhooks → Create
2. URL: `https://your-vercel-url.vercel.app/api/revalidate?secret=YOUR_REVALIDATE_SECRET`
3. Trigger on: Create, Update, Delete
4. Dataset: `production`

## Blogspot Migration

See `scripts/README.md` for instructions on migrating existing posts.

## Local Development

```bash
npm run dev    # Start dev server at http://localhost:3000
```

Sanity Studio is available at: http://localhost:3000/studio
