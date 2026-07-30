"use client";

import { useState, useCallback } from "react";
import type {
  VorverstaendnisQuestion,
  VorverstaendnisContent,
  BracketData,
  BibliographyEntry,
} from "@/lib/bibelstudium/types";
import { Einklammerung } from "./Einklammerung";
import { Aufloesung } from "./Aufloesung";
import { Zitat } from "./Zitat";
import { DistanzModul } from "./DistanzModul";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

interface VorverstaendnisInteractiveProps {
  questions: VorverstaendnisQuestion[];
  resolution: VorverstaendnisContent["resolution"];
  stationId: string;
  unitSlug: string;
  initialBracketData: BracketData | null;
  bibMap: Record<string, BibliographyEntry>;
}

export function VorverstaendnisInteractive({
  questions,
  resolution,
  stationId,
  unitSlug,
  initialBracketData,
  bibMap,
}: VorverstaendnisInteractiveProps) {
  const [bracketData, setBracketData] = useState<BracketData | null>(initialBracketData);
  const [formAnswers, setFormAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionSaved, setPredictionSaved] = useState(false);

  const isBracketed = bracketData !== null;

  const handleAnswerChange = useCallback((questionId: string, value: string | string[]) => {
    setFormAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // Count unanswered required questions
  const unansweredCount = questions.filter((q) => {
    if (!q.required) return false;
    const answer = formAnswers[q.id];
    if (!answer) return true;
    if (typeof answer === "string" && !answer.trim()) return true;
    if (Array.isArray(answer) && answer.length === 0) return true;
    return false;
  }).length;

  const handleBracketSubmit = useCallback(async () => {
    if (unansweredCount > 0) return;

    setIsSubmitting(true);

    try {
      const { bracketInput } = await import("@/lib/bibelstudium/actions");
      const fd = new FormData();
      fd.set("stationId", stationId);
      fd.set("unitSlug", unitSlug);
      fd.set("answers", JSON.stringify(formAnswers));
      await bracketInput(fd);

      const now = new Date();
      const date = now.toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      setBracketData({ answers: formAnswers, date });
    } finally {
      setIsSubmitting(false);
    }
  }, [formAnswers, stationId, unitSlug, unansweredCount]);

  const handlePredictionSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const prediction = fd.get("prediction") as string;
    if (!prediction?.trim()) return;

    const { savePrediction } = await import("@/lib/bibelstudium/actions");
    const serverFd = new FormData();
    serverFd.set("stationId", stationId);
    serverFd.set("unitSlug", unitSlug);
    serverFd.set("prediction", prediction);
    await savePrediction(serverFd);
    setPredictionSaved(true);
  }, [stationId, unitSlug]);

  // Determine Q4 answers for distance module
  const selfTestQuestionId = resolution.distance.selfTestQuestionId;
  const selfTestAnswers: string[] = isBracketed
    ? (Array.isArray(bracketData.answers[selfTestQuestionId])
      ? bracketData.answers[selfTestQuestionId] as string[]
      : [])
    : [];

  // Find Q4 total options count
  const selfTestQuestion = questions.find((q) => q.id === selfTestQuestionId);
  const totalOptions = selfTestQuestion?.options?.length ?? 0;

  if (!isBracketed) {
    const allAnswered = unansweredCount === 0;

    return (
      <div className="mb-8">
        <div className="space-y-10">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <QuestionField
                question={q}
                index={i}
                value={formAnswers[q.id]}
                onChange={handleAnswerChange}
                disabled={isSubmitting}
              />
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={handleBracketSubmit}
            disabled={isSubmitting || !allAnswered}
            className={`px-5 py-2 text-sm border transition-colors min-h-[44px] ${
              allAnswered
                ? "text-white bg-accent border-accent cursor-pointer hover:bg-accent/90"
                : "text-muted border-muted cursor-not-allowed"
            }`}
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {isSubmitting ? "Wird eingeklammert…" : "Einklammern und weiter"}
          </button>
          {unansweredCount > 0 && (
            <span
              className="text-sm text-muted"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Noch {unansweredCount} {unansweredCount === 1 ? "Frage" : "Fragen"} offen
            </span>
          )}
        </div>
      </div>
    );
  }

  // Build Einklammerung answers (Q1-Q3 only, not Q4)
  const bracketedQuestions = questions.filter((q) => q.id !== selfTestQuestionId);
  const einklammerungAnswers = bracketedQuestions.map((q) => {
    const raw = bracketData.answers[q.id];
    const answer = Array.isArray(raw) ? raw.join(", ") : (raw ?? "");
    return { prompt: q.prompt, answer };
  });

  return (
    <div>
      <Einklammerung answers={einklammerungAnswers} date={bracketData.date} />

      <Aufloesung
        blocks={resolution.whatYouBring.blocks}
        footnotes={resolution.whatYouBring.footnotes}
      />

      <Zitat
        text={resolution.quote.text}
        sourceId={resolution.quote.sourceId}
        pages={resolution.quote.pages}
        bibMap={bibMap}
      />

      <p
        className="text-navy my-8"
        style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
      >
        {resolution.transition}
      </p>

      <DistanzModul
        items={resolution.distance.items}
        selfTestAnswers={selfTestAnswers}
        totalOptions={totalOptions}
      />

      {/* Q5 Prediction */}
      <div className="my-8">
        {!predictionSaved ? (
          <form onSubmit={handlePredictionSubmit}>
            <p
              className="text-navy mb-4"
              style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
            >
              {resolution.prediction.prompt}
            </p>
            <textarea
              name="prediction"
              className="w-full min-h-[120px] p-4 text-navy bg-surface/50 border-0 resize-y focus:outline-none focus:ring-1 focus:ring-navy/30 rounded"
              style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
              placeholder="Schreibe hier deine Vorhersage…"
            />
            <button
              type="submit"
              className="mt-4 px-5 py-2 text-sm text-navy border border-navy hover:bg-navy/5 transition-colors cursor-pointer min-h-[44px]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Vorhersage speichern
            </button>
          </form>
        ) : (
          <p
            className="text-sm text-muted"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            Vorhersage gespeichert.
          </p>
        )}
      </div>

      <p
        className="text-navy my-8"
        style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
      >
        {resolution.synthesis}
      </p>
    </div>
  );
}

