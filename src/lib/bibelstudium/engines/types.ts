export interface EvaluationResult {
  match: boolean;
  score?: number;
  feedback?: string;
  matchedItems?: string[];
}

export interface Rule {
  field: string;
  operator: string;
  value: unknown;
}

export interface MatchOptions {
  caseSensitive?: boolean;
  minScore?: number;
}

export interface AnswerCard {
  id: string;
  label: string;
  criteria: Record<string, unknown>;
}

export interface RuleChecker {
  check(input: Record<string, unknown>, rules: Rule[]): EvaluationResult;
}

export interface ReferenceMatcher {
  match(
    freetext: string,
    references: string[],
    options?: MatchOptions,
  ): EvaluationResult;
}

export interface CardClassifier {
  classify(
    input: string,
    cards: AnswerCard[],
  ): EvaluationResult & { cardId?: string };
}
