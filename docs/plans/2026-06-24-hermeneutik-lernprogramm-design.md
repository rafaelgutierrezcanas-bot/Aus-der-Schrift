# Hermeneutik-Lernprogramm — Design-Dokument

**Datum:** 2026-06-24
**Projekt:** Theologik / Aus der Schrift
**Status:** Genehmigt

---

## 1. Überblick

Ein interaktives, webbasiertes Lernprogramm für biblische Hermeneutik, integriert in die bestehende Theologik-Website. Nutzer lernen die hermeneutische Methode (basierend auf Osborne, Köstenberger, Klein/Blomberg/Hubbard) durch geführte Textarbeit an echten Bibeltexten.

### Kernkonzept: Methoden-Werkbank

Statt eines linearen Online-Kurses oder gamifizierter Micro-Lessons steht eine **interaktive Text-Werkbank** im Zentrum: Nutzer wählen einen Bibeltext und werden Schritt für Schritt durch die komplette hermeneutische Analyse geführt. Lernen geschieht durch Tun.

### Entscheidungen

| Aspekt | Entscheidung |
|---|---|
| Projekt-Typ | Route innerhalb der Theologik-Website (`/ressourcen/hermeneutik`) |
| Tech-Stack | Next.js 16, Tailwind v4, Sanity CMS, next-intl (DE/EN) |
| Auth | Optional via Supabase; ohne Login nutzbar (localStorage) |
| Feedback | Mustervergleich (keine KI, um API-Kosten zu vermeiden) |
| Genre-Fokus MVP | Epistel (Thessalonicher + Pastoralbriefe) |
| Erweiterbarkeit | Neue Texte/Genres jederzeit über Sanity Studio hinzufügbar |

---

## 2. Seitenstruktur & Navigation

```
/[locale]/ressourcen/hermeneutik
├── /                        → Übersichtsseite: Einführung + Modulübersicht + Fortschritt
├── /methode                 → Methoden-Lexikon: Alle 6 Schritte als Nachschlagewerk
├── /werkbank                → Textauswahl (verfügbare Bibeltexte)
├── /werkbank/[textId]       → Analyse-Workspace für einen bestimmten Text
└── /fortschritt             → Persönlicher Lernfortschritt & Analyse-Archiv
```

Eigene Sub-Navigation innerhalb des Hermeneutik-Bereichs (Tabs), eingebettet in das bestehende Theologik-Layout.

---

## 3. Die 6 Analyse-Schritte

Basierend auf der integrierten Methodik von Osborne (Hermeneutische Spirale), Köstenberger (Hermeneutische Triade) und Klein/Blomberg/Hubbard:

### Schritt 1: Beobachtung (Akzentfarbe: Amber #F59E0B)
- Text aufmerksam lesen
- Schlüsselwörter markieren (Klick-Interaktion im Text)
- Wiederholungen, Kontraste, Verbindungen notieren (Freitext)

### Schritt 2: Historischer Kontext (Akzentfarbe: Blau #3B82F6)
- Autor, Empfänger, Anlass, kultureller Hintergrund
- Interaktiv: Infokarten mit Hintergrundwissen aufklappen
- Multiple-Choice-Fragen zum Kontext
- **Post-MVP:** Interaktive Karten, Zeitleisten, Kultur-Infografiken

### Schritt 3: Literarische Analyse (Akzentfarbe: Smaragd #10B981)
- Genre bestimmen (Multiple-Choice)
- Textstruktur/Gliederung erstellen
- Stilmittel identifizieren (Markierung im Text)

### Schritt 4: Wortanalyse (Akzentfarbe: Violett #8B5CF6)
- Schlüsselbegriffe auswählen
- Bedeutung im Kontext bestimmen (vs. allgemeine Bedeutung)
- Wortfeld-Exploration

### Schritt 5: Theologische Synthese (Akzentfarbe: Orange #F97316)
- Hauptaussage des Textes formulieren (Freitext)
- Einordnung in die biblische Theologie
- Verbindung zu anderen Bibeltexten identifizieren

### Schritt 6: Kontextualisierung & Anwendung (Akzentfarbe: Pink #EC4899)
- „Was bedeutete es damals?" → „Was bedeutet es heute?"
- Kulturelle Distanz reflektieren
- Persönliche/gemeindliche Anwendung formulieren (Freitext)

### Interaktionstypen
- **Freitext-Eingabe:** Beobachtungen, Synthese, Anwendung
- **Text-Markierung:** Schlüsselwörter, Stilmittel im Bibeltext anklicken
- **Multiple-Choice:** Genre-Bestimmung, Kontextfragen
- **Info-Aufklapper:** Hintergrundwissen, Methoden-Erklärung
- **Mustervergleich:** Nach eigener Eingabe erscheint die Experten-Analyse zum Vergleich

---

