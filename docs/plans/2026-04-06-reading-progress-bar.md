# Reading Progress Bar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a fixed reading progress bar at the bottom of the viewport that fills as the user scrolls through a blog article.

**Architecture:** A new `ReadingProgressBar` client component tracks `window.scrollY` via a `scroll` event listener and renders a fixed bottom bar. It is imported only in the article detail page so it never appears elsewhere.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript

---

### Task 1: Create the ReadingProgressBar component

**Files:**
- Create: `src/components/ReadingProgressBar.tsx`

**Step 1: Write the component**

```tsx
"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // initialise on mount
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "3px",
        zIndex: 50,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--color-accent)",
          transition: "width 0.05s linear",
        }}
      />
    </div>
  );
}
```

**Step 2: Verify the file was created**

```bash
cat src/components/ReadingProgressBar.tsx
```

Expected: file contents printed without errors.

**Step 3: Commit**

```bash
git add src/components/ReadingProgressBar.tsx
git commit -m "feat: add ReadingProgressBar client component"
```

---

### Task 2: Integrate into the article page

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

**Step 1: Add the import**

At the top of the file, after the existing imports, add:

```tsx
import { ReadingProgressBar } from "@/components/ReadingProgressBar";
```

**Step 2: Render it in the JSX**

In the `return (...)` block, add `<ReadingProgressBar />` as the very first element inside the outermost `<div>`:

```tsx
return (
  <div className="max-w-5xl mx-auto px-6 py-16">
    <ReadingProgressBar />
    {/* rest of article content — no other changes */}
```

**Step 3: Verify the build compiles**

```bash
npm run build
```

Expected: build completes with no errors. Warnings are fine.

**Step 4: Verify locally**

```bash
npm run dev
```

Open http://localhost:3000/de/blog/<any-slug> in a browser. Scroll down — the 3px accent-colored bar should grow at the bottom of the viewport. Scroll back to top — bar should shrink back to 0%.

**Step 5: Commit**

```bash
git add src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat: show reading progress bar on article pages"
```

---

### Task 3: Push to remote

```bash
git push
```

Expected: branch `main` pushed to origin successfully.
