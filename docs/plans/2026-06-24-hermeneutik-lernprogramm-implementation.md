# Hermeneutik-Lernprogramm Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an interactive Bible hermeneutics learning tool integrated into the Theologik website as a route under `/ressourcen/hermeneutik`, with a methods workbench, step-by-step guided analysis, Sanity CMS content management, and dark UI.

**Architecture:** New route group under `src/app/[locale]/ressourcen/hermeneutik/` using the existing Next.js 16 + Sanity + next-intl stack. Sanity schemas for content (steps, texts, analyses), server components for pages, client components for interactive workbench. User progress stored in localStorage (guest) with optional Supabase sync (post-MVP). The existing bilingual pattern (`De`/`En` field suffixes) is used for all content.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, Sanity v5, next-intl 4, Framer Motion (new dep for micro-interactions), @portabletext/react

**Design Doc:** `docs/plans/2026-06-24-hermeneutik-lernprogramm-design.md`

---

## Existing Codebase Context

- **Bilingual pattern:** Fields use `De`/`En` suffixes (e.g. `titleDe`, `titleEn`), NOT locale objects
- **Sanity schemas:** Located in `src/sanity/schemas/`, registered in `src/sanity/schemas/index.ts`
- **GROQ queries:** Located in `src/sanity/queries.ts`
- **Sanity client:** `src/sanity/client.ts` — `import { client } from "@/sanity/client"`
- **i18n:** `next-intl` with `getTranslations("namespace")` server-side, messages in `/messages/de.json` and `/messages/en.json`
- **Locale routing:** `src/app/[locale]/...` with `params: Promise<{ locale: string }>`
- **SEO:** `buildLocalizedMetadata()` from `src/lib/seo.ts`
- **Localized helpers:** `getLocalizedTitle(article, locale)` etc. in `src/lib/utils.ts`
- **Theme colors:** CSS variables in `src/app/globals.css` — `--color-background`, `--color-foreground`, `--color-accent`, `--color-muted`, `--color-border`, `--color-surface`
- **Fonts:** `var(--font-serif)` (Playfair), `var(--font-body-serif)` (Source Serif 4), `var(--font-sans)` (Inter)
- **Dark mode:** `.dark` class via `next-themes`, color vars redefined in `.dark {}`
- **Portable text:** `PortableTextRenderer.tsx` component in `src/components/`
- **Existing ressourcen:** Placeholder page at `src/app/[locale]/ressourcen/page.tsx` with layout

---

## Task 1: Add Framer Motion dependency

**Files:**
- Modify: `package.json`

**Step 1: Install framer-motion**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && npm install framer-motion`

**Step 2: Verify installation**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && node -e "require('framer-motion'); console.log('OK')"`
Expected: `OK`

**Step 3: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add package.json package-lock.json
git commit -m "chore: add framer-motion for hermeneutik micro-interactions"
```

---

## Task 2: Create Sanity schemas for Hermeneutik content

**Files:**
- Create: `src/sanity/schemas/hermeneutikSchritt.ts`
- Create: `src/sanity/schemas/hermeneutikText.ts`
- Modify: `src/sanity/schemas/index.ts`

**Step 1: Create the `hermeneutikSchritt` schema**

Create `src/sanity/schemas/hermeneutikSchritt.ts`:

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "hermeneutikSchritt",
  title: "Hermeneutik-Schritt",
  type: "document",
  fields: [
    defineField({
      name: "titleDe",
      title: "Titel (Deutsch)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titleEn", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Reihenfolge",
      type: "number",
      validation: (r) => r.required().min(1).max(6),
    }),
    defineField({
      name: "accentColor",
      title: "Akzentfarbe (hex)",
      type: "string",
      description: "z.B. #F59E0B für Amber",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon-Name",
      type: "string",
      description: "Lucide icon name, z.B. 'search', 'scroll-text', 'book-open'",
    }),
    defineField({
      name: "explanationDe",
      title: "Erklärung (Deutsch)",
      type: "array",
      of: [{ type: "block" }],
      description: "Was / Warum / Wie — ausführliche Erklärung des Schritts",
    }),
    defineField({
      name: "explanationEn",
      title: "Explanation (English)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "guidingQuestionsDe",
      title: "Leitfragen (Deutsch)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "guidingQuestionsEn",
      title: "Guiding Questions (English)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "commonMistakesDe",
      title: "Häufige Fehler (Deutsch)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "commonMistakesEn",
      title: "Common Mistakes (English)",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "interactionType",
      title: "Interaktionstyp",
      type: "string",
      options: {
        list: [
          { title: "Freitext", value: "freetext" },
          { title: "Markierung im Text", value: "marking" },
          { title: "Multiple Choice", value: "multiplechoice" },
        ],
      },
    }),
    defineField({
      name: "sources",
      title: "Quellen (Buchverweise)",
      type: "array",
      of: [{ type: "string" }],
      description: "z.B. 'Osborne, Hermeneutical Spiral, Kap. 3'",
    }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "titleDe", order: "order" },
    prepare({ title, order }) {
      return { title: `${order}. ${title}` };
    },
  },
});
```

**Step 2: Create the `hermeneutikText` schema**

