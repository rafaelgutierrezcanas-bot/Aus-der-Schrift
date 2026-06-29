# Ressourcen Hub-Redesign — Design

## Ziel

Die Ressourcen-Seite wird von einer Tab-Seite zu einer Hub-and-Spoke-Struktur umgebaut. Jede Ressourcen-Kategorie bekommt eine eigene URL. Neu hinzu kommt "Ausarbeitungen" als eigene Kategorie mit PDF-Upload.

## Architektur

`/ressourcen` wird eine statische Hub-Seite mit drei Karten. Jede Karte führt auf eine eigenständige Unterseite. Die bestehenden RessourcenClient-Tabs werden in separate Client-Komponenten aufgeteilt.

## Seitenstruktur

- `/ressourcen` — Hub mit 3 Karten: Bücher, Zitate, Ausarbeitungen (+ Hermeneutik-Block)
- `/ressourcen/buecher` — Bücherliste mit Filtern (Topic + Schwierigkeit)
- `/ressourcen/zitate` — Zitate mit Filtern (Topic + Autor)
- `/ressourcen/ausarbeitungen` — PDF-Liste mit Download-Button

## Neues Sanity-Schema: `ausarbeitung`

| Feld | Typ | Pflicht |
|---|---|---|
| `title` | string | ✓ |
| `description` | text (3 Zeilen) | |
| `publishedAt` | datetime | ✓ |
| `topics` | array of strings (TOPIC_OPTIONS) | ✓ |
| `file` | file (PDF, Sanity CDN) | ✓ |

## Admin-Seiten

- `/admin/ausarbeitungen` — Liste
- `/admin/ausarbeitungen/neu` — Erstellen mit Datei-Upload
- `/admin/ausarbeitungen/[id]` — Bearbeiten / Löschen
- Sidebar-Eintrag "Ausarbeitungen"

## API-Routes

- `POST /api/admin/ausarbeitungen/upload` — lädt PDF in Sanity-CDN, gibt URL zurück
- `GET/POST /api/admin/ausarbeitungen` — Liste / Erstellen
- `GET/PATCH/DELETE /api/admin/ausarbeitungen/[id]` — Einzeln

## Komponenten

- `BuecherClient.tsx` — aus RessourcenClient extrahiert (Bücher-Tab)
- `ZitateClient.tsx` — aus RessourcenClient extrahiert (Zitate-Tab)
- `RessourcenClient.tsx` — wird gelöscht (nicht mehr benötigt)
