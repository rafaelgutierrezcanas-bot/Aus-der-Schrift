import { describe, it, expect } from "vitest";
import {
  listAllUnitDirs,
  loadUnitByDir,
  loadBibliography,
  getBibliographyEntry,
} from "@/lib/bibelstudium/content-loader";

describe("content-loader", () => {
  it("lists unit directories", () => {
    const dirs = listAllUnitDirs();
    expect(dirs).toContain("_beispiel-geruest");
  });

  it("loads a unit by directory name", () => {
    const unit = loadUnitByDir("_beispiel-geruest");
    expect(unit.meta.id).toBe("beispiel-geruest");
    expect(unit.meta.slug).toBe("beispiel-geruest");
    expect(unit.stations).toHaveLength(2);
  });

  it("loads stations in order defined by meta.json", () => {
    const unit = loadUnitByDir("_beispiel-geruest");
    expect(unit.stations[0].id).toBe("beispiel-station-a");
    expect(unit.stations[1].id).toBe("beispiel-station-b");
  });

  it("loads bibliography entries", () => {
    const entries = loadBibliography();
    expect(entries.length).toBeGreaterThan(0);
    expect(entries[0].id).toBe("placeholder-001");
  });

  it("gets a single bibliography entry by ID", () => {
    const entry = getBibliographyEntry("placeholder-001");
    expect(entry).toBeDefined();
    expect(entry!.type).toBe("buch");
  });

  it("returns undefined for non-existent bibliography entry", () => {
    const entry = getBibliographyEntry("non-existent");
    expect(entry).toBeUndefined();
  });
});
