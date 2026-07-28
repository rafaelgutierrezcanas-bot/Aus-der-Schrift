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

## Arbeitsablauf je Station

### 5-Schritte-Ablauf

1. **(a) Recherche:** Rafael schreibt Fließtext in `recherche/` — Beobachtungen, Quellen, theologische Einordnung.
2. **(b) Vorschlag:** Claude analysiert das Material, schlägt Stationstyp + Interaktionselemente vor, skizziert 2–3 Varianten. **Keine Dateien anlegen, keinen Code ändern.**
3. **(c) Entscheidung:** Rafael wählt eine Variante (ggf. mit Anpassungen).
4. **(d) Übertragung:** Claude überträgt in die strukturierten `content/`-Dateien (Station-JSON, ggf. Bibliographie). Gibt danach einen Änderungsbericht aus.
5. **(e) Gegenlesen:** Gemeinsame Prüfung auf Wortlaut-Treue und Vollständigkeit.

### Übertragungsregeln (Schritt d)

- **Wortlaut-Treue:** Theologische Formulierungen exakt aus der Recherche-Datei übernehmen, nicht umformulieren.
- **Keine Modalitätsverschiebung:** Wenn die Recherche „ist" sagt, nicht „könnte sein" daraus machen (und umgekehrt).
- **TODO bei fehlenden Belegen:** Wenn eine Quelle in der Recherche genannt, aber nicht in der Bibliographie ist: `"sourceId": "TODO"` verwenden.
- **Nachfragen bei Unklarheiten:** Lieber einmal mehr fragen als falsch übertragen.
- **Änderungsbericht:** Nach jeder Übertragung auflisten, welche Dateien angelegt/geändert wurden und was übertragen wurde.

### Verbote

- Bei Schritt (b) **niemals ungefragt Dateien anlegen** — nur Vorschläge machen.
- Niemals theologischen Inhalt eigenständig formulieren (→ Harte Regel 1).

## Architektur-Kurzreferenz

### Wo liegt was?

| Was | Wo |
|-----|-----|
| Recherche-Material | `recherche/` |
| Mockups (HTML-Vorschau) | `mockups/` |
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
