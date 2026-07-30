interface StationHeaderProps {
  stationNumber: number;
  totalStations: number;
  estimatedMinutes: number;
  title: string;
  unitTitle: string;
}

export function StationHeader({
  stationNumber,
  totalStations,
  estimatedMinutes,
  title,
  unitTitle,
}: StationHeaderProps) {
  return (
    <div className="mb-6">
      <p
        className="text-xs text-muted uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {unitTitle} · STATION {stationNumber} VON {totalStations} · ETWA {estimatedMinutes} MINUTEN
      </p>
      <h2
        className="text-2xl font-bold text-navy leading-tight"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h2>
    </div>
  );
}
