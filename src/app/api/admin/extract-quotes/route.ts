import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

const MAX_PDF_SIZE = 20 * 1024 * 1024; // 20 MB
const MAX_TEXT_LENGTH = 100_000; // 100k chars

const SYSTEM_PROMPT = `Du bist ein Forschungsassistent für theologische Texte. Deine Aufgabe ist es, die wichtigsten Zitate aus einem akademischen Text zu extrahieren.

REGELN:
1. Extrahiere 5-10 der wichtigsten, aussagekräftigsten Zitate aus dem Text
2. Jedes Zitat muss EXAKT so im Text stehen — kein Umschreiben, kein Kürzen, kein Erfinden
3. Bevorzuge Zitate die eine klare These, ein Argument oder eine wichtige Definition enthalten
4. Gib für jedes Zitat die Seitenzahl an (falls im Text erkennbar)
5. Sortiere die Zitate nach Relevanz (wichtigstes zuerst)

Antworte als JSON-Array:
[{"text": "exaktes Zitat", "page": "Seitenzahl oder null"}]`;

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.name.endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  }

  if (file.size > MAX_PDF_SIZE) {
    return NextResponse.json({ error: "PDF zu groß (max. 20 MB)" }, { status: 413 });
  }

  try {
    // Dynamically import pdf.js-extract (Node.js only)
    const { PDFExtract } = await import("pdf.js-extract");
    const pdfExtract = new PDFExtract();

    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfExtract.extractBuffer(buffer);

    // Build text with page markers
    let fullText = "";
    for (const page of data.pages as any[]) {
      const pageNum = (page as any).pageInfo?.num ?? (page as any).pageNumber;
      const pageText = page.content
        .map((item: any) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (pageText) {
        fullText += `\n[Seite ${pageNum}]\n${pageText}\n`;
      }
    }

    if (!fullText.trim()) {
      return NextResponse.json({ error: "Kein Text im PDF gefunden" }, { status: 422 });
    }

    // Truncate if too long
    const text = fullText.length > MAX_TEXT_LENGTH
      ? fullText.slice(0, MAX_TEXT_LENGTH) + "\n[... Text gekürzt]"
      : fullText;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "[]";

    let quotes: Array<{ text: string; page: string | null }>;
    try {
      const cleaned = raw.replace(/^```[\w]*\s*/gm, "").replace(/^```\s*$/gm, "").trim();
      quotes = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Antwort konnte nicht verarbeitet werden" }, { status: 500 });
    }

    return NextResponse.json({ quotes, pageCount: data.pages.length });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json({ error: "PDF-Verarbeitung fehlgeschlagen" }, { status: 500 });
  }
}
