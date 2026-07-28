import type {
  EvaluationResult,
  MatchOptions,
  ReferenceMatcher,
} from "./types";

export function createReferenceMatcher(): ReferenceMatcher {
  return {
    match(
      _freetext: string,
      _references: string[],
      _options?: MatchOptions,
    ): EvaluationResult {
      throw new Error("TODO: implement");
    },
  };
}
