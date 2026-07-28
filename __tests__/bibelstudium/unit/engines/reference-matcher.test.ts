import { describe, it, expect } from "vitest";
import { createReferenceMatcher } from "@/lib/bibelstudium/engines/reference-matcher";

describe("reference-matcher", () => {
  it("creates a reference matcher instance", () => {
    const matcher = createReferenceMatcher();
    expect(matcher).toBeDefined();
    expect(typeof matcher.match).toBe("function");
  });

  it("throws TODO error when called", () => {
    const matcher = createReferenceMatcher();
    expect(() => matcher.match("test", ["ref"])).toThrow("TODO: implement");
  });
});