Create `src/sanity/schemas/hermeneutikText.ts`:

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "hermeneutikText",
  title: "Hermeneutik-Text",
  type: "document",
  fields: [
    defineField({
      name: "titleDe",
      title: "Titel (Deutsch)",
      type: "string",
      description: "z.B. '1. Thessalonicher 1,1-10'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "titleEn",
      title: "Title (English)",
      type: "string",
      description: "e.g. '1 Thessalonians 1:1-10'",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "titleEn", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bibleReference",
      title: "Bibelstelle (kurz)",
      type: "string",
      description: "z.B. '1Thess 1,1-10'",
    }),
    defineField({
      name: "genre",
      title: "Genre",
      type: "string",
      options: {
        list: [
          { title: "Epistel", value: "epistle" },
          { title: "Narrativ", value: "narrative" },
          { title: "Poesie", value: "poetry" },
          { title: "Prophetie", value: "prophecy" },
          { title: "Weisheit", value: "wisdom" },
          { title: "Apokalyptik", value: "apocalyptic" },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "difficulty",
      title: "Schwierigkeit",
      type: "string",
      options: {
        list: [
          { title: "Einsteiger", value: "beginner" },
          { title: "Fortgeschritten", value: "intermediate" },
          { title: "Experte", value: "advanced" },
        ],
      },
      initialValue: "beginner",
    }),
    defineField({
      name: "order",
      title: "Empfohlene Reihenfolge",
      type: "number",
      description: "Sortierung in der Textauswahl",
    }),
    defineField({
      name: "textContentDe",
      title: "Bibeltext (Deutsch)",
      type: "array",
      of: [{ type: "block" }],
      description: "Der vollständige Bibeltext (z.B. Elberfelder)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "textContentEn",
      title: "Bible Text (English)",
      type: "array",
      of: [{ type: "block" }],
      description: "Full Bible text (e.g. ESV)",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "backgroundInfoDe",
      title: "Hintergrundinformationen (Deutsch)",
      type: "array",
      of: [{ type: "block" }],
      description: "Historischer Kontext, Einleitungsfragen — wird in Schritt 2 angezeigt",
    }),
    defineField({
      name: "backgroundInfoEn",
      title: "Background Information (English)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "stepAnalyses",
      title: "Schritt-Analysen",
      type: "array",
      of: [
        {
          type: "object",
          name: "stepAnalysis",
          title: "Schritt-Analyse",
          fields: [
            defineField({
              name: "step",
              title: "Schritt",
              type: "reference",
              to: [{ type: "hermeneutikSchritt" }],
              validation: (r) => r.required(),
            }),
            defineField({
              name: "expertAnalysisDe",
              title: "Musteranalyse (Deutsch)",
              type: "array",
              of: [{ type: "block" }],
              description: "Die Experten-Musterlösung für diesen Schritt",
            }),
            defineField({
              name: "expertAnalysisEn",
              title: "Expert Analysis (English)",
              type: "array",
              of: [{ type: "block" }],
            }),
            defineField({
              name: "hintsDe",
              title: "Hinweise (Deutsch)",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "hintsEn",
              title: "Hints (English)",
              type: "array",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "interactionData",
              title: "Interaktionsdaten (JSON)",
              type: "text",
              description: "JSON: MC-Optionen, korrekte Markierungen, etc. Format: { options: [...], correct: [...] }",
            }),
          ],
          preview: {
            select: { title: "step.titleDe", order: "step.order" },
            prepare({ title, order }) {
              return { title: `${order || "?"}: ${title || "Schritt"}` };
            },
          },
        },
      ],
    }),
  ],
  orderings: [
    { title: "Reihenfolge", name: "order", by: [{ field: "order", direction: "asc" }] },
  ],
  preview: {
    select: { title: "titleDe", genre: "genre", difficulty: "difficulty" },
    prepare({ title, genre, difficulty }) {
      return {
        title,
        subtitle: `${genre || "?"} · ${difficulty || "?"}`,
      };
    },
  },
});
```

**Step 3: Register schemas in index.ts**

Modify `src/sanity/schemas/index.ts` — add imports and include in the exported array:

```typescript
import hermeneutikSchritt from "./hermeneutikSchritt";
import hermeneutikText from "./hermeneutikText";
```

Add `hermeneutikSchritt` and `hermeneutikText` to the `schemaTypes` array.

**Step 4: Verify Sanity Studio loads**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && npm run dev`

Open `http://localhost:3000/studio` — verify "Hermeneutik-Schritt" and "Hermeneutik-Text" appear as document types.

**Step 5: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/sanity/schemas/hermeneutikSchritt.ts src/sanity/schemas/hermeneutikText.ts src/sanity/schemas/index.ts
git commit -m "feat: add Sanity schemas for hermeneutik steps and texts"
```

---

## Task 3: Add GROQ queries for Hermeneutik data

**Files:**
- Modify: `src/sanity/queries.ts`

**Step 1: Add hermeneutik queries**

Append to `src/sanity/queries.ts`:

```typescript
// ── Hermeneutik ──────────────────────────────────────────

export const allHermeneutikStepsQuery = `
  *[_type == "hermeneutikSchritt"] | order(order asc) {
    _id,
    titleDe,
    titleEn,
    "slug": slug.current,
    order,
    accentColor,
    icon,
    explanationDe,
    explanationEn,
    guidingQuestionsDe,
    guidingQuestionsEn,
    commonMistakesDe,
    commonMistakesEn,
    interactionType,
    sources
  }
`;

export const allHermeneutikTextsQuery = `
  *[_type == "hermeneutikText"] | order(order asc) {
    _id,
    titleDe,
    titleEn,
    "slug": slug.current,
    bibleReference,
    genre,
    difficulty,
    order
  }
`;

export const hermeneutikTextBySlugQuery = `
  *[_type == "hermeneutikText" && slug.current == $slug][0] {
    _id,
    titleDe,
    titleEn,
    "slug": slug.current,
    bibleReference,
    genre,
    difficulty,
    textContentDe,
    textContentEn,
    backgroundInfoDe,
    backgroundInfoEn,
    stepAnalyses[] {
      step-> {
        _id,
        titleDe,
        titleEn,
        "slug": slug.current,
        order,
        accentColor,
        icon,
        interactionType,
        guidingQuestionsDe,
        guidingQuestionsEn
      },
      expertAnalysisDe,
      expertAnalysisEn,
      hintsDe,
      hintsEn,
      interactionData
    }
  }
`;
```

**Step 2: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/sanity/queries.ts
git commit -m "feat: add GROQ queries for hermeneutik steps and texts"
```

---

## Task 4: Add i18n translation keys

**Files:**
- Modify: `/messages/de.json`
- Modify: `/messages/en.json`

**Step 1: Add `hermeneutik` namespace to `de.json`**

Add a new `"hermeneutik"` key at the top level of `/messages/de.json`:

