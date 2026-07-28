import fs from "node:fs";
import path from "node:path";
import type {
  UnitMeta,
  Station,
  Unit,
  BibliographyEntry,
} from "./types";

const CONTENT_ROOT = path.join(process.cwd(), "content", "bibelstudium");

function readJson<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

/** List all unit directories (excluding those starting with _) */
export function listUnitSlugs(): string[] {
  const einheitenDir = path.join(CONTENT_ROOT, "einheiten");
  if (!fs.existsSync(einheitenDir)) return [];

  return fs
    .readdirSync(einheitenDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => {
      const meta = readJson<UnitMeta>(
        path.join(einheitenDir, d.name, "meta.json"),
      );
      return meta.slug;
    });
}

/** List all unit directories including internal ones (starting with _) */
export function listAllUnitDirs(): string[] {
  const einheitenDir = path.join(CONTENT_ROOT, "einheiten");
  if (!fs.existsSync(einheitenDir)) return [];

  return fs
    .readdirSync(einheitenDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

/** Load a unit by its directory name */
export function loadUnitByDir(dirName: string): Unit {
  const unitDir = path.join(CONTENT_ROOT, "einheiten", dirName);
  const meta = readJson<UnitMeta>(path.join(unitDir, "meta.json"));

  const stations = meta.stations.map((filename) =>
    readJson<Station>(path.join(unitDir, filename)),
  );

  return { meta, stations };
}

/** Load a unit by its slug */
export function loadUnitBySlug(slug: string): Unit | null {
  const einheitenDir = path.join(CONTENT_ROOT, "einheiten");
  if (!fs.existsSync(einheitenDir)) return null;

  const dirs = fs
    .readdirSync(einheitenDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const dir of dirs) {
    const metaPath = path.join(einheitenDir, dir.name, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    const meta = readJson<UnitMeta>(metaPath);
    if (meta.slug === slug) {
      return loadUnitByDir(dir.name);
    }
  }

  return null;
}

/** Load all published units (non-underscore directories) */
export function loadAllUnits(): Unit[] {
  const einheitenDir = path.join(CONTENT_ROOT, "einheiten");
  if (!fs.existsSync(einheitenDir)) return [];

  return fs
    .readdirSync(einheitenDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => loadUnitByDir(d.name));
}

/** Load the bibliography */
export function loadBibliography(): BibliographyEntry[] {
  const filePath = path.join(CONTENT_ROOT, "bibliographie.json");
  if (!fs.existsSync(filePath)) return [];

  const data = readJson<{ schemaVersion: string; entries: BibliographyEntry[] }>(filePath);
  return data.entries;
}

/** Get a single bibliography entry by ID */
export function getBibliographyEntry(
  id: string,
): BibliographyEntry | undefined {
  return loadBibliography().find((entry) => entry.id === id);
}
