"use client";

interface Sidenote {
  index: number;
  text: string;
}

interface SidenotesColumnProps {
  sidenotes: Sidenote[];
  locale: string;
}

export function SidenotesColumn({ sidenotes, locale }: SidenotesColumnProps) {
  if (sidenotes.length === 0) return null;

  return (
    <aside
      className="hidden xl:block w-[260px] shrink-0"
      aria-label={locale === "de" ? "Randnotizen" : "Sidenotes"}
    >
      <div className="sticky top-24 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {sidenotes.map((note) => (
          <div
            key={note.index}
            id={`sn-${note.index}`}
            className="text-[11px] leading-relaxed text-muted border-l-2 border-border pl-3"
            style={{ fontFamily: "var(--font-body-serif)" }}
          >
            <span
              className="font-semibold text-accent mr-1"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              [{note.index}]
            </span>
            {note.text}
          </div>
        ))}
      </div>
    </aside>
  );
}