```json
"hermeneutik": {
  "title": "Hermeneutik lernen",
  "subtitle": "Lerne biblische Texte methodisch zu analysieren",
  "description": "Ein interaktives Lernprogramm für biblische Hermeneutik — basierend auf den Methoden von Osborne, Köstenberger und Klein.",
  "workbench": "Werkbank",
  "method": "Methode",
  "progress": "Fortschritt",
  "overview": "Übersicht",
  "startAnalysis": "Analyse starten",
  "continueAnalysis": "Analyse fortsetzen",
  "stepOf": "Schritt {current} von {total}",
  "completed": "Abgeschlossen",
  "notStarted": "Noch nicht begonnen",
  "inProgress": "In Bearbeitung",
  "showExpertAnalysis": "Musteranalyse anzeigen",
  "hideExpertAnalysis": "Musteranalyse ausblenden",
  "yourAnalysis": "Deine Analyse",
  "expertAnalysis": "Musteranalyse",
  "next": "Weiter",
  "back": "Zurück",
  "finish": "Analyse abschließen",
  "methodHelp": "Was mache ich in diesem Schritt?",
  "hints": "Hinweise",
  "showHint": "Hinweis anzeigen",
  "selectText": "Wähle einen Text",
  "difficulty": "Schwierigkeit",
  "genre": "Genre",
  "beginner": "Einsteiger",
  "intermediate": "Fortgeschritten",
  "advanced": "Experte",
  "epistle": "Epistel",
  "narrative": "Narrativ",
  "poetry": "Poesie",
  "prophecy": "Prophetie",
  "wisdom": "Weisheit",
  "apocalyptic": "Apokalyptik",
  "completedAnalyses": "Abgeschlossene Analysen",
  "noAnalysesYet": "Du hast noch keine Analyse abgeschlossen.",
  "whatIs": "Was?",
  "why": "Warum?",
  "how": "Wie?",
  "example": "Beispiel",
  "commonMistakes": "Häufige Fehler",
  "sources": "Quellen",
  "backgroundInfo": "Hintergrund-Info",
  "guidingQuestions": "Leitfragen",
  "analysisComplete": "Analyse abgeschlossen!",
  "analysisCompleteDesc": "Du hast alle 6 Schritte durchgearbeitet.",
  "viewInArchive": "Im Archiv ansehen",
  "startNew": "Neuen Text analysieren"
}
```

**Step 2: Add `hermeneutik` namespace to `en.json`**

Add the same key structure with English translations:

```json
"hermeneutik": {
  "title": "Learn Hermeneutics",
  "subtitle": "Learn to analyze biblical texts methodically",
  "description": "An interactive learning program for biblical hermeneutics — based on the methods of Osborne, Köstenberger, and Klein.",
  "workbench": "Workbench",
  "method": "Method",
  "progress": "Progress",
  "overview": "Overview",
  "startAnalysis": "Start Analysis",
  "continueAnalysis": "Continue Analysis",
  "stepOf": "Step {current} of {total}",
  "completed": "Completed",
  "notStarted": "Not started",
  "inProgress": "In progress",
  "showExpertAnalysis": "Show expert analysis",
  "hideExpertAnalysis": "Hide expert analysis",
  "yourAnalysis": "Your Analysis",
  "expertAnalysis": "Expert Analysis",
  "next": "Next",
  "back": "Back",
  "finish": "Complete Analysis",
  "methodHelp": "What do I do in this step?",
  "hints": "Hints",
  "showHint": "Show hint",
  "selectText": "Choose a text",
  "difficulty": "Difficulty",
  "genre": "Genre",
  "beginner": "Beginner",
  "intermediate": "Intermediate",
  "advanced": "Advanced",
  "epistle": "Epistle",
  "narrative": "Narrative",
  "poetry": "Poetry",
  "prophecy": "Prophecy",
  "wisdom": "Wisdom",
  "apocalyptic": "Apocalyptic",
  "completedAnalyses": "Completed Analyses",
  "noAnalysesYet": "You haven't completed any analyses yet.",
  "whatIs": "What?",
  "why": "Why?",
  "how": "How?",
  "example": "Example",
  "commonMistakes": "Common Mistakes",
  "sources": "Sources",
  "backgroundInfo": "Background Info",
  "guidingQuestions": "Guiding Questions",
  "analysisComplete": "Analysis Complete!",
  "analysisCompleteDesc": "You have worked through all 6 steps.",
  "viewInArchive": "View in archive",
  "startNew": "Analyze new text"
}
```

**Step 3: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add messages/de.json messages/en.json
git commit -m "feat: add i18n translations for hermeneutik module"
```

---

## Task 5: Create shared types and constants

**Files:**
- Create: `src/lib/hermeneutik.ts`

**Step 1: Create types and constants**

Create `src/lib/hermeneutik.ts`:

```typescript
// ── Types ─────────────────────────────────────────────

export interface HermeneutikStep {
  _id: string;
  titleDe: string;
  titleEn: string;
  slug: string;
  order: number;
  accentColor: string;
  icon: string;
  explanationDe: any[];
  explanationEn: any[];
  guidingQuestionsDe: string[];
  guidingQuestionsEn: string[];
  commonMistakesDe: string[];
  commonMistakesEn: string[];
  interactionType: "freetext" | "marking" | "multiplechoice";
  sources: string[];
}

export interface StepAnalysis {
  step: HermeneutikStep;
  expertAnalysisDe: any[];
  expertAnalysisEn: any[];
  hintsDe: string[];
  hintsEn: string[];
  interactionData: string | null;
}

export interface HermeneutikTextSummary {
  _id: string;
  titleDe: string;
  titleEn: string;
  slug: string;
  bibleReference: string;
  genre: string;
  difficulty: string;
  order: number;
}

export interface HermeneutikTextFull extends HermeneutikTextSummary {
  textContentDe: any[];
  textContentEn: any[];
  backgroundInfoDe: any[];
  backgroundInfoEn: any[];
  stepAnalyses: StepAnalysis[];
}

// ── User Progress (localStorage) ─────────────────────

export interface UserStepEntry {
  content: string;             // freetext input
  markedWords?: string[];      // marking interaction
  selectedOption?: string;     // multiplechoice
  completedAt: string | null;  // ISO date string
}

export interface UserAnalysis {
  textSlug: string;
  startedAt: string;
  completedAt: string | null;
  currentStep: number;         // 1-6
  steps: Record<string, UserStepEntry>; // keyed by step slug
}

export interface HermeneutikProgress {
  analyses: Record<string, UserAnalysis>; // keyed by text slug
}

const STORAGE_KEY = "theologik-hermeneutik-progress";

export function loadProgress(): HermeneutikProgress {
  if (typeof window === "undefined") return { analyses: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { analyses: {} };
  } catch {
    return { analyses: {} };
  }
}

