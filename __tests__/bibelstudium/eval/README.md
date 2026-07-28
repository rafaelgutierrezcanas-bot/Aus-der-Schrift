# Golden Sets — Engine-Evaluierung

Golden Sets sind JSON-Dateien, die Eingabe-Erwartung-Paare für die Engines definieren.

## Format

Jede Golden-Set-Datei folgt dem Schema `golden-set.schema.json`:

```json
{
  "schemaVersion": "1.0",
  "engineType": "rule-checker | reference-matcher | card-classifier",
  "cases": [
    {
      "id": "case-001",
      "input": { ... },
      "expected": {
        "match": true,
        "cardId": "...",
        "score": 0.95,
        "matchedItems": ["..."]
      },
      "description": "Beschreibung des Testfalls"
    }
  ]
}
```

## Felder

- **schemaVersion**: Immer `"1.0"`
- **engineType**: Welche Engine getestet wird
- **cases[].id**: Eindeutige ID des Testfalls
- **cases[].input**: Eingabedaten (Engine-abhängig)
- **cases[].expected**: Erwartetes Ergebnis
  - `match` (Pflicht): Ob eine Übereinstimmung erwartet wird
  - `cardId` (optional): Erwartete Karten-ID (nur card-classifier)
  - `score` (optional): Erwarteter Score
  - `matchedItems` (optional): Erwartete übereinstimmende Elemente
- **cases[].description**: Menschenlesbare Beschreibung

## Ablage

Golden-Set-Dateien werden in `sets/` abgelegt, z.B.:
- `sets/rule-checker-basic.json`
- `sets/reference-matcher-genesis.json`

## Nutzung

Golden Sets werden von den Engine-Tests in `__tests__/bibelstudium/unit/engines/` geladen und automatisch als Testfälle ausgeführt.
