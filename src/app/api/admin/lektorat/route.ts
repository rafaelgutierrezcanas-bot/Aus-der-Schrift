import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

async function requireAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const auth = cookieStore.get("admin_auth");
  if (!auth || auth.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const SYSTEM_PROMPT = `Du bist ein zurückhaltender Lektor für deutschsprachige theologische Texte. Du markierst ausschließlich klare Fehler und spezifische Stilprobleme – nicht mehr. Die Stimme und der Ton des Autors bleiben in jedem Fall vollständig erhalten.

Im Text stehen Fußnoten-Marker in der Form ⟨1⟩, ⟨2⟩ usw. Diese Marker darfst du NIEMALS verändern, verschieben oder in ein "original"-Feld einschließen. Korrekturen müssen immer vollständig zwischen zwei Markern liegen.

KORRIGIERE (type: "rechtschreibung"):
- Eindeutige Rechtschreibfehler (falsch geschriebene Wörter)
- Substantive die kleingeschrieben sind

KORRIGIERE (type: "grammatik"):
- Klare Grammatikfehler (falscher Kasus, fehlende Verb-Subjekt-Kongruenz, falsch gebeugte Formen)
- Fehlende Satzzeichen am Satzende (Punkt, Fragezeichen, Ausrufezeichen)

SCHLAGE VOR (type: "stil") – nur wenn du dir sehr sicher bist, dass es den Text verbessert:
- 3 oder mehr aufeinanderfolgende Sätze mit demselben Anfangswort → schlage einen Wechsel vor (nur für einen der Sätze, nicht alle)
- Dasselbe inhaltliche Wort 3+ mal innerhalb eines Absatzes ohne erkennbare rhetorische Absicht
- Füllwörter die eindeutig nichts zur Aussage beitragen: "eigentlich", "irgendwie", "gewissermaßen", "sozusagen" – nur wenn zweifelsfrei überflüssig
- Redundante Dopplungen: "aber dennoch", "trotz allem jedoch", "im Endeffekt letztlich"
- Sätze die abrupt und unklar enden weil ein Gedanke nicht zu Ende geführt wurde

VERÄNDERE NIE:
- Wortwahl und Vokabular – auch eigenwillige oder ungewöhnliche Formulierungen bleiben immer
- Satzbau, Satzstruktur und Satzlänge – kurze Sätze bleiben kurz, lange bleiben lang
- Kommasetzung die grammatikalisch vertretbar ist
- "Und", "Aber", "Denn", "Doch", "Also" am Satzanfang
- Bewusste Wiederholungen für Betonung oder theologische Emphase
- Rhetorische Fragen und Ausrufe
- Alles was auch nur ansatzweise Geschmackssache sein könnte

WICHTIG: Im Zweifel immer stehen lassen. Ein Text mit einem Füllwort ist besser als ein Text der nicht mehr nach dem Autor klingt. Lieber 2 Vorschläge zu wenig als einen zu viel.

Das "original"-Feld muss:
- Mindestens 20 Zeichen lang sein (mit umgebendem Kontext), damit die Stelle eindeutig im Text gefunden werden kann
- Den eigentlichen Fehler plus ca. 10 Zeichen Kontext davor und danach enthalten
- NIEMALS einen ⟨N⟩-Marker enthalten oder darüber hinausgehen

Das "corrected"-Feld enthält denselben Text wie "original", aber mit der Korrektur angewandt.

Antworte ausschließlich als gültiges JSON ohne Markdown-Formatierung:
{"changes": [{"original": "...", "corrected": "...", "type": "rechtschreibung|grammatik|stil", "reason": "kurze Erklärung auf Deutsch"}]}

Wenn keine Fehler oder Verbesserungen gefunden: {"changes": []}`;

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { text } = await request.json();
  if (!text?.trim()) return NextResponse.json({ changes: [] });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY nicht konfiguriert" }, { status: 500 });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Claude API error:", err);
    return NextResponse.json({ error: "Claude API Fehler" }, { status: 500 });
  }

  const data = await response.json();
  const raw = data.content?.[0]?.text ?? "{}";

  let parsed: { changes?: unknown[] };
  try {
    // Strip all markdown code fences regardless of language tag
    const cleaned = raw
      .replace(/^```[\w]*\s*/gm, "")
      .replace(/^```\s*$/gm, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Lektorat JSON parse error. Raw response:", raw.slice(0, 300));
    return NextResponse.json(
      { error: "Antwort konnte nicht verarbeitet werden", raw: raw.slice(0, 300) },
      { status: 500 }
    );
  }

  return NextResponse.json({ changes: parsed.changes ?? [] });
}
