# Admin Portal Design — Theologik

**Datum:** 2026-05-11
**Status:** Genehmigt

---

## Ziel

Ein vollständiges, online zugängliches Admin-Portal für theologik.org — erweiterung des bestehenden `/admin`-Bereichs mit einem eleganten, minimalistischen Design. Zugänglich von Desktop und Handy, geschützt durch Passwort-Login.

---

## Zugang

- **Login-Icon** (Schloss) ganz rechts im Header der Hauptseite — dezent, kein Platzproblem
- URL: `/admin/login` + Passwort
- Cookie-Session: 7 Tage (bleibt auf Handy eingeloggt)
- Kein Zugang für andere Nutzer (Single-User-System)

---

## Layout

### Desktop
Zwei-Spalten-Layout:
- Linke Spalte: Schmale Seitenleiste mit Navigation
- Rechte Spalte: Hauptbereich (wechselt je nach aktivem Bereich)

### Mobil
- Seitenleiste wird zur unteren Tab-Leiste (5 Icons)
- Editor fullscreen mit sticky Toolbar

---

## Design-Sprache

- **Farben:** Exakt wie Hauptwebsite
  - Background: `#F7F3EC` (Cream)
  - Foreground: `#1C1812` (Dunkel)
  - Accent: `#C4933A` (Gold) — für aktive Zustände, Publish-Button
  - Muted: `#7A7468` — sekundäre Texte
  - Border: `#E2D9CA`
- **Schriften:** Playfair Display (Überschriften), Inter (UI)
- **Dark Mode:** voll unterstützt (bestehende CSS-Variablen)
- **Touch-Targets:** mind. 48px für alle Buttons

---

## 5 Bereiche

### 1. Dashboard
- Übersichtskarten: Artikel gesamt, Entwürfe, Ideen, Quellen
- Liste: Zuletzt bearbeitet
- Schnellzugriff: "Neuer Artikel", "Neue Idee", "Neue Quelle"

### 2. Artikel
**Liste:**
- Filter: Status, Kategorie, Sprache
- Suche nach Titel
- Sortierung: Datum, Titel, Status
- Spalten: Titel, Status-Badge, Sprache, Datum, Lesezeit

**Status-Workflow:**
`Idee → Entwurf → Bereit → Veröffentlicht → Archiviert`

**Editor (TipTap, bestehend + erweitert):**
- Auto-Save alle 30 Sek. (localStorage + API)
- Neue Toolbar-Buttons: Fußnote, Tabelle, Querverweis, Unterstreichen, Hochgestellt
- Lesezeit + Wortanzahl live angezeigt
- Vorschau: Desktop / Mobil
- Querverweis: Verlinkung auf andere Artikel

**Vorlagen:**
- Exegese, Theologische Reflexion, Buchrezension, Predigt

### 3. Quellen (Referenz-Manager)

Jede Quelle enthält:

| Feld | Pflicht |
|------|---------|
| Typ (Buch / Artikel / Website / Bibelausgabe) | ✓ |
| Autor(en) | ✓ |
| Titel | ✓ |
| Jahr | ✓ |
| Verlag / Zeitschrift | — |
| DOI / ISBN / URL | — |
| Seiten | — |
| Eigene Notizen | — |
| Link zur Datei (Google Drive, JSTOR etc.) | — |

**Features:**
- DOI-Lookup: gibt DOI ein → Felder füllen sich automatisch
- Suche + Filter nach Typ, Autor, Jahr
- Aus dem Artikel-Editor: "Quelle einfügen" → Suche → wird als Fußnote eingefügt (Chicago-Format)

**Kein PDF-Upload** — Links zu externen Dateien (Google Drive etc.) reichen.

### 4. Ideen
- Karten-Board (Grid)
- Felder: Titel + kurzer Gedankentext
- Aktion: "Zu Entwurf machen" — öffnet neuen Artikel mit diesem Titel

### 5. Entwürfe & Gliederungen
- Artikel im Status "Idee" oder "Entwurf"
- Gliederungs-Editor: Hierarchische Liste (H1/H2/H3-Struktur) als Vorarbeit
- Vorlagen wählbar

---

## Datenstruktur

### Neue Sanity-Schemas
- `source` — Quellen-Einträge
- `idea` — Ideen-Karten
- `outline` — Gliederungen

### Erweiterte Felder in `article`
- `status` (idea | draft | ready | published | archived)
- `readingTime` (number, auto-berechnet)
- `wordCount` (number, auto-berechnet)
- `footnotes` (array)
- `relatedArticles` (references)
- `template` (string)

### Neue API-Routen
- `GET/POST /api/admin/sources`
- `GET/PATCH/DELETE /api/admin/sources/[id]`
- `GET/POST /api/admin/ideas`
- `GET/POST/DELETE /api/admin/ideas/[id]`
- `GET/POST /api/admin/outlines`
- `GET /api/doi-lookup?doi=...` (proxy zu CrossRef API)

---

## Technischer Stack (unverändert)

- Next.js 16 (App Router)
- Sanity CMS (Portable Text)
- TipTap Editor
- TailwindCSS 4
- Cookie-basierte Auth

---

## Out of Scope

- PDF-Upload / PDF-Viewer (zu komplex, nicht nötig)
- Multi-User / Rollen (Single-User-System)
- Zotero-Integration (kann später ergänzt werden)
- Analytics (kann später ergänzt werden)
