import type {
  AnswerCard,
  CardClassifier,
  EvaluationResult,
} from "./types";

export function createCardClassifier(): CardClassifier {
  return {
    classify(
      _input: string,
      _cards: AnswerCard[],
    ): EvaluationResult & { cardId?: string } {
      throw new Error("TODO: implement");
    },
  };
}
