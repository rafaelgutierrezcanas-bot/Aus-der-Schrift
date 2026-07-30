import type { Citation, BibliographyEntry } from "@/lib/bibelstudium/types";

interface BelegapparatProps {
  citations: Citation[];
  bibMap: Record<string, BibliographyEntry>;
}

export function Belegapparat({ citations, bibMap }: BelegapparatProps) {
  if (citations.length === 0) return null;

  const seenSources = new Set<string>();

  return (
    <div className="mt-8">
      <p
        className="text-xs text-muted uppercase tracking-widest mb-2"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Belege
      </p>
      <div className="border-t border-border pt-3">
        <ul className="space-y-1">
          {citations.map((citation, i) => {
            if (citation.sourceId === "TODO") {
              return (
                <li
                  key={i}
                  className="text-sm text-muted"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  [Quelle ausstehend]
                </li>
              );
            }

            const entry = bibMap[citation.sourceId];
            if (!entry) {
              return (
                <li
                  key={i}
                  className="text-sm text-muted"
                  style={{ fontFamily: "var(--font-sans)" }}
                >
                  [Quelle nicht gefunden: {citation.sourceId}]
                </li>
              );
            }

            // Check if this is a direct repetition of the previous citation's sourceId
            const prevSourceId = i > 0 ? citations[i - 1].sourceId : null;
            const isConsecutiveRepeat = citation.sourceId === prevSourceId;

            const isFirstOccurrence = !seenSources.has(citation.sourceId);
            seenSources.add(citation.sourceId);

            return (
              <li
                key={i}
                className="text-sm text-muted"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {isConsecutiveRepeat
                  ? formatEbd(citation)
                  : isFirstOccurrence
                    ? formatFull(entry, citation)
                    : formatShort(entry, citation)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function formatFull(entry: BibliographyEntry, citation: Citation): React.ReactNode {
  const author = entry.authors.join(" / ");

  const parts: string[] = [];
  if (entry.edition) parts.push(entry.edition);

  const locationParts: string[] = [];
  if (entry.place) locationParts.push(entry.place);
  if (entry.publisher) {
    locationParts.push(locationParts.length > 0 ? ` ${entry.publisher}` : entry.publisher);
  }

  let parenthetical = "";
  if (locationParts.length > 0) {
    parenthetical = locationParts.join(":");
  }
  if (entry.year) {
    parenthetical = parenthetical ? `${parenthetical}, ${entry.year}` : `${entry.year}`;
  }

  return (
    <>
      {author}, <em>{entry.title}</em>
      {parts.length > 0 && `, ${parts.join(", ")}`}
      {parenthetical && ` (${parenthetical})`}
      {citation.pages && `, S. ${citation.pages}`}
      {citation.function && ` [${citation.function}]`}
    </>
  );
}

function formatShort(entry: BibliographyEntry, citation: Citation): React.ReactNode {
  const author = entry.authors.join(" / ");

  return (
    <>
      {author}, <em>{entry.title}</em>
      {citation.pages && `, S. ${citation.pages}`}
      {citation.function && ` [${citation.function}]`}
    </>
  );
}

function formatEbd(citation: Citation): React.ReactNode {
  return (
    <>
      Ebd.{citation.pages && `, S. ${citation.pages}`}
      {citation.function && ` [${citation.function}]`}
    </>
  );
}
