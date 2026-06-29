# Kommentarsystem — Design

## Ziel

Leser können unter Blog-Beiträgen Kommentare hinterlassen. Kommentare erscheinen erst nach Admin-Freischaltung öffentlich.

## Architektur

Kommentare werden als eigener Sanity-Dokumenttyp `comment` gespeichert. Eine öffentliche API-Route `POST /api/comments` nimmt Kommentare entgegen (kein Auth nötig). Admin-geschützte Routen ermöglichen Freischaltung/Ablehnung/Löschung. Die Blog-Post-Page zeigt nur `status: "approved"` Kommentare via ISR (revalidate: 60).

## Sanity-Schema: `comment`

| Feld | Typ | Pflicht |
|---|---|---|
| `articleId` | string (Sanity `_id` des Artikels) | ✓ |
| `authorName` | string | ✓ |
| `authorEmail` | string | — |
| `body` | text | ✓ |
| `status` | `"pending"` \| `"approved"` \| `"rejected"` | ✓ (default: `"pending"`) |

`_createdAt` wird automatisch von Sanity gesetzt.

## API-Routes

- `POST /api/comments` — öffentlich, erstellt Kommentar mit `status: "pending"`. In-Memory Rate-Limit: 3 Kommentare pro IP pro Stunde.
- `GET /api/admin/comments` — Admin, listet alle Kommentare (optional `?articleId=` Filter)
- `PATCH /api/admin/comments/[id]` — Admin, setzt Status (`approved` / `rejected`)
- `DELETE /api/admin/comments/[id]` — Admin, löscht Kommentar

## Frontend (Blog-Post-Page)

- Neue Server-Komponente `CommentsSection.tsx` am Ende der Blog-Post-Page (nach Related Posts)
- Fetcht `*[_type == "comment" && articleId == $id && status == "approved"] | order(_createdAt asc)`
- Zeigt Kommentar-Karten (Name, Datum, Body) im Stil der übrigen Karten (`var(--color-surface)`, `var(--color-border)`)
- Client-Komponente `CommentForm.tsx` mit Formular (Name Pflicht, E-Mail optional, Body Pflicht)
- Nach Submit: optimistisches Success-Banner „Danke, dein Kommentar wird geprüft." ohne Reload
- Leer-State: „Noch keine Kommentare — sei der Erste."
- Zweisprachig: DE/EN via `locale`-Prop

## Admin-Portal

- Neuer Sidebar-Eintrag „Kommentare" mit Badge (Anzahl pending)
- `/admin/kommentare` — Tabelle: Artikel | Name | Text (gekürzt) | Datum | Status-Badge
- Aktionen direkt in der Zeile: Freischalten / Ablehnen / Löschen (kein separater Edit-Screen)
