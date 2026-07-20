"use client";
import { useState, useRef, useEffect } from "react";
import type { Source } from "@/lib/formatChicago";
import type { EntwurfZitat } from "./EntwurfSidebar";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  sources: Source[];
  entwurfQuotes?: EntwurfZitat[];
  onInsertQuote?: (text: string) => void;
}

export default function SourceChat({ sources, entwurfQuotes = [], onInsertQuote }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function sendMessage() {
    const question = input.trim();
    if (!question || streaming) return;

    const userMsg: ChatMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    // Build source data with quotes
    const sourcesWithQuotes = sources.map((s) => ({
      ...s,
      quotes: entwurfQuotes.filter((q) => q.sourceId === s._id),
    }));

    try {
      const res = await fetch("/api/admin/ask-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          sources: sourcesWithQuotes,
          history: messages.slice(-10),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let assistantText = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantText += parsed.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantText };
                  return updated;
                });
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove empty assistant message if exists
        { role: "assistant", content: "Fehler bei der Verarbeitung. Bitte erneut versuchen." },
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 px-4 py-3 min-h-0 max-h-64">
        {messages.length === 0 && (
          <p className="text-xs text-[var(--color-muted)] italic py-2">
            Stelle eine Frage zu deinen verknüpften Quellen.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs leading-relaxed rounded-lg px-3 py-2 ${
              msg.role === "user"
                ? "bg-[var(--color-accent)]/10 text-[var(--color-foreground)] ml-4"
                : "bg-[var(--color-background)] text-[var(--color-foreground)] mr-4 border border-[var(--color-border)]"
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content || (streaming && i === messages.length - 1 ? "..." : "")}</p>
            {/* Insert quote buttons for source references in assistant messages */}
            {msg.role === "assistant" && onInsertQuote && msg.content.includes("[Quelle:") && (
              <button
                onClick={() => onInsertQuote(msg.content)}
                className="mt-1.5 text-xs text-[var(--color-accent)] hover:underline"
              >
                Zitat einfügen
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] px-4 py-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder="Frag deine Quellen..."
          disabled={streaming}
          className="flex-1 text-xs border border-[var(--color-border)] rounded-lg px-3 py-1.5 bg-[var(--color-background)] text-[var(--color-foreground)] focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
        />
        <button
          onClick={sendMessage}
          disabled={streaming || !input.trim()}
          className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
        >
          {streaming ? "..." : "→"}
        </button>
      </div>
    </div>
  );
}
