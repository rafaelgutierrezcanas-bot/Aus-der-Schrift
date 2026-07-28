import { describe, it, expect } from "vitest";
import { formatCitation, formatShortCitation } from "@/lib/bibelstudium/citation-formatter";
import type { BibliographyEntry } from "@/lib/bibelstudium/types";

const fullEntry: BibliographyEntry = {
  id: "test-001",
  schemaVersion: "1.0",
  type: "buch",
  authors: ["Gordon D. Fee"],
  title: "The First Epistle to the Corinthians",
  year: 2014,
  publisher: "Eerdmans",
  place: "Grand Rapids",
  edition: "2. Aufl.",
};

describe("formatCitation", () => {
  it("formats a full citation with all fields", () => {
    const result = formatCitation(fullEntry, "195–197", "Hauptargument");
    expect(result).toBe(
      "Gordon D. Fee, *The First Epistle to the Corinthians*, 2. Aufl. (Grand Rapids: Eerdmans, 2014), S. 195–197 [Hauptargument]"
    );
  });

  it("handles missing optional fields (publisher, place, edition)", () => {
    const minimal: BibliographyEntry = {
      id: "test-002",
      schemaVersion: "1.0",
      type: "buch",
      authors: ["Hans Conzelmann"],
      title: "Der erste Brief an die Korinther",
      year: 1981,
    };
    const result = formatCitation(minimal, "112", "Gegenposition");
    expect(result).toBe(
      "Hans Conzelmann, *Der erste Brief an die Korinther* (1981), S. 112 [Gegenposition]"
    );
  });

  it("handles multiple authors", () => {
    const multi: BibliographyEntry = {
      ...fullEntry,
      authors: ["A. Author", "B. Writer"],
    };
    const result = formatCitation(multi, "10", "Kontext");
    expect(result).toContain("A. Author / B. Writer");
  });
});

describe("formatShortCitation", () => {
  it("formats a short citation", () => {
    const result = formatShortCitation(fullEntry, "200");
    expect(result).toBe("Gordon D. Fee, *The First Epistle to the Corinthians*, S. 200");
  });

  it("handles empty pages string", () => {
    const result = formatShortCitation(fullEntry, "");
    expect(result).toBe("Gordon D. Fee, *The First Epistle to the Corinthians*");
  });
});
