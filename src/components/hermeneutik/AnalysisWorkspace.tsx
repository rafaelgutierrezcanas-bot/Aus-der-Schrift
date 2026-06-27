"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { HermeneutikTextFull, UserAnalysis, UserStepEntry } from "@/lib/hermeneutik";
import { loc, STEP_COLORS, loadProgress, saveProgress } from "@/lib/hermeneutik";
import { BibleTextPanel } from "./BibleTextPanel";
import { StepPanel } from "./StepPanel";
import { StepProgressBar } from "./StepProgressBar";

interface Props {
  text: HermeneutikTextFull;
  locale: string;
}

function emptyEntry(): UserStepEntry {
  return { content: "", markedWords: [], selectedOption: undefined, completedAt: null };
}

export function AnalysisWorkspace({ text, locale }: Props) {
  const t = useTranslations("hermeneutik");
  const steps = text.stepAnalyses;

  const [currentStep, setCurrentStep] = useState(0);
  const [analysis, setAnalysis] = useState<UserAnalysis>(() => ({
    textSlug: text.slug,
    startedAt: new Date().toISOString(),
    completedAt: null,
    currentStep: 1,
    steps: {},
  }));
  const [isComplete, setIsComplete] = useState(false);

  // Load saved progress on mount
  useEffect(() => {
    const progress = loadProgress();
    const saved = progress.analyses[text.slug];
    if (saved) {
      setAnalysis(saved);
      setCurrentStep(Math.max(0, (saved.currentStep || 1) - 1));
      setIsComplete(!!saved.completedAt);
    }
  }, [text.slug]);

  // Save progress on change
  const persist = useCallback(
    (updated: UserAnalysis) => {
      const progress = loadProgress();
      progress.analyses[text.slug] = updated;
      saveProgress(progress);
    },
    [text.slug]
  );

  const currentStepData = steps[currentStep];
  if (!currentStepData) return null;

  const stepSlug = currentStepData.step.slug;
  const userEntry = analysis.steps[stepSlug] || emptyEntry();

  const completedSteps = new Set(
    Object.entries(analysis.steps)
      .filter(([, entry]) => entry.completedAt)
      .map(([slug]) => slug)
  );

  function updateEntry(partial: Partial<UserStepEntry>) {
    const updated = {
      ...analysis,
      steps: {
        ...analysis.steps,
        [stepSlug]: { ...userEntry, ...partial },
      },
    };
    setAnalysis(updated);
    persist(updated);
  }

  function completeStep() {
    const now = new Date().toISOString();
    const isLast = currentStep === steps.length - 1;

    const updatedEntry = { ...userEntry, completedAt: now };
    const updated: UserAnalysis = {
      ...analysis,
      currentStep: isLast ? steps.length : currentStep + 2,
      completedAt: isLast ? now : null,
      steps: {
        ...analysis.steps,
        [stepSlug]: updatedEntry,
      },
    };

    setAnalysis(updated);
    persist(updated);

    if (isLast) {
      setIsComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }

  function goBack() {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  }

  const accentColor =
    currentStepData.step.accentColor || STEP_COLORS[currentStepData.step.order];

  // Completion screen
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--color-accent)" }}
        >
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-serif)" }}>
          {t("analysisComplete")}
        </h2>
        <p className="mb-8" style={{ color: "var(--color-muted)" }}>
          {t("analysisCompleteDesc")}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/${locale}/ressourcen/hermeneutik/fortschritt`}
            className="px-5 py-2.5 rounded-lg text-sm border transition-colors"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}
          >
            {t("viewInArchive")}
          </Link>
          <Link
            href={`/${locale}/ressourcen/hermeneutik/werkbank`}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: "var(--color-accent)" }}
          >
            {t("startNew")}
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/ressourcen/hermeneutik/werkbank`}
            className="text-sm transition-colors"
            style={{ color: "var(--color-muted)" }}
          >
            ← {t("back")}
          </Link>
          <h1 className="text-lg font-semibold" style={{ fontFamily: "var(--font-serif)" }}>
            {loc<string>(text, "title", locale)}
          </h1>
        </div>
        <StepProgressBar
          steps={steps}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={setCurrentStep}
        />
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: "60vh" }}>
        {/* Left: Bible text */}
        <BibleTextPanel
          content={loc<any[]>(text, "textContent", locale) || []}
          markedWords={userEntry.markedWords || []}
          accentColor={accentColor}
        />

        {/* Right: Step workspace */}
        <div
          className="rounded-2xl border p-6 overflow-y-auto"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-surface)",
          }}
        >
          <AnimatePresence mode="wait">
            <StepPanel
              key={stepSlug}
              stepAnalysis={currentStepData}
              locale={locale}
              userEntry={userEntry}
              onUpdate={updateEntry}
              onComplete={completeStep}
              isLast={currentStep === steps.length - 1}
              onBack={goBack}
              isFirst={currentStep === 0}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Method help */}
      <div className="mt-4 text-center">
        <Link
          href={`/${locale}/ressourcen/hermeneutik/methode#${currentStepData.step.slug}`}
          className="inline-flex items-center gap-1 text-sm transition-colors hover:underline"
          style={{ color: accentColor }}
        >
          {t("methodHelp")}
        </Link>
      </div>
    </div>
  );
}
