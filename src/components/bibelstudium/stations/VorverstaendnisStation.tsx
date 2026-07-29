import type { Station, VorverstaendnisContent, BibliographyEntry } from "@/lib/bibelstudium/types";
import { StationHeader } from "../StationHeader";
import { ScriptureDisplay } from "../ScriptureDisplay";
import { BracketForm } from "../BracketForm";
import { Einklammerung } from "../Einklammerung";
import { Aufloesung } from "../Aufloesung";
import { Belegapparat } from "../Belegapparat";

interface VorverstaendnisStationProps {
  station: Station;
  index: number;
  totalStations: number;
  unitSlug: string;
  bracketData: { content: string; date: string } | null;
  bibMap: Record<string, BibliographyEntry>;
}

export function VorverstaendnisStation({
  station,
  index,
  totalStations,
  unitSlug,
  bracketData,
  bibMap,
}: VorverstaendnisStationProps) {
  const content = station.content as unknown as VorverstaendnisContent;
  const isBracketed = bracketData !== null;

  return (
    <section className="py-10">
      <StationHeader
        stationNumber={index + 1}
        totalStations={totalStations}
        estimatedMinutes={station.estimatedMinutes ?? 15}
        title={station.title}
      />

      <ScriptureDisplay
        reference={content.scripture.reference}
        translation={content.scripture.translation}
        verses={content.scripture.verses}
      />

      {!isBracketed && (
        <BracketForm
          prompt={content.prompt}
          inputType={content.inputType}
          options={content.options}
          stationId={station.id}
          unitSlug={unitSlug}
        />
      )}

      {isBracketed && (
        <>
          <Einklammerung
            content={bracketData.content}
            date={bracketData.date}
          />
          <Aufloesung
            blocks={content.resolution.blocks}
            footnotes={content.resolution.footnotes}
          />
        </>
      )}

      <Belegapparat
        citations={station.citations}
        bibMap={bibMap}
      />
    </section>
  );
}