export function saveProgress(progress: HermeneutikProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ── Localized field helpers ──────────────────────────

export function loc<T>(obj: any, field: string, locale: string): T {
  const key = `${field}${locale === "en" ? "En" : "De"}`;
  return obj?.[key] as T;
}

// ── Step accent colors (fallback if Sanity data missing) ──

export const STEP_COLORS: Record<number, string> = {
  1: "#F59E0B", // Amber — Beobachtung
  2: "#3B82F6", // Blue — Historischer Kontext
  3: "#10B981", // Emerald — Literarische Analyse
  4: "#8B5CF6", // Violet — Wortanalyse
  5: "#F97316", // Orange — Theologische Synthese
  6: "#EC4899", // Pink — Kontextualisierung
};
```

**Step 2: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/lib/hermeneutik.ts
git commit -m "feat: add hermeneutik types, progress helpers, and constants"
```

---

## Task 6: Build the Hermeneutik overview page (landing)

**Files:**
- Create: `src/app/[locale]/ressourcen/hermeneutik/layout.tsx`
- Create: `src/app/[locale]/ressourcen/hermeneutik/page.tsx`
- Create: `src/components/hermeneutik/HermeneutikNav.tsx`

**Step 1: Create the layout with sub-navigation**

Create `src/app/[locale]/ressourcen/hermeneutik/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { buildLocalizedMetadata } from "@/lib/seo";
import { HermeneutikNav } from "@/components/hermeneutik/HermeneutikNav";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: "/ressourcen/hermeneutik",
    deTitle: "Hermeneutik lernen",
    enTitle: "Learn Hermeneutics",
    deDescription:
      "Interaktives Lernprogramm für biblische Hermeneutik — lerne Bibeltexte methodisch zu analysieren.",
    enDescription:
      "Interactive learning program for biblical hermeneutics — learn to analyze Bible texts methodically.",
  });
}

export default function HermeneutikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[80vh]">
      <HermeneutikNav />
      {children}
    </div>
  );
}
```

**Step 2: Create the sub-navigation component**

Create `src/components/hermeneutik/HermeneutikNav.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { BookOpen, Wrench, BarChart3 } from "lucide-react";

export function HermeneutikNav() {
  const locale = useLocale();
  const t = useTranslations("hermeneutik");
  const pathname = usePathname();
  const base = `/${locale}/ressourcen/hermeneutik`;

  const tabs = [
    { href: base, label: t("overview"), icon: BookOpen, exact: true },
    { href: `${base}/werkbank`, label: t("workbench"), icon: Wrench, exact: false },
    { href: `${base}/methode`, label: t("method"), icon: BookOpen, exact: false },
    { href: `${base}/fortschritt`, label: t("progress"), icon: BarChart3, exact: false },
  ];

  return (
    <nav className="flex gap-1 mb-8 p-1 rounded-xl border" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      {tabs.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? "font-medium"
                : "opacity-60 hover:opacity-100"
            }`}
            style={isActive ? {
              background: "var(--color-background)",
              color: "var(--color-foreground)",
            } : {
              color: "var(--color-muted)",
            }}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
