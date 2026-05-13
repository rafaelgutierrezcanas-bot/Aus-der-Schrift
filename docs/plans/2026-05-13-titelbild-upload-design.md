# Titelbild-Upload Design

**Datum:** 2026-05-13

## Ziel

Admins können beim Bearbeiten eines Artikels ein Titelbild hochladen. Das Bild erscheint als Hero im Artikel und als Thumbnail in der Artikelliste auf der öffentlichen Seite.

## Architektur

Server-seitiger Upload via dedizierter API-Route. Der Sanity Write-Token bleibt auf dem Server. Der Browser sendet die Datei per `FormData`, die API lädt sie zu Sanity Assets hoch und gibt die Asset-Referenz zurück. Die Referenz wird sofort per PATCH am Artikel gespeichert.

## Komponenten

### 1. API-Route `/api/admin/upload-image` (POST)

- Auth-Check via Cookie
- Nimmt `FormData` mit `file: File`
- Lädt Bild mit `writeClient.assets.upload("image", ...)` zu Sanity hoch
- Gibt `{ _type: "image", asset: { _type: "reference", _ref: assetId } }` zurück
- Fehler: 401 (unauth), 400 (kein File), 500 (Upload-Fehler)

### 2. Admin-UI in `/admin/[slug]/page.tsx`

Neue Sektion „Titelbild" unterhalb der Metadaten:

- **Kein Bild:** Datei-Input + Upload-Button
- **Upload läuft:** Spinner / „Lädt hoch…"
- **Bild vorhanden:** Vorschau (ca. 200px hoch, Landscape), X-Button zum Entfernen
- Beim Seitenladen: Falls `featuredImage` im Artikel existiert, Vorschau via `urlFor` anzeigen
- Nach erfolgreichem Upload: sofortiger PATCH-Call um `featuredImage` zu speichern
- Entfernen: `featuredImage: null` per PATCH

### 3. Frontend — Artikelliste

`urlFor(featuredImage).width(600).height(340).fit("crop").url()` als `<img>` oder `next/image`

### 4. Frontend — Artikel-Hero

`urlFor(featuredImage).width(1200).height(630).fit("crop").url()` — Sanity Hotspot steuert Fokuspunkt automatisch

## Datenfluss

```
Browser → POST /api/admin/upload-image (FormData)
        ← { _type: "image", asset: { _type: "reference", _ref: "image-abc..." } }
Browser → PATCH /api/admin/articles/[slug] { featuredImage: { ... } }
```

## Sanity Schema

Bereits vorhanden:
```ts
defineField({
  name: "featuredImage",
  title: "Titelbild",
  type: "image",
  options: { hotspot: true },
})
```

PATCH-Route unterstützt bereits beliebige Felder (inkl. null für unset).

## Fehlerbehandlung

- Upload fehlgeschlagen: Inline-Fehlermeldung, kein Zustand gespeichert
- Bild zu groß / falsches Format: Sanity gibt 400 zurück, wird angezeigt
- Entfernen: `null` wird per PATCH gesendet, PATCH-Route macht `unset`

## Akzeptanzkriterien

- [ ] Admin kann Bild hochladen, sieht sofort Vorschau
- [ ] Admin kann Bild entfernen
- [ ] Beim Laden der Seite wird vorhandenes Bild als Vorschau angezeigt
- [ ] Artikelliste zeigt Thumbnail wenn vorhanden
- [ ] Artikel-Hero zeigt großes Bild wenn vorhanden
- [ ] Keine Credentials im Browser exponiert
