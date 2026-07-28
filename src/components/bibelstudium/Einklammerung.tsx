import { DoubleFrame } from "./DoubleFrame";

interface EinklammerungProps {
  content: string;
  date: string;
}

export function Einklammerung({ content, date }: EinklammerungProps) {
  return (
    <DoubleFrame accent className="mb-8">
      <div className="flex items-start gap-2">
        <span
          className="text-accent text-5xl leading-none select-none -mt-2"
          style={{ fontFamily: "Georgia, serif" }}
          aria-hidden="true"
        >
          (
        </span>

        <div className="flex-1 py-2">
          <p
            className="text-navy"
            style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
          >
            {content}
          </p>
        </div>

        <span
          className="text-accent text-5xl leading-none select-none -mt-2"
          style={{ fontFamily: "Georgia, serif" }}
          aria-hidden="true"
        >
          )
        </span>
      </div>

      <p
        className="text-xs text-muted mt-3"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        Eingeklammert am {date}
      </p>
    </DoubleFrame>
  );
}
