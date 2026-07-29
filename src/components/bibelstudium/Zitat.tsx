import type { BibliographyEntry } from "@/lib/bibelstudium/types";
import { formatShortCitation } from "@/lib/bibelstudium/citation-formatter";

interface ZitatProps {
  text: string;
  sourceId: string;
  pages: string;
  bibMap: Record<string, BibliographyEntry>;
}

export function Zitat({ text, sourceId, pages, bibMap }: ZitatProps) {
  const entry = bibMap[sourceId];

  return (
    <blockquote className="my-8 pl-6 border-l-0">
      <p
        className="text-navy italic"
        style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
      >
        &bdquo;{text}&ldquo;
      </p>
      {entry && (
        <p
          className="text-xs text-muted mt-2"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {formatShortCitation(entry, pages)}
        </p>
      )}
    </blockquote>
  );
}
