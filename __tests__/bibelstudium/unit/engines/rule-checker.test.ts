import { describe, it, expect } from "vitest";
import { createRuleChecker } from "@/lib/bibelstudium/engines/rule-checker";

describe("rule-checker", () => {
  it("creates a rule checker instance", () => {
    const checker = createRuleChecker();
    expect(checker).toBeDefined();
    expect(typeof checker.check).toBe("function");
  });

  it("throws TODO error when called", () => {
    const checker = createRuleChecker();
    expect(() => checker.check({}, [])).toThrow("TODO: implement");
  });
});
