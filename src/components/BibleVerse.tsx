interface BibleVerseProps {
  reference: string;
  text: string;
  translation?: string;
}

export function BibleVerse({ reference, text, translation }: BibleVerseProps) {
  return (
    <blockquote className="my-8 pl-6 border-l-4 border-accent not-prose">
      <p
        className="italic text-foreground leading-relaxed mb-2"
        style={{ fontFamily: "var(--font-body-serif)" }}
      >
        {text}
      </p>
      <footer
        className="text-sm text-muted"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        <span className="font-medium not-italic">{reference}</span>
        {translation && <span className="ml-2 opacity-70">({translation})</span>}
      </footer>
    </blockquote>
  );
}
