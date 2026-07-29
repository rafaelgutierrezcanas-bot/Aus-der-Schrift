import type { Station, BracketData, BibliographyEntry } from "@/lib/bibelstudium/types";
import { VorverstaendnisStation } from "./stations/VorverstaendnisStation";

interface StationRendererProps {
  station: Station;
  index: number;
  totalStations: number;
  unitSlug: string;
  bracketData: BracketData | null;
  bibMap: Record<string, BibliographyEntry>;
}

export function StationRenderer({
  station,
  index,
  totalStations,
  unitSlug,
  bracketData,
  bibMap,
}: StationRendererProps) {
  switch (station.type) {
    case "vorverstaendnis":
      return (
        <VorverstaendnisStation
          station={station}
          index={index}
          totalStations={totalStations}
          unitSlug={unitSlug}
          bracketData={bracketData}
          bibMap={bibMap}
        />
      );
    default:
      return <GenericStation station={station} index={index} />;
  }
}

function GenericStation({ station, index }: { station: Station; index: number }) {
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