```

**Step 3: Create the overview page**

Create `src/app/[locale]/ressourcen/hermeneutik/page.tsx`:

```typescript
import { client } from "@/sanity/client";
import { allHermeneutikStepsQuery, allHermeneutikTextsQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { HermeneutikStep, HermeneutikTextSummary } from "@/lib/hermeneutik";
import { loc, STEP_COLORS } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function HermeneutikOverview({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("hermeneutik");

  const [steps, texts]: [HermeneutikStep[], HermeneutikTextSummary[]] =
    await Promise.all([
      client.fetch(allHermeneutikStepsQuery),
      client.fetch(allHermeneutikTextsQuery),
    ]);

  return (
    <div>
      {/* Hero */}
      <section className="mb-16">
        <h1
          className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("title")}
        </h1>
        <p
          className="text-lg max-w-2xl"
          style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}
        >
          {t("description")}
        </p>
      </section>

      {/* Die 6 Schritte */}
      <section className="mb-16">
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {locale === "de" ? "Die 6 Analyse-Schritte" : "The 6 Analysis Steps"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step) => (
            <Link
              key={step._id}
              href={`/${locale}/ressourcen/hermeneutik/methode#${step.slug}`}
              className="group rounded-2xl border p-5 transition-all hover:scale-[1.02]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
                  style={{ background: step.accentColor || STEP_COLORS[step.order] }}
                >
                  {step.order}
                </span>
                <h3 className="font-medium" style={{ fontFamily: "var(--font-sans)" }}>
                  {loc<string>(step, "title", locale)}
                </h3>
              </div>
              {step.guidingQuestionsDe && step.guidingQuestionsDe.length > 0 && (
                <p className="text-sm line-clamp-2" style={{ color: "var(--color-muted)" }}>
                  {loc<string[]>(step, "guidingQuestions", locale)?.[0]}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Verfügbare Texte */}
      <section>
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {t("selectText")}
        </h2>
        {texts.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>
            {locale === "de" ? "Texte werden bald hinzugefügt." : "Texts will be added soon."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {texts.map((text) => (
              <Link
                key={text._id}
                href={`/${locale}/ressourcen/hermeneutik/werkbank/${text.slug}`}
                className="group rounded-2xl border p-5 transition-all hover:scale-[1.02]"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-surface)",
                }}
              >
                <h3 className="font-medium mb-2" style={{ fontFamily: "var(--font-serif)" }}>
                  {loc<string>(text, "title", locale)}
                </h3>
                <div className="flex gap-2 text-xs" style={{ color: "var(--color-muted)" }}>
                  <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-border)" }}>
                    {t(text.genre)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--color-border)" }}>
                    {t(text.difficulty)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

**Step 4: Verify the page loads**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && npm run dev`
Open: `http://localhost:3000/de/ressourcen/hermeneutik`
Expected: Page renders with hero, empty step cards, empty text list

**Step 5: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/app/\[locale\]/ressourcen/hermeneutik/layout.tsx src/app/\[locale\]/ressourcen/hermeneutik/page.tsx src/components/hermeneutik/HermeneutikNav.tsx
git commit -m "feat: add hermeneutik overview page with layout and sub-nav"
```

---

## Task 7: Build the Methoden-Lexikon page

**Files:**
- Create: `src/app/[locale]/ressourcen/hermeneutik/methode/page.tsx`

**Step 1: Create the method reference page**

Create `src/app/[locale]/ressourcen/hermeneutik/methode/page.tsx`:

```typescript
import { client } from "@/sanity/client";
import { allHermeneutikStepsQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import { PortableText } from "@portabletext/react";
import type { HermeneutikStep } from "@/lib/hermeneutik";
import { loc, STEP_COLORS } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function MethodPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("hermeneutik");
  const steps: HermeneutikStep[] = await client.fetch(allHermeneutikStepsQuery);

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("method")}
      </h1>
      <p className="mb-12 text-lg" style={{ color: "var(--color-muted)" }}>
        {locale === "de"
          ? "Die hermeneutische Methode in 6 Schritten — zum Nachschlagen und Lernen."
          : "The hermeneutical method in 6 steps — for reference and learning."}
      </p>

      <div className="space-y-12">
        {steps.map((step) => {
          const color = step.accentColor || STEP_COLORS[step.order];
          const explanation = loc<any[]>(step, "explanation", locale);
          const questions = loc<string[]>(step, "guidingQuestions", locale) || [];
          const mistakes = loc<string[]>(step, "commonMistakes", locale) || [];

          return (
            <section
              key={step._id}
              id={step.slug}
              className="rounded-2xl border p-6 md:p-8 scroll-mt-24"
              style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-lg font-bold text-white"
                  style={{ background: color }}
                >
                  {step.order}
                </span>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
                  {loc<string>(step, "title", locale)}
                </h2>
              </div>

              {/* Explanation */}
              {explanation && explanation.length > 0 && (
                <div className="prose dark:prose-invert max-w-none mb-6" style={{ fontFamily: "var(--font-body-serif)" }}>
                  <PortableText value={explanation} />
                </div>
              )}

              {/* Guiding Questions */}
              {questions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: color }}>
                    {t("guidingQuestions")}
                  </h3>
                  <ul className="space-y-2">
                    {questions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                        <span style={{ color }}>?</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {mistakes.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-muted)" }}>
                    {t("commonMistakes")}
                  </h3>
                  <ul className="space-y-2">
                    {mistakes.map((m, i) => (
                      <li key={i} className="flex gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                        <span className="text-red-400">!</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sources */}
              {step.sources && step.sources.length > 0 && (
                <div className="pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-muted)" }}>
                    {t("sources")}
                  </h3>
                  <ul className="space-y-1">
                    {step.sources.map((s, i) => (
                      <li key={i} className="text-xs" style={{ color: "var(--color-muted)" }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/app/\[locale\]/ressourcen/hermeneutik/methode/page.tsx
git commit -m "feat: add hermeneutik method lexicon page"
```

---

## Task 8: Build the Werkbank text selection page

**Files:**
- Create: `src/app/[locale]/ressourcen/hermeneutik/werkbank/page.tsx`

**Step 1: Create the text selection page**

Create `src/app/[locale]/ressourcen/hermeneutik/werkbank/page.tsx`:

```typescript
import { client } from "@/sanity/client";
import { allHermeneutikTextsQuery } from "@/sanity/queries";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { HermeneutikTextSummary } from "@/lib/hermeneutik";
import { loc } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function WerkbankPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("hermeneutik");
  const texts: HermeneutikTextSummary[] = await client.fetch(allHermeneutikTextsQuery);

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("workbench")}
      </h1>
      <p className="mb-10 text-lg" style={{ color: "var(--color-muted)" }}>
        {t("selectText")}
      </p>

      {texts.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <p style={{ color: "var(--color-muted)" }}>
            {locale === "de" ? "Texte werden bald hinzugefügt." : "Texts will be added soon."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {texts.map((text) => (
            <Link
              key={text._id}
              href={`/${locale}/ressourcen/hermeneutik/werkbank/${text.slug}`}
              className="group flex items-center justify-between rounded-2xl border p-6 transition-all hover:scale-[1.01]"
              style={{
                borderColor: "var(--color-border)",
                background: "var(--color-surface)",
              }}
            >
              <div>
                <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: "var(--font-serif)" }}>
                  {loc<string>(text, "title", locale)}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                  {text.bibleReference}
                </p>
                <div className="flex gap-2 mt-3 text-xs">
                  <span
                    className="px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    {t(text.genre)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
                  >
                    {t(text.difficulty)}
                  </span>
                </div>
              </div>
              <span className="text-sm font-medium" style={{ color: "var(--color-accent)" }}>
                {t("startAnalysis")} →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/app/\[locale\]/ressourcen/hermeneutik/werkbank/page.tsx
git commit -m "feat: add werkbank text selection page"
```

---

## Task 9: Build the Werkbank analysis workspace (core)

This is the main interactive component — the split-view analysis workspace.

**Files:**
- Create: `src/app/[locale]/ressourcen/hermeneutik/werkbank/[slug]/page.tsx`
- Create: `src/components/hermeneutik/AnalysisWorkspace.tsx`
- Create: `src/components/hermeneutik/BibleTextPanel.tsx`
- Create: `src/components/hermeneutik/StepPanel.tsx`
- Create: `src/components/hermeneutik/StepProgressBar.tsx`
- Create: `src/components/hermeneutik/ExpertComparison.tsx`

**Step 1: Create the server page that fetches data**

Create `src/app/[locale]/ressourcen/hermeneutik/werkbank/[slug]/page.tsx`:

```typescript
import { client } from "@/sanity/client";
import { hermeneutikTextBySlugQuery } from "@/sanity/queries";
import { notFound } from "next/navigation";
import { AnalysisWorkspace } from "@/components/hermeneutik/AnalysisWorkspace";
import type { HermeneutikTextFull } from "@/lib/hermeneutik";

export const revalidate = 60;

export default async function WerkbankAnalysisPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const text: HermeneutikTextFull | null = await client.fetch(
    hermeneutikTextBySlugQuery,
    { slug }
  );

  if (!text) notFound();

  // Sort stepAnalyses by step.order
  const sortedAnalyses = (text.stepAnalyses || [])
    .filter((sa) => sa.step)
    .sort((a, b) => a.step.order - b.step.order);

  return (
    <AnalysisWorkspace
      text={{ ...text, stepAnalyses: sortedAnalyses }}
      locale={locale}
    />
  );
}
```

**Step 2: Create the StepProgressBar component**

Create `src/components/hermeneutik/StepProgressBar.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import type { StepAnalysis } from "@/lib/hermeneutik";
import { STEP_COLORS } from "@/lib/hermeneutik";

interface Props {
  steps: StepAnalysis[];
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick: (index: number) => void;
}

export function StepProgressBar({ steps, currentStep, completedSteps, onStepClick }: Props) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((sa, i) => {
        const color = sa.step.accentColor || STEP_COLORS[sa.step.order];
        const isActive = i === currentStep;
        const isCompleted = completedSteps.has(sa.step.slug);

        return (
          <button
            key={sa.step._id}
            onClick={() => onStepClick(i)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110"
            style={{
              background: isCompleted ? color : isActive ? `${color}33` : "var(--color-surface)",
              border: `2px solid ${isActive || isCompleted ? color : "var(--color-border)"}`,
            }}
            title={sa.step.titleDe}
          >
            {isCompleted ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-xs font-bold" style={{ color: isActive ? color : "var(--color-muted)" }}>
                {sa.step.order}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="activeStep"
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 12px ${color}40` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
```

**Step 3: Create the BibleTextPanel**

Create `src/components/hermeneutik/BibleTextPanel.tsx`:

```typescript
"use client";

import { PortableText } from "@portabletext/react";

interface Props {
  content: any[];
  markedWords: string[];
  onWordClick?: (word: string) => void;
  accentColor: string;
}

export function BibleTextPanel({ content, markedWords, onWordClick, accentColor }: Props) {
  return (
    <div
      className="rounded-2xl border p-6 h-full overflow-y-auto"
      style={{
        borderColor: "var(--color-border)",
        background: "var(--color-surface)",
        fontFamily: "var(--font-body-serif)",
      }}
    >
      <div className="prose dark:prose-invert max-w-none text-lg leading-relaxed">
        <PortableText
          value={content}
          components={{
            block: {
              normal: ({ children }) => {
                // If marking mode is active, make words clickable
                if (!onWordClick) {
                  return <p>{children}</p>;
                }
                return <p>{children}</p>;
              },
            },
          }}
        />
      </div>
    </div>
  );
}
```

**Step 4: Create the StepPanel**

Create `src/components/hermeneutik/StepPanel.tsx`:

```typescript
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { StepAnalysis, UserStepEntry } from "@/lib/hermeneutik";
import { loc, STEP_COLORS } from "@/lib/hermeneutik";
import { ExpertComparison } from "./ExpertComparison";

interface Props {
  stepAnalysis: StepAnalysis;
  locale: string;
  userEntry: UserStepEntry;
  onUpdate: (entry: Partial<UserStepEntry>) => void;
  onComplete: () => void;
  isLast: boolean;
  onBack: () => void;
  isFirst: boolean;
}

export function StepPanel({
  stepAnalysis,
  locale,
  userEntry,
  onUpdate,
  onComplete,
  isLast,
  onBack,
  isFirst,
}: Props) {
  const t = useTranslations("hermeneutik");
  const [showHints, setShowHints] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const step = stepAnalysis.step;
  const color = step.accentColor || STEP_COLORS[step.order];
  const questions = loc<string[]>(step, "guidingQuestions", locale) || [];
  const hints = loc<string[]>(stepAnalysis, "hints", locale) || [];
  const hasExpert =
    (loc<any[]>(stepAnalysis, "expertAnalysis", locale) || []).length > 0;

  return (
    <motion.div
      key={step._id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Step header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
          style={{ background: color }}
        >
          {step.order}
        </span>
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          {loc<string>(step, "title", locale)}
        </h2>
      </div>

      {/* Guiding questions */}
      {questions.length > 0 && (
        <div className="mb-4 space-y-1">
          {questions.map((q, i) => (
            <p key={i} className="text-sm" style={{ color: "var(--color-muted)" }}>
              <span style={{ color }}>?</span> {q}
            </p>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex-1 mb-4">
        {step.interactionType === "multiplechoice" && stepAnalysis.interactionData ? (
          <MultipleChoiceInput
            data={stepAnalysis.interactionData}
            value={userEntry.selectedOption || ""}
            onChange={(val) => onUpdate({ selectedOption: val })}
            color={color}
          />
        ) : (
          <textarea
            value={userEntry.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={
              locale === "de"
                ? "Schreibe hier deine Analyse..."
                : "Write your analysis here..."
            }
            className="w-full h-full min-h-[200px] rounded-xl border p-4 text-sm resize-none focus:outline-none transition-colors"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-foreground)",
              fontFamily: "var(--font-body-serif)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = color;
              e.target.style.boxShadow = `0 0 0 1px ${color}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        )}
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm font-medium transition-colors"
            style={{ color }}
          >
            {showHints ? "▾" : "▸"} {t("hints")} ({hints.length})
          </button>
          <AnimatePresence>
            {showHints && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {hints.map((h, i) => (
                  <li key={i} className="text-sm pl-4" style={{ color: "var(--color-muted)" }}>
                    {h}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Expert comparison */}
      {hasExpert && userEntry.content.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowExpert(!showExpert)}
            className="text-sm font-medium transition-colors"
            style={{ color }}
          >
            {showExpert ? t("hideExpertAnalysis") : t("showExpertAnalysis")}
          </button>
          <AnimatePresence>
            {showExpert && (
              <ExpertComparison
                expertAnalysis={loc<any[]>(stepAnalysis, "expertAnalysis", locale) || []}
                color={color}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={onBack}
          disabled={isFirst}
          className="px-4 py-2 rounded-lg text-sm transition-opacity disabled:opacity-30"
          style={{ color: "var(--color-muted)" }}
        >
          ← {t("back")}
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-transform hover:scale-105"
          style={{ background: color }}
        >
          {isLast ? t("finish") : t("next")} →
        </button>
      </div>
    </motion.div>
  );
}

function MultipleChoiceInput({
  data,
  value,
  onChange,
  color,
}: {
  data: string;
  value: string;
  onChange: (val: string) => void;
  color: string;
}) {
  let options: { label: string; value: string }[] = [];
  try {
    const parsed = JSON.parse(data);
    options = parsed.options || [];
  } catch {
    return null;
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="w-full text-left rounded-xl border p-4 text-sm transition-all"
          style={{
            borderColor: value === opt.value ? color : "var(--color-border)",
            background: value === opt.value ? `${color}15` : "var(--color-background)",
            color: "var(--color-foreground)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

**Step 5: Create ExpertComparison**

Create `src/components/hermeneutik/ExpertComparison.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { PortableText } from "@portabletext/react";

interface Props {
  expertAnalysis: any[];
  color: string;
}

export function ExpertComparison({ expertAnalysis, color }: Props) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="mt-3 rounded-xl border p-4 overflow-hidden"
      style={{
        borderColor: `${color}40`,
        background: `${color}08`,
      }}
    >
      <div
        className="prose dark:prose-invert max-w-none text-sm"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        <PortableText value={expertAnalysis} />
      </div>
    </motion.div>
  );
}
```

**Step 6: Create the main AnalysisWorkspace**

Create `src/components/hermeneutik/AnalysisWorkspace.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { HermeneutikTextFull, UserAnalysis, UserStepEntry } from "@/lib/hermeneutik";
import { loc, STEP_COLORS, loadProgress, saveProgress } from "@/lib/hermeneutik";
import { BibleTextPanel } from "./BibleTextPanel";
import { StepPanel } from "./StepPanel";
import { StepProgressBar } from "./StepProgressBar";

interface Props {
  text: HermeneutikTextFull;
  locale: string;
}

function emptyEntry(): UserStepEntry {
  return { content: "", markedWords: [], selectedOption: undefined, completedAt: null };
}

export function AnalysisWorkspace({ text, locale }: Props) {
  const t = useTranslations("hermeneutik");
  const steps = text.stepAnalyses;

  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<UserAnalysis>(() => ({
    textSlug: text.slug,
    startedAt: new Date().toISOString(),
    completedAt: null,
    currentStep: 1,
    steps: {},
  }));
  const [isComplete, setIsComplete] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const progress = loadProgress();
    const saved = progress.analyses[text.slug];
    if (saved) {
      setAnalysis(saved);
      setCurrentStep(Math.max(0, (saved.currentStep || 1) - 1));
      setIsComplete(!!saved.completedAt);
    }
  }, [text.slug]);

  // Save progress on change
  const persist = useCallback(
    (updated: UserAnalysis) => {
      const progress = loadProgress();
      progress.analyses[text.slug] = updated;
      saveProgress(progress);
    },
    [text.slug]
  );

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  const stepSlug = currentStepData.step.slug;
  const userEntry = analysis.steps[stepSlug] || emptyEntry();

  const completedSteps = new Set(
    Object.entries(analysis.steps)
      .filter(([, entry]) => entry.completedAt)
      .map(([slug]) => slug)
  );

  function updateEntry(partial: Partial<UserStepEntry>) {
    const updated = {
      ...analysis,
      steps: {
        ...analysis.steps,
        [stepSlug]: { ...userEntry, ...partial },
      },
    };
    setAnalysis(updated);
    persist(updated);
  }

  function completeStep() {
    const now = new Date().toISOString();
    const isLast = currentStep === steps.length - 1;

    const updatedEntry = { ...userEntry, completedAt: now };
    const updated: UserAnalysis = {
      ...analysis,
      currentStep: isLast ? steps.length : currentStep + 2,
      completedAt: isLast ? now : null,
      steps: {
        ...analysis.steps,
        [stepSlug]: updatedEntry,
      },
    };

    setAnalysis(updated);
    persist(updated);

    if (isLast) {
      setIsComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  const accentColor =
    currentStepData.step.accentColor || STEP_COLORS[currentStepData.step.order];

  // Completion screen
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--color-accent)" }}
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {t("analysisComplete")}
        </h2>
        <p className="mb-8" style={{ color: "var(--color-muted)" }}>
          {t("analysisCompleteDesc")}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/ressourcen/hermeneutik/fortschritt`}
            className="px-5 py-2.5 rounded-lg text-sm border transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            {t("viewInArchive")}
          </Link>
          <Link
            href={`/${locale}/ressourcen/hermeneutik/werkbank`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--color-accent)" }}
          >
            {t("startNew")}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/ressourcen/hermeneutik/werkbank`}
            className="text-sm transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            ← {t("back")}
          </Link>
          <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            {loc<string>(text, "title", locale)}
          </h1>
        </div>
        <StepProgressBar
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: "60vh" }}>
        {/* Left: Bible text */}
        <BibleTextPanel
          content={loc<any[]>(text, "textContent", locale) || []}
          markedWords={userEntry.markedWords || []}
          accentColor={accentColor}
        />

        {/* Right: Step workspace */}
        <div
          className="rounded-2xl border p-6 overflow-y-auto"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <AnimatePresence mode="wait">
            <StepPanel
              key={stepSlug}
              stepAnalysis={currentStepData}
              locale={locale}
              userEntry={userEntry}
              onUpdate={updateEntry}
              onComplete={completeStep}
              isLast={currentStep === steps.length - 1}
              onBack={goBack}
              isFirst={currentStep === 0}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Method help */}
      <div className="mt-4 text-center">
        <Link
          href={`/${locale}/ressourcen/hermeneutik/methode#${currentStepData.step.slug}`}
          className="inline-flex items-center gap-1 text-sm transition-colors hover:underline"
          style={{ color: accentColor }}
        >
          {t("methodHelp")}
        </Link>
      </div>
    </div>
  );
}
```

**Step 7: Verify the workspace loads**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && npm run dev`
Open: `http://localhost:3000/de/ressourcen/hermeneutik/werkbank`
Expected: Text selection page renders. If Sanity has texts, clicking one opens the split-view workspace.

**Step 8: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/app/\[locale\]/ressourcen/hermeneutik/werkbank/ src/components/hermeneutik/
git commit -m "feat: add analysis workspace with split-view, step navigation, and progress persistence"
```

---

## Task 10: Build the Fortschritt (progress) page

**Files:**
- Create: `src/app/[locale]/ressourcen/hermeneutik/fortschritt/page.tsx`
- Create: `src/components/hermeneutik/ProgressView.tsx`

**Step 1: Create the client-side progress view component**

Create `src/components/hermeneutik/ProgressView.tsx`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { loadProgress, type HermeneutikProgress } from "@/lib/hermeneutik";

export function ProgressView() {
  const t = useTranslations("hermeneutik");
  const locale = useLocale();
  const [progress, setProgress] = useState<HermeneutikProgress>({ analyses: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const analyses = Object.values(progress.analyses);
  const completed = analyses.filter((a) => a.completedAt);
  const inProgress = analyses.filter((a) => !a.completedAt);

  return (
    <div>
      <h1
        className="text-3xl font-bold mb-2 tracking-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {t("progress")}
      </h1>
      <p className="mb-10 text-lg" style={{ color: "var(--color-muted)" }}>
        {t("completedAnalyses")}
      </p>

      {analyses.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
        >
          <p className="mb-4" style={{ color: "var(--color-muted)" }}>
            {t("noAnalysesYet")}
          </p>
          <Link
            href={`/${locale}/ressourcen/hermeneutik/werkbank`}
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--color-accent)" }}
          >
            {t("startAnalysis")}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-muted)" }}>
                {t("inProgress")}
              </h2>
              <div className="space-y-3">
                {inProgress.map((a) => (
                  <Link
                    key={a.textSlug}
                    href={`/${locale}/ressourcen/hermeneutik/werkbank/${a.textSlug}`}
                    className="flex items-center justify-between rounded-2xl border p-5 transition-all hover:scale-[1.01]"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div>
                      <p className="font-medium" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.textSlug}
                      </p>
                      <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                        {t("stepOf", { current: a.currentStep, total: 6 })}
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--color-accent)" }}>
                      {t("continueAnalysis")} →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--color-muted)" }}>
                {t("completed")}
              </h2>
              <div className="space-y-3">
                {completed.map((a) => (
                  <div
                    key={a.textSlug}
                    className="flex items-center justify-between rounded-2xl border p-5"
                    style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
                  >
                    <div>
                      <p className="font-medium" style={{ fontFamily: "var(--font-serif)" }}>
                        {a.textSlug}
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                        {a.completedAt
                          ? new Date(a.completedAt).toLocaleDateString(locale === "de" ? "de-DE" : "en-US")
                          : ""}
                      </p>
                    </div>
                    <svg className="w-5 h-5" style={{ color: "var(--color-accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Create the server page wrapper**

Create `src/app/[locale]/ressourcen/hermeneutik/fortschritt/page.tsx`:

```typescript
import { ProgressView } from "@/components/hermeneutik/ProgressView";

export default function FortschrittPage() {
  return <ProgressView />;
}
```

**Step 3: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/app/\[locale\]/ressourcen/hermeneutik/fortschritt/ src/components/hermeneutik/ProgressView.tsx
git commit -m "feat: add hermeneutik progress page with localStorage-based tracking"
```

---

## Task 11: Link Hermeneutik from the Ressourcen page

**Files:**
- Modify: `src/app/[locale]/ressourcen/page.tsx`

**Step 1: Add a prominent link to the Hermeneutik section**

Add a new section at the top of the ressourcen page (before the existing sections) with a card linking to `/ressourcen/hermeneutik`. Use the existing page patterns — add a featured card with the hermeneutik title, description, and a CTA button.

Look at the existing structure in `page.tsx` and add before the placeholder sections:

```tsx
{/* Hermeneutik Program */}
<section className="mb-16">
  <Link
    href={`/${locale}/ressourcen/hermeneutik`}
    className="group block rounded-2xl border p-8 transition-all hover:scale-[1.01]"
    style={{
      borderColor: "var(--color-border)",
      background: "var(--color-surface)",
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <span
        className="flex items-center justify-center w-10 h-10 rounded-xl text-lg"
        style={{ background: "var(--color-accent)", color: "white" }}
      >
        📖
      </span>
      <h2
        className="text-2xl font-semibold"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {locale === "de" ? "Hermeneutik lernen" : "Learn Hermeneutics"}
      </h2>
    </div>
    <p style={{ color: "var(--color-muted)", fontFamily: "var(--font-body-serif)" }}>
      {locale === "de"
        ? "Interaktives Lernprogramm für biblische Textanalyse — lerne die hermeneutische Methode Schritt für Schritt."
        : "Interactive learning program for biblical text analysis — learn the hermeneutical method step by step."}
    </p>
  </Link>
</section>
```

Add `import Link from "next/link";` at the top if not already present.

**Step 2: Commit**

```bash
cd /Users/rafaelgutierrez/aus-der-schrift
git add src/app/\[locale\]/ressourcen/page.tsx
git commit -m "feat: add hermeneutik program link to ressourcen page"
```

---

## Task 12: Verify full flow end-to-end

**Step 1: Start dev server**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && npm run dev`

**Step 2: Verify all pages load**

Open each URL and verify no errors:
- `http://localhost:3000/de/ressourcen` — has hermeneutik card
- `http://localhost:3000/de/ressourcen/hermeneutik` — overview with steps + texts
- `http://localhost:3000/de/ressourcen/hermeneutik/methode` — method lexicon
- `http://localhost:3000/de/ressourcen/hermeneutik/werkbank` — text selection
- `http://localhost:3000/de/ressourcen/hermeneutik/fortschritt` — progress (empty state)
- `http://localhost:3000/en/ressourcen/hermeneutik` — English version

**Step 3: Verify Sanity Studio**

Open `http://localhost:3000/studio` and verify:
- "Hermeneutik-Schritt" document type exists
- "Hermeneutik-Text" document type exists
- Can create a new Hermeneutik-Schritt document
- Can create a new Hermeneutik-Text document with step analyses

**Step 4: Test analysis flow (after adding content in Sanity)**

1. Create 6 Hermeneutik-Schritt documents (one per step)
2. Create 1 Hermeneutik-Text document with step analyses referencing the steps
3. Open the werkbank, select the text
4. Verify split-view renders with Bible text left, workspace right
5. Fill in step 1, click "Weiter"
6. Verify progress persists on page reload
7. Complete all 6 steps
8. Verify completion screen shows
9. Verify progress page shows completed analysis

**Step 5: Build check**

Run: `cd /Users/rafaelgutierrez/aus-der-schrift && npm run build`
Expected: Build succeeds with no errors.

---

## Summary of all files created/modified

### New files (14):
- `src/sanity/schemas/hermeneutikSchritt.ts`
- `src/sanity/schemas/hermeneutikText.ts`
- `src/lib/hermeneutik.ts`
- `src/app/[locale]/ressourcen/hermeneutik/layout.tsx`
- `src/app/[locale]/ressourcen/hermeneutik/page.tsx`
- `src/app/[locale]/ressourcen/hermeneutik/methode/page.tsx`
- `src/app/[locale]/ressourcen/hermeneutik/werkbank/page.tsx`
- `src/app/[locale]/ressourcen/hermeneutik/werkbank/[slug]/page.tsx`
- `src/app/[locale]/ressourcen/hermeneutik/fortschritt/page.tsx`
- `src/components/hermeneutik/HermeneutikNav.tsx`
- `src/components/hermeneutik/AnalysisWorkspace.tsx`
- `src/components/hermeneutik/BibleTextPanel.tsx`
- `src/components/hermeneutik/StepPanel.tsx`
- `src/components/hermeneutik/StepProgressBar.tsx`
- `src/components/hermeneutik/ExpertComparison.tsx`
- `src/components/hermeneutik/ProgressView.tsx`

### Modified files (4):
- `src/sanity/schemas/index.ts`
- `src/sanity/queries.ts`
- `messages/de.json`
- `messages/en.json`
- `src/app/[locale]/ressourcen/page.tsx`
- `package.json` / `package-lock.json`
