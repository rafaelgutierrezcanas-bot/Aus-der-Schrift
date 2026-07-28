import { DoubleFrame } from "./DoubleFrame";

interface Verse {
  number: number;
  text: string;
}

interface ScriptureDisplayProps {
  reference: string;
  translation: string;
  verses: Verse[];
}

export function ScriptureDisplay({ reference, translation, verses }: ScriptureDisplayProps) {
  return (
    <DoubleFrame className="mb-8">
      <p
        className="text-xs text-muted uppercase tracking-widest mb-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {reference}
      </p>

      <div
        className="text-navy"
        style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.9 }}
      >
        {verses.map((verse) => (
          <span key={verse.number}>
            <sup
              className="text-muted text-[10px] mr-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {verse.number}
            </sup>
            {verse.text}{" "}
          </span>
        ))}
      </div>

      <p
        className="text-xs text-muted text-right mt-4"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {translation}
      </p>
    </DoubleFrame>
  );
}
