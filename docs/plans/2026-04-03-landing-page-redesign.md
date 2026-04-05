# Landing Page Redesign — Aus der Schrift

## Goal
Redesign the homepage, header, and footer to feel editorial, elegant, and modern —
inspired by church history manuscripts while staying clean and readable.

## Components to change

### 1. Header (`src/components/Header.tsx`)
- Logo: cross symbol `✦` + "Aus der Schrift" in Playfair Display
- Center nav: category links fetched from Sanity (dynamic)
- Right: DE/EN pill toggle switch (styled with active/inactive state)
- Sticky, white background, `backdrop-blur`, thin bottom border
- Mobile: hamburger or simplified layout

### 2. Homepage (`src/app/[locale]/page.tsx`)

**Hero section (split layout):**
- Left (55%): Large Playfair Display heading, subtitle in Source Serif 4, CTA button
- Right (45%): Atmospheric image from Unsplash (ancient manuscript / Greek codex)
- Image: `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c` (manuscript)
- Full viewport height on desktop, stacked on mobile

**Articles section:**
- Section heading "Neueste Artikel" with decorative line
- Featured article: horizontal card, image left, text right, large title
- Grid of next 5 articles: 3-column, each with image, category, title, date

### 3. Footer (`src/app/[locale]/layout.tsx`)
- 3-column layout: Logo + tagline | Kategorien links | Über den Blog links
- Bottom bar: copyright line
- Warm border top, same background as page

## Design tokens (no changes to existing)
- Background: `#FAFAF8`
- Accent: `#8B6F47` (warm brown)
- Border: `#E5E0D8`
- Fonts: Playfair Display (headings), Source Serif 4 (body), Inter (UI)

## Files to edit
1. `src/components/Header.tsx` — full rewrite
2. `src/app/[locale]/page.tsx` — full rewrite
3. `src/app/[locale]/layout.tsx` — update footer
4. `src/sanity/queries.ts` — ensure categories query exists (already does)
