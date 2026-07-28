Lies die Recherche-Datei unter dem Pfad: $ARGUMENTS

Übertrage den Inhalt in die strukturierten `content/`-Dateien. Gehe wie folgt vor:

1. **Entscheidung prüfen:** Wurde bereits eine Variante gewählt (z.B. durch vorheriges `/station-entwerfen`)? Falls nicht, frage nach, welche Variante umgesetzt werden soll.

2. **Station-JSON erstellen:** Erstelle die Station-Datei im passenden Einheiten-Ordner unter `content/bibelstudium/einheiten/`. Setze `"status": "entwurf"`.

3. **Bibliographie ergänzen:** Falls Quellen in der Recherche genannt werden, die noch nicht in `content/bibelstudium/bibliographie.json` stehen, ergänze sie dort. Bei fehlenden bibliographischen Angaben verwende `"sourceId": "TODO"` in den Citations.

4. **meta.json aktualisieren:** Trage die neue Station-Datei in das `stations`-Array der `meta.json` ein.

5. **Validierung ausführen:** Führe `npm run validate:content` aus und behebe eventuelle Fehler.

6. **Änderungsbericht ausgeben:** Liste auf:
   - Welche Dateien wurden angelegt oder geändert?
   - Was wurde aus der Recherche übertragen?
   - Wo wurde `"sourceId": "TODO"` verwendet?
   - Gibt es offene Punkte?

**Übertragungsregeln:**
- Theologische Formulierungen exakt aus der Recherche-Datei übernehmen, nicht umformulieren.
- Keine Modalitätsverschiebung (wenn „ist" da steht, nicht „könnte sein" daraus machen).
- Bei Unklarheiten nachfragen statt raten.
- Alle harten Regeln aus `content/bibelstudium/CLAUDE.md` gelten.
