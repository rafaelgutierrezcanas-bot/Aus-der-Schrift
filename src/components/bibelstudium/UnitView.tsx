import type { Unit, BibliographyEntry } from "@/lib/bibelstudium/types";
import { StationRenderer } from "./StationRenderer";

interface UnitViewProps {
  unit: Unit;
  bracketStates: Record<string, { content: string; date: string } | null>;
  bibMap: Record<string, BibliographyEntry>;
}

export function UnitView({ unit, bracketStates, bibMap }: UnitViewProps) {
  return (
    <div>
      {/* Unit header */}
      <div className="mb-10">
        <div className="w-8 h-0.5 bg-accent mb-4" />
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {unit.meta.title}
        </h1>
        <p
          className="text-muted text-lg leading-relaxed max-w-prose"
          style={{ fontFamily: "var(--font-body-serif)" }}
        >
          {unit.meta.description}
        </p>
      </div>

      {/* Stations */}
      <div>
        {unit.stations.map((station, i) => (
          <StationRenderer
            key={station.id}
            station={station}
            index={i}
            totalStations={unit.stations.length}
            unitSlug={unit.meta.slug}
            bracketData={bracketStates[station.id] ?? null}
            bibMap={bibMap}
          />
        ))}
      </div>
    </div>
  );
}
