# Forschungsprojekte-Seite Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Öffentliche `/[locale]/projekte`-Seite aufbauen, die Forschungsprojekte als akademisches Register anzeigt — mit Status, Leitfrage, geplanten Beiträgen und verlinkten Artikeln.

**Architecture:** Das bestehende `project`-Sanity-Schema wird um neue Felder erweitert (Status, Leitfrage, Startdatum, öffentlich/privat). Eine neue Server-Component-Seite liest alle öffentlichen Projekte per GROQ und rendert sie als institutionelles Forschungsregister. Der Admin erhält dieselben Felder zur Bearbeitung. Kein neues Backend nötig — der bestehende PATCH-Endpoint setzt beliebige Felder.

**Tech Stack:** Next.js 14 App Router, Sanity GROQ, TypeScript, Tailwind CSS, next-intl

---

### Task 1: Sanity Schema erweitern (`src/sanity/schemas/project.ts`)

**Files:**
- Modify: `src/sanity/schemas/project.ts`

**Neue Felder hinzufügen** nach dem `slug`-Feld:

```ts
defineField({
  name: "status",
  title: "Status",
  type: "string",
  options: {
    list: [
      { title: "Laufend", value: "laufend" },
      { title: "Abgeschlossen", value: "abgeschlossen" },
      { title: "Pausiert", value: "pausiert" },
    ],
    layout: "radio",
  },
  initialValue: "laufend",
}),
defineField({
  name: "startedAt",
  title: "Begonnen am",
  type: "date",
}),
defineField({
  name: "researchQuestionDe",
  title: "Leitfrage (DE)",
  type: "text",
  rows: 3,
  description: "Die zentrale Forschungsfrage auf Deutsch.",
}),
defineField({
  name: "researchQuestionEn",
  title: "Research Question (EN)",
  type: "text",
  rows: 3,
}),
defineField({
  name: "plannedOutput",
  title: "Geplante Beiträge",
  type: "string",
  description: 'z.B. "3 Artikel, 1 Essay"',
}),
defineField({
  name: "titleEn",
  title: "Titel (EN)",
  type: "string",
}),
defineField({
  name: "descriptionEn",
  title: "Beschreibung (EN)",
  type: "text",
  rows: 3,
}),
defineField({
  name: "isPublic",
  title: "Öffentlich sichtbar",
  type: "boolean",
  initialValue: true,
  description: "Wenn deaktiviert, erscheint das Projekt nicht auf der öffentlichen Seite.",
}),
```

**Verify:** Kein Build-Fehler: `npm run build`

**Commit:**
```bash
git add src/sanity/schemas/project.ts
git commit -m "feat: extend project schema with status, research question, and visibility fields"
```

---

### Task 2: GROQ Query für öffentliche Projekte (`src/sanity/queries.ts`)

**Files:**
- Modify: `src/sanity/queries.ts`

**Am Ende der Datei hinzufügen:**

```ts
export const allProjectsQuery = groq`
  *[_type == "project" && isPublic != false] | order(
    status == "laufend" desc,
    status == "pausiert" desc,
    startedAt desc
  ) {
    _id,
    title,
    titleEn,
    slug,
    status,
    startedAt,
    description,
    descriptionEn,
    researchQuestionDe,
    researchQuestionEn,
    plannedOutput,
    "articleCount": count(*[_type == "article" && references(^._id) && (status == "published" || !defined(status))])
  }
`;
```

**Sortierung:** Laufende zuerst, dann pausierte, dann abgeschlossene. Innerhalb jeder Gruppe: neueste zuerst.

**Commit:**
```bash
git add src/sanity/queries.ts
git commit -m "feat: add allProjectsQuery for public research projects page"
```

---

### Task 3: Öffentliche Projektseite (`src/app/[locale]/projekte/page.tsx`)

**Files:**
- Create: `src/app/[locale]/projekte/page.tsx`

