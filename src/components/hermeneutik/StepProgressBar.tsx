"use client";

import { motion } from "framer-motion";
import type { StepAnalysis } from "@/lib/hermeneutik";
import { STEP_COLORS } from "@/lib/hermeneutik";

interface Props {
  steps: StepAnalysis[];
  currentStep: number;
  completedSteps: Set<string>;
  onStepClick: (index: number) => void;
}

export function StepProgressBar({ steps, currentStep, completedSteps, onStepClick }: Props) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((sa, i) => {
        const color = sa.step.accentColor || STEP_COLORS[sa.step.order];
        const isActive = i === currentStep;
        const isCompleted = completedSteps.has(sa.step.slug);

        return (
          <button
            key={sa.step._id}
            onClick={() => onStepClick(i)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110"
            style={{
              background: isCompleted ? color : isActive ? `${color}33` : "var(--color-surface)",
              border: `2px solid ${isActive || isCompleted ? color : "var(--color-border)"}`,
            }}
            title={sa.step.titleDe}
          >
            {isCompleted ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className="text-xs font-bold" style={{ color: isActive ? color : "var(--color-muted)" }}>
                {sa.step.order}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId="activeStep"
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: `0 0 12px ${color}40` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
