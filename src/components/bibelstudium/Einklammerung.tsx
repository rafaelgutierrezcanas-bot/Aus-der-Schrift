import { DoubleFrame } from "./DoubleFrame";

interface EinklammerungAnswer {
  prompt: string;
  answer: string;
}

interface EinklammerungProps {
  answers: EinklammerungAnswer[];
  date: string;
}

export function Einklammerung({ answers, date }: EinklammerungProps) {
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

        <div className="flex-1 py-2 space-y-4">
          {answers.map((item, i) => (
            <div key={i}>
              {i > 0 && <div className="border-t border-accent/20 mb-4" />}
              <p
                className="text-sm text-muted mb-1"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {item.prompt}
              </p>
              <p
                className="text-navy"
                style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
              >
                {item.answer}
              </p>
            </div>
          ))}
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