```tsx
import { client } from "@/sanity/client";
import { allProjectsQuery } from "@/sanity/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "de" ? "Forschungsprojekte – Theologik" : "Research Projects – Theologik",
    description:
      locale === "de"
        ? "Aktuelle und abgeschlossene Forschungsprojekte von Theologik."
        : "Current and completed research projects by Theologik.",
  };
}

interface Project {
  _id: string;
  title: string;
  titleEn?: string;
  slug?: { current: string };
  status?: "laufend" | "abgeschlossen" | "pausiert";
  startedAt?: string;
  description?: string;
  descriptionEn?: string;
  researchQuestionDe?: string;
  researchQuestionEn?: string;
  plannedOutput?: string;
  articleCount?: number;
}

const STATUS_LABEL: Record<string, { de: string; en: string; color: string }> = {
  laufend:       { de: "Laufend",       en: "Ongoing",    color: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950" },
  abgeschlossen: { de: "Abgeschlossen", en: "Completed",  color: "text-muted bg-surface" },
  pausiert:      { de: "Pausiert",      en: "Paused",     color: "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950" },
};

function formatStartDate(iso: string, locale: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
  });
}

export default async function ProjektePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let projects: Project[] = [];
  try {
    projects = await client.fetch(allProjectsQuery, {}, { next: { tags: ["projects"], revalidate: 60 } });
  } catch {
    projects = [];
  }

  const ongoing    = projects.filter((p) => p.status === "laufend" || !p.status);
  const paused     = projects.filter((p) => p.status === "pausiert");
  const completed  = projects.filter((p) => p.status === "abgeschlossen");

  function ProjectCard({ project }: { project: Project }) {
    const t = project.status ? STATUS_LABEL[project.status] : STATUS_LABEL.laufend;
    const displayTitle  = locale === "en" && project.titleEn ? project.titleEn : project.title;
    const displayDesc   = locale === "en" && project.descriptionEn ? project.descriptionEn : project.description;
    const displayQ      = locale === "en" && project.researchQuestionEn ? project.researchQuestionEn : project.researchQuestionDe;

    return (
      <div className="border border-border rounded-sm p-6 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-base font-semibold leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
            {displayTitle}
          </h2>
          <span
            className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${t.color}`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {locale === "de" ? t.de : t.en}
          </span>
        </div>

        {/* Meta row */}
        {project.startedAt && (
          <p className="text-xs text-muted" style={{ fontFamily: "var(--font-sans)" }}>
            {locale === "de" ? "Begonnen:" : "Started:"}{" "}
            {formatStartDate(project.startedAt, locale)}
          </p>
        )}

        {/* Description */}
        {displayDesc && (
          <p className="text-sm leading-relaxed text-foreground/80" style={{ fontFamily: "var(--font-body-serif)" }}>
            {displayDesc}
          </p>
        )}

        {/* Research question */}
        {displayQ && (
          <div className="border-l-2 border-accent/30 pl-3">
            <p className="text-[10px] uppercase tracking-widest text-muted mb-1" style={{ fontFamily: "var(--font-sans)" }}>
              {locale === "de" ? "Leitfrage" : "Research Question"}
            </p>
            <p className="text-sm italic leading-relaxed" style={{ fontFamily: "var(--font-serif)" }}>
              {displayQ}
            </p>
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-4 pt-1" style={{ fontFamily: "var(--font-sans)" }}>
          {project.plannedOutput && (
            <p className="text-xs text-muted">
              <span className="font-medium">{locale === "de" ? "Geplante Beiträge:" : "Planned output:"}</span>{" "}
              {project.plannedOutput}
            </p>
          )}
          {typeof project.articleCount === "number" && project.articleCount > 0 && project.slug?.current && (
            <Link
              href={`/${locale}/blog?projekt=${project.slug.current}`}
              className="text-xs text-accent hover:underline ml-auto"
            >
              {project.articleCount}{" "}
              {locale === "de"
                ? project.articleCount === 1 ? "Artikel" : "Artikel"
                : project.articleCount === 1 ? "article" : "articles"}
              {" →"}
            </Link>
          )}
        </div>
      </div>
    );
  }

  function Section({ title, items }: { title: string; items: Project[] }) {
    if (items.length === 0) return null;
    return (
      <section className="space-y-4">
        <h2
          className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {title}
        </h2>
        <div className="space-y-4">
          {items.map((p) => <ProjectCard key={p._id} project={p} />)}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-prose mx-auto px-6 py-16">
      {/* Page header */}
      <p className="text-xs uppercase tracking-widest text-accent mb-2" style={{ fontFamily: "var(--font-sans)" }}>
        {locale === "de" ? "Theologik" : "Theologik"}
      </p>
      <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "var(--font-serif)" }}>
        {locale === "de" ? "Forschungsprojekte" : "Research Projects"}
      </h1>
      <p className="text-muted mb-12 leading-relaxed" style={{ fontFamily: "var(--font-body-serif)" }}>
        {locale === "de"
          ? "Hier dokumentiert Theologik seine laufenden und abgeschlossenen Forschungsprojekte. Jedes Projekt bündelt Artikel, die eine übergeordnete theologische Frage verfolgen."
          : "Theologik documents its ongoing and completed research projects here. Each project gathers articles pursuing a common theological question."}
      </p>

      {projects.length === 0 ? (
        <p className="text-muted text-sm italic" style={{ fontFamily: "var(--font-body-serif)" }}>
          {locale === "de" ? "Noch keine Projekte vorhanden." : "No projects available yet."}
        </p>
      ) : (
        <div className="space-y-12">
          <Section
            title={locale === "de" ? "Laufende Projekte" : "Ongoing Projects"}
            items={ongoing}
          />
          <Section
            title={locale === "de" ? "Pausierte Projekte" : "Paused Projects"}
            items={paused}
          />
          <Section
            title={locale === "de" ? "Abgeschlossene Projekte" : "Completed Projects"}
            items={completed}
          />
        </div>
      )}
    </div>
  );
}
```

**Verify:**
- `npm run build` → `/[locale]/projekte` erscheint in der Route-Liste
- Seite im Browser öffnen: Leer aber kein Fehler, wenn noch keine Projekte da sind

**Commit:**
```bash
git add src/app/[locale]/projekte/page.tsx
git commit -m "feat: add public Forschungsprojekte page"
```

---

### Task 4: Admin-Projekt-Bearbeiten-UI erweitern (`src/app/admin/projekte/[id]/page.tsx`)

**Files:**
- Modify: `src/app/admin/projekte/[id]/page.tsx`

**Neue State-Variablen** nach `description`:
```ts
const [status, setStatus] = useState("laufend");
const [startedAt, setStartedAt] = useState("");
const [researchQuestionDe, setResearchQuestionDe] = useState("");
const [researchQuestionEn, setResearchQuestionEn] = useState("");
const [plannedOutput, setPlannedOutput] = useState("");
const [titleEn, setTitleEn] = useState("");
const [descriptionEn, setDescriptionEn] = useState("");
const [isPublic, setIsPublic] = useState(true);
```

**In useEffect**, nach `setDescription(proj.description ?? "")` hinzufügen:
```ts
setStatus(proj.status ?? "laufend");
setStartedAt(proj.startedAt ?? "");
setResearchQuestionDe(proj.researchQuestionDe ?? "");
setResearchQuestionEn(proj.researchQuestionEn ?? "");
setPlannedOutput(proj.plannedOutput ?? "");
setTitleEn(proj.titleEn ?? "");
setDescriptionEn(proj.descriptionEn ?? "");
setIsPublic(proj.isPublic !== false);
```

**In handleSave**, den JSON-Body erweitern:
```ts
body: JSON.stringify({
  title, description,
  status,
  startedAt: startedAt || null,
  researchQuestionDe: researchQuestionDe || null,
  researchQuestionEn: researchQuestionEn || null,
  plannedOutput: plannedOutput || null,
  titleEn: titleEn || null,
  descriptionEn: descriptionEn || null,
  isPublic,
}),
```

**Neue UI-Felder** im Formular (nach dem `description`-Textarea, vor der Artikelliste):

```tsx
{/* Status + Startdatum */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Status</label>
    <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }}>
      <option value="laufend">Laufend</option>
      <option value="pausiert">Pausiert</option>
      <option value="abgeschlossen">Abgeschlossen</option>
    </select>
  </div>
  <div>
    <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Begonnen am</label>
    <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
  </div>
