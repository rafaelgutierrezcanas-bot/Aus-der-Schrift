# Titelbild-Upload Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Admins können im Artikel-Editor ein Titelbild hochladen, in der Vorschau sehen und entfernen.

**Architecture:** Server-seitiger Upload via dedizierter API-Route `/api/admin/upload-image` — der Browser sendet `FormData`, der Server lädt mit `writeClient.assets.upload()` zu Sanity hoch und gibt die Asset-Referenz zurück. Das Admin-Edit-Formular speichert `featuredImage` sofort per PATCH.

**Tech Stack:** Next.js 16 App Router, Sanity `@sanity/client` (writeClient), `@sanity/image-url`, React, TailwindCSS

**Note:** Die Frontend-Seite (ArticleCard, Artikel-Detail, GROQ-Queries) unterstützt `featuredImage` bereits vollständig — keine Änderungen dort nötig.

---

### Task 1: API-Route zum Hochladen von Bildern

**Files:**
- Create: `src/app/api/admin/upload-image/route.ts`

**Context:**
- `writeClient` liegt in `src/sanity/writeClient.ts` — nutzt `SANITY_API_WRITE_TOKEN`
- Auth-Pattern (Cookie-Check) aus jeder anderen Admin-Route kopieren, z.B. `src/app/api/admin/lektorat/route.ts:7-14`
- `writeClient.assets.upload("image", buffer, { filename, contentType })` gibt ein Sanity Asset-Objekt zurück mit `._id` (z.B. `"image-abc123-400x300-jpg"`)
- Rückgabe-Format: `{ _type: "image", asset: { _type: "reference", _ref: asset._id } }`

**Step 1: Erstelle die Route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { writeClient } from "@/sanity/writeClient";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Keine Datei" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const asset = await writeClient.assets.upload("image", buffer, {
    filename: file.name,
    contentType: file.type,
  });

  return NextResponse.json({
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  });
}
```

**Step 2: Manuell testen**

Starte den Dev-Server (`npm run dev` im Projektroot), öffne `localhost:3001/admin`, logge dich ein, und teste den Upload im nächsten Task manuell.

**Step 3: Commit**

```bash
git add src/app/api/admin/upload-image/route.ts
git commit -m "feat: add image upload API route"
```

---

### Task 2: Titelbild-UI in der Artikelbearbeitungsseite

**Files:**
- Modify: `src/app/admin/[slug]/page.tsx`

**Context:**
- Die Seite liegt in `src/app/admin/[slug]/page.tsx`
- Aktueller State-Block beginnt bei Zeile 35, `useEffect` für Datenladen ab Zeile 48
- `buildPatch` useCallback ab Zeile 83 — hier muss `featuredImage` hinzugefügt werden
- `urlFor` ist in `src/sanity/image.ts` exportiert; Import: `import { urlFor } from "@/sanity/image"`
- `featuredImage` kommt aus dem `article`-Objekt (Zeile 54: Promise.all Destructuring)

**Step 1: State hinzufügen**

Füge nach Zeile 46 (`const [bodyEn, setBodyEn] = useState<object | null>(null);`) ein:

```tsx
const [featuredImage, setFeaturedImage] = useState<object | null>(null);
const [imageUploading, setImageUploading] = useState(false);
const [imageError, setImageError] = useState("");
```

**Step 2: State beim Laden befüllen**

Im `useEffect` Promise.all-Handler (ca. Zeile 54), nach `setBodyDe`/`setBodyEn`:

```tsx
setFeaturedImage(article.featuredImage ?? null);
```

**Step 3: featuredImage in buildPatch einbauen**

In `buildPatch` (ca. Zeile 84), ergänze im `patch`-Objekt:

```tsx
featuredImage: featuredImage ?? null,
```

Und füge `featuredImage` in die Dependency-Arrays beider `useEffect`-Hooks und des `useCallback` ein (beide Stellen, wo `[titleDe, titleEn, ...]` steht).

**Step 4: Upload-Handler hinzufügen**

Füge vor `return (` die folgenden Funktionen ein:

```tsx
async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0];
  if (!file) return;
  setImageUploading(true);
  setImageError("");
  try {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setImageError(data.error ?? "Upload fehlgeschlagen");
      return;
    }
    setFeaturedImage(data);
    await fetch(`/api/admin/articles/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featuredImage: data }),
    });
  } catch (err) {
    setImageError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
  } finally {
    setImageUploading(false);
    // Reset file input
    e.target.value = "";
  }
}

async function handleImageRemove() {
  setFeaturedImage(null);
  await fetch(`/api/admin/articles/${slug}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ featuredImage: null }),
  });
}
```

**Step 5: Import hinzufügen**

Füge am Anfang der Datei (nach den bestehenden Imports) ein:

```tsx
import { urlFor } from "@/sanity/image";
```

**Step 6: UI-Sektion einfügen**

Füge die Titelbild-Sektion zwischen dem Sources-Picker und den Editor-Sektionen ein (nach dem `</div>` des Sources-Pickers, ca. Zeile 247):

```tsx
{/* Titelbild */}
<div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6">
  <h2 className="font-serif text-base text-[var(--color-foreground)] mb-3">Titelbild</h2>
  {featuredImage ? (
    <div className="relative inline-block">
      <img
        src={urlFor(featuredImage as Parameters<typeof urlFor>[0]).width(600).height(338).fit("crop").url()}
        alt="Titelbild Vorschau"
        className="rounded-lg w-full max-w-sm h-auto block"
      />
      <button
        onClick={handleImageRemove}
        className="absolute top-2 right-2 bg-white rounded-full w-7 h-7 flex items-center justify-center shadow text-stone-500 hover:text-red-500 transition-colors text-lg leading-none"
        title="Bild entfernen"
      >
        ×
      </button>
    </div>
  ) : (
    <label
      className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
        imageUploading
          ? "border-stone-200 bg-stone-50 cursor-not-allowed"
          : "border-stone-200 hover:border-stone-400"
      }`}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {imageUploading ? (
        <span className="text-sm text-stone-400">Lädt hoch…</span>
      ) : (
        <>
          <span className="text-2xl">🖼️</span>
          <span className="text-sm text-stone-500">Bild auswählen</span>
          <span className="text-xs text-stone-400">JPG, PNG, WebP</span>
        </>
      )}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        disabled={imageUploading}
        onChange={handleImageUpload}
      />
    </label>
  )}
  {imageError && (
    <p className="mt-2 text-sm text-red-500" style={{ fontFamily: "var(--font-sans)" }}>{imageError}</p>
  )}
</div>
```

**Step 7: Manuell testen**

1. Öffne `localhost:3001/admin` und gehe in einen Artikel
2. Scrolle zur „Titelbild"-Sektion
3. Klicke auf das Upload-Feld, wähle ein Bild (JPG/PNG)
4. Prüfe: Ladeindikator erscheint → Vorschau erscheint nach Upload
5. Klicke × → Vorschau verschwindet
6. Lade die Seite neu → Vorschau erscheint wieder (aus Sanity geladen)
7. Öffne `localhost:3001/de/blog/[slug]` → Hero-Bild erscheint im Artikel
8. Gehe zum Blog-Index → Thumbnail erscheint in der Artikelliste

**Step 8: Commit**

```bash
git add src/app/admin/[slug]/page.tsx
git commit -m "feat: add cover image upload to article editor"
```

---

## Abschluss

Nach beiden Tasks: `git push` und auf der Live-Seite testen (`theologik.org/de/blog/[slug]`).