## 4. UI-Layout der Werkbank

```
┌─────────────────────────────────────────────────────────┐
│  ◄ Zurück    1. Thessalonicher 1,1-10    Schritt 2/6   │
│              ──────────────────────       ● ● ◐ ○ ○ ○  │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│   BIBELTEXT            │   ARBEITSBEREICH               │
│                        │                                │
│   ¹Paulus und          │   Historischer Kontext          │
│   Silvanus und         │                                │
│   Timotheus an die     │   Wer ist der Autor?           │
│   Gemeinde der         │   ┌─────────────────────┐      │
│   Thessalonicher...    │   │ [Eingabefeld]       │      │
│                        │   └─────────────────────┘      │
│   [Markierbar per      │                                │
│    Klick/Tap]          │   💡 Hintergrund-Info          │
│                        │   ┌───────────────────────┐    │
│                        │   │ Thessalonich war eine │    │
│                        │   │ bedeutende Hafenstadt │    │
│                        │   │ in Mazedonien...      │    │
│                        │   └───────────────────────┘    │
│                        │                                │
│                        │   [Weiter →]                   │
├────────────────────────┴────────────────────────────────┤
│  Methoden-Hilfe: "Was mache ich in diesem Schritt?" ▸   │
└─────────────────────────────────────────────────────────┘
```

- **Split-View:** Bibeltext links (immer sichtbar, markierbar), Arbeitsbereich rechts
- **Mobile:** Gestapelt (Text oben, Arbeit unten) oder swipebar
- **Methoden-Hilfe:** Link zum Lexikon-Eintrag des aktuellen Schritts

---

## 5. Visuelles Design

### Design-Philosophie

Inspiriert von Brilliant und Duolingo — aber angepasst an den theologischen Kontext: ehrwürdig, fokussiert, einladend. Kein visuelles Rauschen, der Bibeltext steht im Zentrum.

### Prinzipien aus Top-Lern-Apps

| Prinzip | Umsetzung |
|---|---|
| "Do first, sign up later" | Nutzer kann sofort analysieren, Login erst für Fortschritt-Sync |
| Sofortiges visuelles Feedback | Jede Interaktion hat Mikro-Animation (Glow, Slide, Fade) |
| Dark UI mit hohem Kontrast | Bibeltext leuchtet hervor, Augen-Komfort bei längerem Lesen |
| Progressive Disclosure | Nächster Schritt enthüllt sich erst nach Abschluss des vorherigen |
| Bite-sized Erfolge | Completion-Animation nach jedem Schritt |
| Personality through Design | Ikonische Illustrationen/Icons pro Analyse-Schritt |

### Farbsystem

```
Background:       #0A0A0F (fast-schwarz)
Surface:          #141418 (Karten, Panels)
Border:           rgba(255,255,255, 0.08)
Text Primary:     #F0F0F5 (warm-weiß)
Text Secondary:   #8A8A9A (gedämpft)

Akzentfarben pro Schritt:
  Beobachtung:         #F59E0B (Amber)
  Historischer Kontext: #3B82F6 (Blau)
  Literarische Analyse: #10B981 (Smaragd)
  Wortanalyse:         #8B5CF6 (Violett)
  Theol. Synthese:     #F97316 (Orange)
  Kontextualisierung:  #EC4899 (Pink)
```

### Typografie

- **Bibeltext:** Serif-Schrift (Spectral oder Literata) — ehrwürdig, gut lesbar
- **UI/Headings:** Sans-Serif (Inter oder System) — clean, modern
- **Griechisch/Hebräisch:** Monospace für Transliterationen

### Radien & Spacing

- Border-Radius: 16–18px (weich, einladend)
- Großzügiger Whitespace — Text atmen lassen

### Mikro-Interaktionen

1. **Text-Markierung:** Wort antippen → sanfter Glow in Schritt-Akzentfarbe
2. **Schritt abschließen:** Fortschrittskreis füllt sich animiert
3. **Analyse komplett:** Alle 6 Schritt-Icons leuchten auf, Completion-Card gleitet ein
4. **Mustervergleich:** Eigene + Experten-Analyse erscheinen nebeneinander mit Slide-In
5. **Methoden-Hilfe Hover:** Tooltip expandiert smooth mit Erklärung

---

## 6. Methoden-Lexikon

Nachschlage-Referenz unter `/methode`. Jeder der 6 Analyse-Schritte hat eine Seite mit:

- **Was?** — Kurze Erklärung (2–3 Absätze)
- **Warum?** — Bedeutung des Schritts
- **Wie?** — Konkrete Anleitung mit Leitfragen
- **Beispiel** — Ein durchgearbeitetes Beispiel
- **Häufige Fehler** — Was Anfänger oft falsch machen
- **Quellen** — Verweise auf Osborne, Köstenberger, Klein

