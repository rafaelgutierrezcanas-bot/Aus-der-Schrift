# Bibelstudium-Hub — Regeln für KI-Assistenten

## Harte Regeln (NIEMALS brechen)

1. **Niemals theologischen Inhalt schreiben.** Kein Bibeltext, keine Auslegung, keine didaktischen Texte. Nur Platzhalter mit `[TODO: ...]`.
2. **Niemals Belege oder Seitenzahlen erfinden.** Citations nur mit `sourceId`-Referenz auf existierende Bibliographie-Einträge.
3. **Bibeltext nur aus Content-Dateien.** Keine Bibelverse aus dem Gedächtnis zitieren — nur aus `content/bibelstudium/bibeltexte/`.
4. **Engines sind inhaltsfrei.** Engines prüfen Struktur und Muster, nicht theologische Korrektheit.
5. **Kein Feature ohne Test.** Jede neue Funktion braucht einen Test in `__tests__/bibelstudium/`.
6. **Schema-Validierung nicht umgehen.** Alle Content-Dateien müssen gegen ihre Schemas valide sein.

## Didaktische Invarianten

- Inhalte werden ausschließlich von Rafael erstellt und eingetragen
- KI-generierter Code liefert **Struktur** (Schemas, Engines, Komponenten), nicht **Inhalt**
- Platzhalter-Texte verwenden immer das Format `[TODO: Beschreibung]`
- Stationstypen sind eine offene Liste — keine festen Enums

## Architektur-Kurzreferenz

### Wo liegt was?

| Was | Wo |
|-----|-----|
| Content (JSON) | `content/bibelstudium/` |
| JSON-Schemas | `content/bibelstudium/schemas/` |
| TypeScript-Typen | `src/lib/bibelstudium/types.ts` |
| Content-Loader | `src/lib/bibelstudium/content-loader.ts` |
| Engines | `src/lib/bibelstudium/engines/` |
| Validierung | `src/lib/bibelstudium/validation/validate.ts` |
| Validierungsskript | `scripts/validate-bibelstudium.ts` |
| Routen | `src/app/[locale]/bibelstudium/` |
| Komponenten | `src/components/bibelstudium/` |
| Tests | `__tests__/bibelstudium/` |

### Wie füge ich eine Einheit hinzu?

1. Neuen Ordner in `content/bibelstudium/einheiten/` anlegen (ohne `_`-Präfix)
2. `meta.json` mit allen Pflichtfeldern erstellen
3. Stationsdateien anlegen und in `meta.json.stations` referenzieren
4. Bibliographie-Einträge in `bibliographie.json` ergänzen
5. `npm run validate:content` ausführen
6. `npm run test` ausführen

### Wie füge ich einen neuen Stationstyp hinzu?

1. Typ-String in der Station-JSON verwenden (offene Liste)
2. In `StationRenderer.tsx` einen neuen Branch für den Typ ergänzen
3. Test schreiben
