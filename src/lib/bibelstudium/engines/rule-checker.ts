import type { EvaluationResult, Rule, RuleChecker } from "./types";

export function createRuleChecker(): RuleChecker {
  return {
    check(
      _input: Record<string, unknown>,
      _rules: Rule[],
    ): EvaluationResult {
      throw new Error("TODO: implement");
    },
  };
}
