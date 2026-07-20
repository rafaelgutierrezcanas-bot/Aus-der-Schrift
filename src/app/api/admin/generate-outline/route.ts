import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { title, themes, quotes } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const themeList = (themes ?? [])
    .map((t: any) => `- ${t.thema}${t.notiz ? `: ${t.notiz}` : ""}`)
    .join("\n");

  const quoteList = (quotes ?? [])
    .map((q: any) => `- „${q.text}"${q.source ? ` (${q.source})` : ""}`)
    .join("\n");

  const systemPrompt = `Du bist ein akademischer Schreibassistent für theologische Artikel. Erstelle eine logische Gliederung (H2/H3-Struktur) für den gegebenen Artikel.

REGELN:
1. Erstelle 3-6 Hauptabschnitte (H2) mit optionalen Unterabschnitten (H3)
2. Ordne die vorhandenen Zitate den passenden Abschnitten zu
3. Die Gliederung soll einen logischen Argumentationsfluss haben
4. Beginne mit einer Einleitung und ende mit einem Fazit
5. Berücksichtige die Themen und Notizen des Autors

Antworte als JSON:
{"sections": [{"level": 2, "title": "Abschnittstitel", "quoteIndices": [1, 3], "children": [{"level": 3, "title": "Unterabschnitt", "quoteIndices": []}]}]}`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const userContent = `Artikeltitel: ${title}

${themeList ? `Themen:\n${themeList}` : "Keine Themen definiert."}

${quoteList ? `Verfügbare Zitate:\n${quoteList}` : "Keine Zitate vorhanden."}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = raw.replace(/^```[\w]*\s*/gm, "").replace(/^```\s*$/gm, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Gliederung konnte nicht erstellt werden" }, { status: 500 });
  }
}
