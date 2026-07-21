import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/adminAuth";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const denied = await requireAuth();
  if (denied) return denied;

  const { question, sources, history } = await request.json();

  if (!question?.trim()) {
    return new Response(JSON.stringify({ error: "Question required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Build source context from metadata, notes, and quotes
  const sourceContext = (sources ?? [])
    .map((s: any, i: number) => {
      let entry = `[Quelle ${i + 1}] ${s.authors} (${s.year}). ${s.title}.`;
      if (s.notes) entry += `\nNotizen: ${s.notes}`;
      if (s.passages?.length > 0) {
        entry += "\nTextabschnitte:";
        for (const p of s.passages) {
          const loc = [p.chapter, p.pages ? `S. ${p.pages}` : ""].filter(Boolean).join(", ");
          entry += `\n  [${loc || "o.S."}] ${p.text}`;
        }
      }
      if (s.quotes?.length > 0) {
        entry += "\nZitate:";
        for (const q of s.quotes) {
          entry += `\n  - „${q.text}"${q.pages ? ` (S. ${q.pages})` : ""}`;
        }
      }
      return entry;
    })
    .join("\n\n");

  const systemPrompt = `Du bist ein theologischer Forschungsassistent. Du antwortest AUSSCHLIESSLICH auf Basis der folgenden Quellen. Erfinde NICHTS.

QUELLEN:
${sourceContext || "Keine Quellen verknüpft."}

REGELN:
1. Antworte nur auf Basis der obigen Quellen
2. Zitiere IMMER mit [Quelle: Autor (Jahr), S. X] wenn du dich auf eine Quelle beziehst
3. Wenn die Quellen keine Antwort liefern, sage das ehrlich
4. Antworte auf Deutsch, es sei denn die Frage ist auf Englisch
5. Halte dich kurz und präzise`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build message history
    const messages: Anthropic.MessageParam[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: "user", content: question.slice(0, 5000) });

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: [
        { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
      ],
      messages,
    });

    // SSE response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