</div>

{/* Englischer Titel + Beschreibung */}
<div>
  <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Titel (EN)</label>
  <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
</div>
<div>
  <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Beschreibung (EN)</label>
  <textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
</div>

{/* Leitfragen */}
<div>
  <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Leitfrage (DE)</label>
  <textarea value={researchQuestionDe} onChange={(e) => setResearchQuestionDe(e.target.value)} rows={3} placeholder="Die zentrale theologische Frage dieses Projekts..." className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
</div>
<div>
  <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Research Question (EN)</label>
  <textarea value={researchQuestionEn} onChange={(e) => setResearchQuestionEn(e.target.value)} rows={3} className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
</div>

{/* Geplante Beiträge + Sichtbarkeit */}
<div className="grid grid-cols-2 gap-4">
  <div>
    <label className={labelClass} style={{ fontFamily: "var(--font-sans)" }}>Geplante Beiträge</label>
    <input value={plannedOutput} onChange={(e) => setPlannedOutput(e.target.value)} placeholder='z.B. "3 Artikel, 1 Essay"' className={inputClass} style={{ fontFamily: "var(--font-sans)" }} />
  </div>
  <div className="flex items-center gap-3 pt-7">
    <input type="checkbox" id="isPublic" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="accent-[var(--color-accent)] w-4 h-4" />
    <label htmlFor="isPublic" className="text-sm text-[var(--color-foreground)]" style={{ fontFamily: "var(--font-sans)" }}>
      Öffentlich sichtbar
    </label>
  </div>
