import { describe, it, expect } from "vitest";
import { createCardClassifier } from "@/lib/bibelstudium/engines/card-classifier";

describe("card-classifier", () => {
  it("creates a card classifier instance", () => {
    const classifier = createCardClassifier();
    expect(classifier).toBeDefined();
    expect(typeof classifier.classify).toBe("function");
  });

  it("throws TODO error when called", () => {
    const classifier = createCardClassifier();
    expect(() =>
      classifier.classify("test", [{ id: "1", label: "A", criteria: {} }]),
    ).toThrow("TODO: implement");
  });
});
