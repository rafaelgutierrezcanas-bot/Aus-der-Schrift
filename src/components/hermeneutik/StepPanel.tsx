"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import type { StepAnalysis, UserStepEntry } from "@/lib/hermeneutik";
import { loc, STEP_COLORS } from "@/lib/hermeneutik";
import { ExpertComparison } from "./ExpertComparison";

interface Props {
  stepAnalysis: StepAnalysis;
  locale: string;
  userEntry: UserStepEntry;
  onUpdate: (entry: Partial<UserStepEntry>) => void;
  onComplete: () => void;
  isLast: boolean;
  onBack: () => void;
  isFirst: boolean;
}

export function StepPanel({
  stepAnalysis,
  locale,
  userEntry,
  onUpdate,
  onComplete,
  isLast,
  onBack,
  isFirst,
}: Props) {
  const t = useTranslations("hermeneutik");
  const [showHints, setShowHints] = useState(false);
  const [showExpert, setShowExpert] = useState(false);
  const step = stepAnalysis.step;
  const color = step.accentColor || STEP_COLORS[step.order];
  const questions = loc<string[]>(step, "guidingQuestions", locale) || [];
  const hints = loc<string[]>(stepAnalysis, "hints", locale) || [];
  const hasExpert =
    (loc<any[]>(stepAnalysis, "expertAnalysis", locale) || []).length > 0;

  return (
    <motion.div
      key={step._id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full"
    >
      {/* Step header */}
      <div className="flex items-center gap-3 mb-6">
        <span
          className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white"
          style={{ background: color }}
        >
          {step.order}
        </span>
        <h2 className="text-xl font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
          {loc<string>(step, "title", locale)}
        </h2>
      </div>

      {/* Guiding questions */}
      {questions.length > 0 && (
        <div className="mb-4 space-y-1">
          {questions.map((q, i) => (
            <p key={i} className="text-sm" style={{ color: "var(--color-muted)" }}>
              <span style={{ color }}>?</span> {q}
            </p>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex-1 mb-4">
        {step.interactionType === "multiplechoice" && stepAnalysis.interactionData ? (
          <MultipleChoiceInput
            data={stepAnalysis.interactionData}
            value={userEntry.selectedOption || ""}
            onChange={(val) => onUpdate({ selectedOption: val })}
            color={color}
          />
        ) : (
          <textarea
            value={userEntry.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            placeholder={
              locale === "de"
                ? "Schreibe hier deine Analyse..."
                : "Write your analysis here..."
            }
            className="w-full h-full min-h-[200px] rounded-xl border p-4 text-sm resize-none focus:outline-none transition-colors"
            style={{
              borderColor: "var(--color-border)",
              background: "var(--color-background)",
              color: "var(--color-foreground)",
              fontFamily: "var(--font-body-serif)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = color;
              e.target.style.boxShadow = `0 0 0 1px ${color}40`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        )}
      </div>

      {/* Hints */}
      {hints.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowHints(!showHints)}
            className="text-sm font-medium transition-colors"
            style={{ color }}
          >
            {showHints ? "▾" : "▸"} {t("hints")} ({hints.length})
          </button>
          <AnimatePresence>
            {showHints && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2 space-y-1 overflow-hidden"
              >
                {hints.map((h, i) => (
                  <li key={i} className="text-sm pl-4" style={{ color: "var(--color-muted)" }}>
                    {h}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Expert comparison */}
      {hasExpert && userEntry.content.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowExpert(!showExpert)}
            className="text-sm font-medium transition-colors"
            style={{ color }}
          >
            {showExpert ? t("hideExpertAnalysis") : t("showExpertAnalysis")}
          </button>
          <AnimatePresence>
            {showExpert && (
              <ExpertComparison
                expertAnalysis={loc<any[]>(stepAnalysis, "expertAnalysis", locale) || []}
                color={color}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t" style={{ borderColor: "var(--color-border)" }}>
        <button
          onClick={onBack}
          disabled={isFirst}
          className="px-4 py-2 rounded-lg text-sm transition-opacity disabled:opacity-30"
          style={{ color: "var(--color-muted)" }}
        >
          ← {t("back")}
        </button>
        <button
          onClick={onComplete}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-transform hover:scale-105"
          style={{ background: color }}
        >
          {isLast ? t("finish") : t("next")} →
        </button>
      </div>
    </motion.div>
  );
}

function MultipleChoiceInput({
  data,
  value,
  onChange,
  color,
}: {
  data: string;
  value: string;
  onChange: (val: string) => void;
  color: string;
}) {
  let options: { label: string; value: string }[] = [];
  try {
    const parsed = JSON.parse(data);
    options = parsed.options || [];
  } catch {
    return null;
  }

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="w-full text-left rounded-xl border p-4 text-sm transition-all"
          style={{
            borderColor: value === opt.value ? color : "var(--color-border)",
            background: value === opt.value ? `${color}15` : "var(--color-background)",
            color: "var(--color-foreground)",
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
