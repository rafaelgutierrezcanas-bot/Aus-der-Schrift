# Reading Progress Bar — Design

**Date:** 2026-04-06

## Overview

Add a reading progress bar to blog article pages that shows how far the user has scrolled through an article.

## Placement

Fixed at the **bottom of the viewport**, full width, height `3px`. Only renders on the article detail page (`/[locale]/blog/[slug]`).

## Component

**`src/components/ReadingProgressBar.tsx`** — client component (`"use client"`).

- Listens to the `window` `scroll` event via `useEffect`
- Computes progress: `scrollY / (document.scrollingElement.scrollHeight - window.innerHeight) * 100`
- Clamps to `[0, 100]`
- Renders a `<div>` fixed at `bottom: 0`, `left: 0`, full width, height `3px`, `z-index: 50`
- Inner fill `<div>` width is set via inline style to `${progress}%`
- Color: `var(--color-accent)` (matches site accent color)
- Cleans up the event listener on unmount

## Integration

Imported in `src/app/[locale]/blog/[slug]/page.tsx` and rendered at the top of the returned JSX (as a sibling, not inside the article layout divs). This keeps it scoped to article pages only.

## Non-goals

- No animation/easing (keep it simple)
- Not shown on any other page (home, blog index, category pages, etc.)
- No percentage label or tooltip
