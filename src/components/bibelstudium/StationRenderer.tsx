import type { Station } from "@/lib/bibelstudium/types";

interface StationRendererProps {
  station: Station;
  index: number;
}

export function StationRenderer({ station, index }: StationRendererProps) {
  return (
    <section className="py-8 border-b border-border last:border-0">
      <div className="flex items-baseline gap-4 mb-4">
        <span
          className="text-xs text-accent font-semibold uppercase tracking-widest"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="text-[10px] text-muted uppercase tracking-widest"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {station.type}
        </span>
      </div>

      <h3
        className="text-xl font-bold leading-tight mb-3"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {station.title}
      </h3>

      {station.instructions && (
        <p
          className="text-muted leading-relaxed mb-4"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {station.instructions}
        </p>
      )}

      {/* Generic content rendering — type-specific renderers will be added later */}
      {station.content && Object.keys(station.content).length > 0 && (
        <div className="bg-surface rounded-lg p-5 border border-border">
          <pre className="text-sm text-muted whitespace-pre-wrap" style={{ fontFamily: "var(--font-sans)" }}>
            {JSON.stringify(station.content, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