// ----- Question Field Subcomponent -----

interface QuestionFieldProps {
  question: VorverstaendnisQuestion;
  index: number;
  value: string | string[] | undefined;
  onChange: (id: string, value: string | string[]) => void;
  disabled: boolean;
}

function QuestionField({ question, index, value, onChange, disabled }: QuestionFieldProps) {
  const selectedValue = typeof value === "string" ? value : "";
  const selectedValues = Array.isArray(value) ? value : [];

  return (
    <div>
      <p
        className="text-xs text-muted uppercase tracking-widest"
        style={{ fontFamily: "var(--font-sans)", marginBottom: "6px" }}
      >
        FRAGE {ROMAN[index] ?? index + 1}
      </p>
      <p
        className="text-navy"
        style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8, marginBottom: "10px" }}
      >
        {question.prompt}
      </p>

      {question.inputType === "freitext" && (
        <textarea
          disabled={disabled}
          value={selectedValue}
          onChange={(e) => onChange(question.id, e.target.value)}
          className="w-full min-h-[120px] p-4 text-navy bg-surface/50 border-0 resize-y focus:outline-none focus:ring-1 focus:ring-navy/30 rounded"
          style={{ fontFamily: "var(--font-body-serif)", lineHeight: 1.8 }}
          placeholder="Schreibe hier deine Antwort…"
        />
      )}

      {question.inputType === "auswahl" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedValue === option.label;
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange(question.id, option.label)}
                className={`block w-full p-3 text-left cursor-pointer min-h-[44px] transition-colors duration-75 ${
                  isSelected
                    ? "border-[1.5px] border-navy text-navy"
                    : "border-[0.5px] border-border text-navy hover:bg-navy/[0.03]"
                }`}
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                {isSelected ? (
                  <>
                    <span className="text-accent">(</span>
                    {" "}{option.label}{" "}
                    <span className="text-accent">)</span>
                  </>
                ) : (
                  option.label
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.inputType === "mehrfachauswahl" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const isSelected = selectedValues.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  const next = isSelected
                    ? selectedValues.filter((v) => v !== option.id)
                    : [...selectedValues, option.id];
                  onChange(question.id, next);
                }}
                className={`block w-full p-3 text-left cursor-pointer min-h-[44px] transition-colors duration-75 ${
                  isSelected
                    ? "border-[1.5px] border-navy text-navy"
                    : "border-[0.5px] border-border text-navy hover:bg-navy/[0.03]"
                }`}
                style={{ fontFamily: "var(--font-body-serif)" }}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`inline-block w-4 h-4 border shrink-0 ${
                      isSelected ? "border-navy bg-navy" : "border-muted"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg viewBox="0 0 16 16" className="w-4 h-4 text-white">
                        <path
                          d="M3.5 8l3 3 6-6"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {isSelected ? (
                    <>
                      <span className="text-accent">(</span>
                      {" "}{option.label}{" "}
                      <span className="text-accent">)</span>
                    </>
                  ) : (
                    option.label
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
