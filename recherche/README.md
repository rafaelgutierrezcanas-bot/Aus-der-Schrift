# Recherche-Ordner

## Zweck

Hier liegen Fließtext-Dateien mit Recherchematerial zu einzelnen Stationen. Rafael schreibt hier seine theologischen Erkenntnisse, Notizen und Quellen in freier Form auf. Claude analysiert das Material und schlägt daraus Interaktionselemente vor.

## Format

- Eine Markdown-Datei pro Station (oder Themenblock)
- Dateiname: beschreibender Name, z.B. `psalm-1-beobachtungen.md`
- Freier Fließtext — keine JSON-Struktur nötig
- Bibelstellen, Quellen und Seitenangaben im Text vermerken

## Ablauf

1. Rafael schreibt Recherche-Datei in `recherche/`
2. `/station-entwerfen recherche/dateiname.md` — Claude analysiert und schlägt Varianten vor
3. Rafael entscheidet sich für eine Variante
4. `/station-bauen recherche/dateiname.md` — Claude überträgt in `content/`-Dateien
5. Gemeinsames Gegenlesen und Korrektur
