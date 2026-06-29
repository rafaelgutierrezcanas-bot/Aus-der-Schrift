# Ressourcen: Bücher & Zitate — Design

## Ziel

Öffentliche, filterbare Bücherliste und Zitatensammlung auf der Ressourcen-Seite, verwaltet über das eigene Admin-Portal.

## Architektur

Zwei neue Sanity-Schemas (`bookRecommendation`, `quote`). Admin-CRUD über `/admin/buecher` und `/admin/zitate`. Öffentliche Seite `/[locale]/ressourcen` mit zwei Tabs (Bücher / Zitate) und Client-seitigem Filtern (kein Page-Reload).

## Datenmodell

### `bookRecommendation`
| Feld | Typ | Pflicht |
|---|---|---|
| `title` | string | ✓ |
| `author` | string | ✓ |
| `year` | number | |
| `coverImage` | image | |
| `description` | text (3 Zeilen) | ✓ |
| `difficulty` | radio: `einsteiger` / `mittel` / `fortgeschritten` | ✓ |
| `topics` | tags: `theologie`, `apologetik`, `bibelauslegung`, `kirchengeschichte`, `geistliches-leben` | ✓ |
| `buyLink` | url | |

### `quote`
| Feld | Typ | Pflicht |
|---|---|---|
| `text` | text | ✓ |
| `author` | string | ✓ |
| `source` | reference → `bookRecommendation` | |
| `topics` | tags (wie oben) | ✓ |

## Admin-Seiten

- `/admin/buecher` — Liste mit Titel, Autor, Schwierigkeit-Badge, Themen-Tags. "+ Neues Buch" → `/admin/buecher/neu`
- `/admin/buecher/[id]` — Bearbeiten / Löschen
- `/admin/zitate` — Liste mit Zitattext (gekürzt), Autor, verknüpftem Buch. "+ Neues Zitat" → `/admin/zitate/neu`
- `/admin/zitate/[id]` — Bearbeiten / Löschen
- Admin-Sidebar: neue Einträge "Bücher" und "Zitate"

## Öffentliche Seite

`/[locale]/ressourcen` — zwei Tabs via `?tab=zitate`

**Bücher-Tab:**
- Filterleiste: Thema (Chips) + Schwierigkeitsgrad (Chips) — Client-seitig
- Karten: Cover | Titel + Autor | Beschreibung | Schwierigkeit-Badge | Themen-Tags | optionaler Kaufen-Link

**Zitate-Tab:**
- Filter: Thema (Chips) + Autor (Dropdown)
- Blockquote-Karten: Zitattext, `— Autor, Buchtitel (Jahr)`

Bestehende Inhalte (Hermeneutik-Block) bleiben erhalten.

## API

- `GET /api/admin/buecher` — alle Bücher (Admin)
- `POST /api/admin/buecher` — neues Buch
- `PATCH /api/admin/buecher/[id]` — aktualisieren
- `DELETE /api/admin/buecher/[id]` — löschen
- `GET /api/admin/zitate` — alle Zitate (Admin)
- `POST /api/admin/zitate` — neues Zitat
- `PATCH /api/admin/zitate/[id]` — aktualisieren
- `DELETE /api/admin/zitate/[id]` — löschen
