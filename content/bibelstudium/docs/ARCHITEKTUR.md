# Bibelstudium-Hub — Architektur

## Datenfluss

```
content/bibelstudium/einheiten/  →  content-loader.ts  →  Page Component  →  UnitView
         ↑                              ↑                                       ↑
   JSON-Dateien              Schema-Validierung (Build)              StationRenderer
                                                                   (Dispatch nach type)
```

```
bibliographie.json  →  content-loader.ts  →  Citation-Auflösung
                                                    ↑
                              station.citations[].sourceId
```

## Verzeichnisstruktur

```
content/bibelstudium/
├── schemas/              ← JSON Schemas (Validierung)
├── einheiten/            ← Lerneinheiten (je ein Ordner)
│   └── <name>/
│       ├── meta.json     ← Metadaten + Stationsreihenfolge
│       └── *.json        ← Stationsdateien
├── uebungen/             ← Einzelübungen
├── methoden/             ← Methodenbibliothek
├── bibeltexte/           ← Bibeltexte
└── bibliographie.json    ← Alle Quellen

src/lib/bibelstudium/
├── types.ts              ← TypeScript-Typen
├── content-loader.ts     ← Liest JSON-Dateien
├── engines/              ← Auswertungs-Engines
│   ├── types.ts
│   ├── rule-checker.ts
│   ├── reference-matcher.ts
│   └── card-classifier.ts
└── validation/
    └── validate.ts       ← AJV-basierte Validierung

src/app/[locale]/bibelstudium/
├── page.tsx              ← Hub-Übersicht
├── layout.tsx            ← Metadata
└── [unitSlug]/
    └── page.tsx          ← Einheit-Ansicht

src/components/bibelstudium/
├── StationRenderer.tsx   ← Dispatch nach station.type
├── UnitOverview.tsx      ← Einheiten-Karten
└── UnitView.tsx          ← Einheit mit Stationen
```

## Wo ändere ich was?

### Neuen Content hinzufügen
→ `content/bibelstudium/einheiten/` (neuer Ordner) + `bibliographie.json`

### Neuen Stationstyp
→ `StationRenderer.tsx` (Rendering) + ggf. Engine-Logik

### Schema erweitern
→ `content/bibelstudium/schemas/` + `src/lib/bibelstudium/types.ts`

### Neue Engine
→ `src/lib/bibelstudium/engines/` + Tests in `__tests__/bibelstudium/unit/engines/`

### Validierungsregeln
→ `scripts/validate-bibelstudium.ts`

## Content hinzufügen (Schritt für Schritt)

1. Ordner anlegen: `content/bibelstudium/einheiten/meine-einheit/`
2. `meta.json` erstellen mit `schemaVersion`, `id`, `slug`, `title`, `description`, `stations`, `citations`
3. Stationsdateien erstellen (z.B. `01-einfuehrung.json`)
4. Stationsdateinamen in `meta.json.stations` eintragen
5. Bibliographie-Einträge in `bibliographie.json` ergänzen
6. Validieren: `npm run validate:content`
7. Testen: `npm run test`
8. Dev-Server prüfen: `npm run dev` → `/{locale}/bibelstudium/{slug}`

## Station-Typ hinzufügen

1. Typ-String in der Station-JSON verwenden (z.B. `"type": "lueckentext"`)
2. In `StationRenderer.tsx` einen Rendering-Branch ergänzen
3. Optional: Engine-Logik in `src/lib/bibelstudium/engines/`
4. Test schreiben
5. Golden Set für Engine-Evaluierung in `__tests__/bibelstudium/eval/sets/`
