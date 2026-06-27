// ── Types ─────────────────────────────────────────────

export interface HermeneutikStep {
  _id: string;
  titleDe: string;
  titleEn: string;
  slug: string;
  order: number;
  accentColor: string;
  icon: string;
  explanationDe: any[];
  explanationEn: any[];
  guidingQuestionsDe: string[];
  guidingQuestionsEn: string[];
  commonMistakesDe: string[];
  commonMistakesEn: string[];
  interactionType: "freetext" | "marking" | "multiplechoice";
  sources: string[];
}

export interface StepAnalysis {
  step: HermeneutikStep;
  expertAnalysisDe: any[];
  expertAnalysisEn: any[];
  hintsDe: string[];
  hintsEn: string[];
  interactionData: string | null;
}

export interface HermeneutikTextSummary {
  _id: string;
  titleDe: string;
  titleEn: string;
  slug: string;
  bibleReference: string;
  genre: string;
  difficulty: string;
  order: number;
}

export interface HermeneutikTextFull extends HermeneutikTextSummary {
  textContentDe: any[];
  textContentEn: any[];
  backgroundInfoDe: any[];
  backgroundInfoEn: any[];
  stepAnalyses: StepAnalysis[];
}

// ── User Progress (localStorage) ─────────────────────

export interface UserStepEntry {
  content: string;
  markedWords?: string[];
  selectedOption?: string;
  completedAt: string | null;
}

export interface UserAnalysis {
  textSlug: string;
  startedAt: string;
  completedAt: string | null;
  currentStep: number;
  steps: Record<string, UserStepEntry>;
}

export interface HermeneutikProgress {
  analyses: Record<string, UserAnalysis>;
}

const STORAGE_KEY = "theologik-hermeneutik-progress";

export function loadProgress(): HermeneutikProgress {
  if (typeof window === "undefined") return { analyses: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { analyses: {} };
  } catch {
    return { analyses: {} };
  }
}

export function saveProgress(progress: HermeneutikProgress): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

// ── Localized field helpers ──────────────────────────

export function loc<T>(obj: any, field: string, locale: string): T {
  const key = `${field}${locale === "en" ? "En" : "De"}`;
  return obj?.[key] as T;
}

// ── Step accent colors (fallback if Sanity data missing) ──

export const STEP_COLORS: Record<number, string> = {
  1: "#F59E0B", // Amber — Beobachtung
  2: "#3B82F6", // Blue — Historischer Kontext
  3: "#10B981", // Emerald — Literarische Analyse
  4: "#8B5CF6", // Violet — Wortanalyse
  5: "#F97316", // Orange — Theologische Synthese
  6: "#EC4899", // Pink — Kontextualisierung
};
