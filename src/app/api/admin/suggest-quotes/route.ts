import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { paragraph, quotes } = await request.json();

  if (!paragraph?.trim() || !Array.isArray(quotes) || quotes.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  // Build the quote library as a cached system prompt
  const quoteLibrary = quotes
    .map(
      (q: any, i: number) =>
        `[${i + 1}] "${q.text}" — ${q.source ?? "Unbekannt"}${q.pages ? `, S. ${q.pages}` : ""}`
    )
    .join("\n");

  const systemPrompt = `Du bist ein Forschungsassistent. Dir steht folgende Zitatbibliothek zur Verfügung:

${quoteLibrary}

Wenn der Nutzer einen Absatz schickt, identifiziere 1-3 Zitate aus der Bibliothek die thematisch gut dazu passen würden. Wähle NUR Zitate die inhaltlich relevant sind — lieber keine Vorschläge als irrelevante.

Antworte als JSON:
{"suggestions": [{"index": 1, "reason": "kurze Begründung auf Deutsch"}]}

Wenn kein Zitat passt: {"suggestions": []}`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
      ],
      messages: [{ role: "user", content: paragraph.slice(0, 2000) }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const cleaned = raw.replace(/^```[\w]*\s*/gm, "").replace(/^```\s*$/gm, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      suggestions: (parsed.suggestions ?? []).map((s: any) => ({
        quoteIndex: s.index,
        reason: s.reason,
      })),
    });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
