import { parseFootnotes } from "@/lib/bibelstudium/footnote-parser";

interface Footnote {
  number: number;
  sourceId: string;
  pages: string;
}

interface AufloesungProps {
  blocks: string[];
  footnotes: Footnote[];
}

export function Aufloesung({ blocks }: AufloesungProps) {
  return (
    <div className="mb-8 space-y-4">
      {blocks.map((block, i) => (
        <p
          key={i}
          className="text-navy"
          style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
        >
          {renderBlock(block)}
        </p>
      ))}
    </div>
  );
}

function renderBlock(text: string): React.ReactNode {
  const segments = parseFootnotes(text);

  return segments.map((segment, i) => {
    if (segment.type === "text") {
      return <span key={i}>{segment.value}</span>;
    }
    return (
      <sup key={i} className="text-accent font-semibold text-xs cursor-help">
        {segment.number}
      </sup>
    );
  });
}