</div>
```

**Commit:**
```bash
git add src/app/admin/projekte/[id]/page.tsx
git commit -m "feat: extend admin project editor with new fields"
```

---

### Task 5: Admin GET-Query neue Felder zurückgeben (`src/app/api/admin/projects/route.ts`)

**Files:**
- Modify: `src/app/api/admin/projects/route.ts`

**Bestehende GROQ-Query im GET-Handler** von:
```ts
*[_type == "project"] | order(title asc) {
  _id, title, description, slug
}
```

ändern zu:
```ts
*[_type == "project"] | order(title asc) {
  _id, title, titleEn, description, descriptionEn, slug,
  status, startedAt,
  researchQuestionDe, researchQuestionEn,
  plannedOutput, isPublic
}
```

**Commit:**
```bash
git add src/app/api/admin/projects/route.ts
git commit -m "feat: return extended project fields from admin GET endpoint"
```

---

### Task 6: Header-Navigation — Link zu Projekten (`src/components/Header.tsx`)

**Files:**
- Modify: `src/components/Header.tsx`

**Link "Projekte" hinzufügen** im Navigations-`<nav>` nach dem Themen-Dropdown-Block und vor "Ressourcen":

```tsx
<span className="w-px h-3 bg-border shrink-0" />

<Link
  href={`/${locale}/projekte`}
  className="text-xs px-4 py-1.5 rounded-full text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap"
  style={{ fontFamily: "var(--font-sans)" }}
>
  {locale === "de" ? "Projekte" : "Projects"}
</Link>
```

**Verify:**
- Dev-Server starten: `npm run dev`
- Header zeigt "Projekte"-Link
- Klick → `/de/projekte` öffnet die leere Projektseite ohne Fehler
- Im Admin ein Projekt bearbeiten, alle Felder befüllen, speichern
- Projektseite neu laden → Projekt erscheint mit Status, Leitfrage etc.

**Final commit:**
```bash
git add src/components/Header.tsx
git commit -m "feat: add Projekte nav link to header"
```

---

## Endverifikation

1. `npm run build` — kein Fehler
2. Admin: Projekt öffnen → alle neuen Felder ausfüllen → speichern
3. `/de/projekte` → Projekt erscheint korrekt sortiert (Laufend > Pausiert > Abgeschlossen)
4. `/en/projects` → englische Inhalte erscheinen
5. Status-Badge "Laufend" zeigt grüne Farbe, "Pausiert" gelb, "Abgeschlossen" grau
6. Projekt mit `isPublic: false` → erscheint nicht auf öffentlicher Seite
