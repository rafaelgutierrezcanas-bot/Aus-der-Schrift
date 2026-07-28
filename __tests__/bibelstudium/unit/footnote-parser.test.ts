import { describe, it, expect } from "vitest";
import { parseFootnotes } from "@/lib/bibelstudium/footnote-parser";

describe("parseFootnotes", () => {
  it("parses a single [[1]] marker", () => {
    const result = parseFootnotes("Text vor[[1]]Text nach");
    expect(result).toEqual([
      { type: "text", value: "Text vor" },
      { type: "footnote", number: 1 },
      { type: "text", value: "Text nach" },
    ]);
  });

  it("parses multiple footnotes in one string", () => {
    const result = parseFootnotes("A[[1]]B[[2]]C[[10]]D");
    expect(result).toEqual([
      { type: "text", value: "A" },
      { type: "footnote", number: 1 },
      { type: "text", value: "B" },
      { type: "footnote", number: 2 },
      { type: "text", value: "C" },
      { type: "footnote", number: 10 },
      { type: "text", value: "D" },
    ]);
  });

  it("returns plain text as a single segment when no markers present", () => {
    const result = parseFootnotes("Einfacher Text ohne Marker");
    expect(result).toEqual([
      { type: "text", value: "Einfacher Text ohne Marker" },
    ]);
  });

  it("ignores invalid markers like [[abc]]", () => {
    const result = parseFootnotes("Text[[abc]]mehr");
    expect(result).toEqual([
      { type: "text", value: "Text[[abc]]mehr" },
    ]);
  });

  it("handles footnote at the start of a string", () => {
    const result = parseFootnotes("[[1]]Text");
    expect(result).toEqual([
      { type: "footnote", number: 1 },
      { type: "text", value: "Text" },
    ]);
  });

  it("handles footnote at the end of a string", () => {
    const result = parseFootnotes("Text[[3]]");
    expect(result).toEqual([
      { type: "text", value: "Text" },
      { type: "footnote", number: 3 },
    ]);
  });

  it("returns empty array for empty string", () => {
    const result = parseFootnotes("");
    expect(result).toEqual([]);
  });
});
