import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const SYSTEM_PROMPT = `Du bist ein akademischer Redaktionsassistent für theologische Texte. Analysiere den gegebenen Text und generiere Metadaten.

Antworte als JSON:
{
  "abstractDe": "Kurzzusammenfassung auf Deutsch (100-200 Wörter, akademischer Stil)",
  "abstractEn": "Short summary in English (100-200 words, academic style)",
  "keywords": ["Schlüsselwort1", "Schlüsselwort2", "..."],
  "difficulty": "einfach|mittel|anspruchsvoll"
}

REGELN für Schwierigkeitsgrad:
- "einfach": Allgemeinverständlich, keine Fachbegriffe, devotionaler Charakter
- "mittel": Einige Fachbegriffe, theologische Grundkenntnisse hilfreich
- "anspruchsvoll": Akademisch, Griechisch/Hebräisch, setzt theologisches Studium voraus`;

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { text, title } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Titel: ${title ?? "Unbekannt"}\n\nText:\n${text.slice(0, 30_000)}`,
        },
      ],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = raw.replace(/^```[\w]*\s*/gm, "").replace(/^```\s*$/gm, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      abstractDe: parsed.abstractDe ?? "",
      abstractEn: parsed.abstractEn ?? "",
      keywords: parsed.keywords ?? [],
      difficulty: parsed.difficulty ?? "mittel",
    });
  } catch {
    return NextResponse.json({ error: "Metadaten-Generierung fehlgeschlagen" }, { status: 500 });
  }
}
