import type { Station, VorverstaendnisContent, BracketData, BibliographyEntry } from "@/lib/bibelstudium/types";
import { StationHeader } from "../StationHeader";
import { ScriptureDisplay } from "../ScriptureDisplay";
import { VorverstaendnisInteractive } from "../VorverstaendnisInteractive";
import { Belegapparat } from "../Belegapparat";
import { StationNavigation } from "../StationNavigation";

interface VorverstaendnisStationProps {
  station: Station;
  index: number;
  totalStations: number;
  unitSlug: string;
  bracketData: BracketData | null;
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

  return (
    <section className="py-10">
      <StationHeader
        stationNumber={index + 1}
        totalStations={totalStations}
        estimatedMinutes={station.estimatedMinutes ?? 15}
        title={station.title}
      />

      {content.intro && (
        <p
          className="text-navy mb-6"
          style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
        >
          {content.intro}
        </p>
      )}

      <ScriptureDisplay
        reference={content.scripture.reference}
        translation={content.scripture.translation}
        verses={content.scripture.verses}
      />

      <VorverstaendnisInteractive
        questions={content.questions}
        resolution={content.resolution}
        stationId={station.id}
        unitSlug={unitSlug}
        initialBracketData={bracketData}
        bibMap={bibMap}
      />

      <Belegapparat
        citations={station.citations}
        bibMap={bibMap}
      />

      {content.navigation && (
        <StationNavigation
          prev={content.navigation.prev}
          next={content.navigation.next}
        />
      )}
    </section>
  );
}