Aus der Werkbank jederzeit erreichbar über den "Methoden-Hilfe"-Button.

---

## 7. Fortschritt & Datenpersistenz

### Fortschrittsseite (`/fortschritt`)

- Abgeschlossene Analysen mit Datum
- Kompetenz pro Schritt (wie oft ausgefüllt)
- Analyse-Archiv: eigene Analysen nochmal ansehen

### Datenspeicherung

- **Ohne Login:** localStorage im Browser
- **Mit Login (optional):** Supabase Auth + Supabase DB für Cloud-Sync
- Kein Gamification (kein XP, keine Streaks) — ehrlicher Überblick über eigene Praxis

---

## 8. Content-Management & Erstellungs-Workflow

### Sanity CMS Schemas

```
hermeneutikSchritt (document)
  ├── title (localeString DE/EN)
  ├── slug (string)
  ├── order (number)
  ├── explanation (localePortableText)      → Was/Warum/Wie
  ├── guidingQuestions[] (localeString)
  ├── commonMistakes[] (localeString)
  ├── interactionType (enum: freetext | marking | multiplechoice)
  ├── sources[] (string)                   → Buchverweise

hermeneutikText (document)
  ├── title (localeString)                 → z.B. "1. Thessalonicher 1,1-10"
  ├── slug (string)
  ├── bibleReference (string)              → "1Thess 1,1-10"
  ├── genre (enum: epistle | narrative | poetry | prophecy | wisdom | apocalyptic)
  ├── difficulty (enum: beginner | intermediate | advanced)
  ├── textContent (localePortableText)     → Der Bibeltext
  ├── backgroundInfo (localePortableText)  → Historischer Kontext
  ├── stepAnalyses[] (array of objects)
  │     ├── step (reference → hermeneutikSchritt)
  │     ├── expertAnalysis (localePortableText) → Musterlösung
  │     ├── hints[] (localeString)              → Tipps/Hinweise
  │     └── interactionData (json)              → MC-Optionen, korrekte Markierungen
```

### Content-Workflow für den Autor

1. Sanity Studio öffnen → "Hermeneutik-Text" anlegen
2. Bibeltext eintragen (DE + EN)
3. Für jeden der 6 Schritte ausfüllen:
   - Hintergrundinfos (aus Kommentaren)
   - Leitfragen
   - Musterlösung
   - Interaktionsdaten (MC-Optionen etc.)
4. Veröffentlichen → sofort live, kein Redeploy nötig

---

## 9. MVP-Texte

Genre-Fokus: **Epistel** (stärkstes Kommentar-Material vorhanden)

| Text | Schwierigkeit | Begründung |
|---|---|---|
| 1. Thessalonicher 1,1–10 | Beginner | Briefeingang, klare Struktur, unkontrovers |
| 1. Thessalonicher 5,12–28 | Beginner | Schlussparänese, praktisch, gut analysierbar |
| 2. Timotheus 3,14–17 | Beginner | Thematisch perfekt (Schrift & Hermeneutik), unkontrovers |

Weitere Texte und Genres werden über die Zeit via Sanity Studio ergänzt.

---

## 10. Zweisprachigkeit

- Vollständig DE/EN via next-intl (bereits im Projekt)
- UI-Texte: Übersetzungsdateien
- Content (Bibeltexte, Erklärungen, Musteranalysen): localeString/localePortableText in Sanity
- Bibeltext-Quelle: Elberfelder (DE), ESV oder NASB (EN)

---

## 11. Post-MVP Erweiterungen

- Interaktive Karten und Zeitleisten für historischen Kontext
- Weitere Genres (Narrativ, Poesie, Prophetie, Weisheit)
- Drag-and-Drop für Textstruktur-Gliederung
- Community-Feature: eigene Analysen teilen
- Fortschritts-Badges (optional)
- Kultur-Infografiken zu historischem Kontext

---

## 12. Lerntheoretische Grundlage

### Self-Determination Theory (Deci & Ryan)
- **Autonomie:** Nutzer wählen Text, Tempo, können Schritte wiederholen
- **Kompetenz:** Sofortiger Mustervergleich, sichtbarer Fortschritt
- **Zugehörigkeit:** Post-MVP Community-Features

### Scaffolding (Vygotsky ZPD)
- Geführte Analyse mit Info-Aufklappern und Leitfragen
- Progressive Disclosure: nächster Schritt erst nach Abschluss
- Methoden-Hilfe jederzeit erreichbar

### Spaced Repetition / Retrieval Practice
- Methodenschritte werden durch wiederholte Anwendung an verschiedenen Texten verinnerlicht
- Lexikon als Nachschlagewerk fördert aktives Erinnern

### Case-Based Learning
- Jede Analyse ist ein "Fall" — ein echter Bibeltext als Übungsobjekt
- Mustervergleich nach eigener Arbeit
