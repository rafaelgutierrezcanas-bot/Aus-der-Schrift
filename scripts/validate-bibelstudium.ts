import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const CONTENT_ROOT = path.join(process.cwd(), "content", "bibelstudium");
const SCHEMAS_DIR = path.join(CONTENT_ROOT, "schemas");

interface ValidationIssue {
  level: "error" | "warning";
  file: string;
  message: string;
}

const issues: ValidationIssue[] = [];

function addError(file: string, message: string) {
  issues.push({ level: "error", file, message });
}

function addWarning(file: string, message: string) {
  issues.push({ level: "warning", file, message });
}

function readJson(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function relativePath(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

// --- CLI args ---

const args = process.argv.slice(2);
const MODE = args.includes("--report")
  ? "report"
  : args.includes("--publish")
    ? "publish"
    : "default";

// --- Setup AJV ---

function createAjv(): Ajv {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const schemaFiles = fs
    .readdirSync(SCHEMAS_DIR)
    .filter((f) => f.endsWith(".schema.json"));

  for (const file of schemaFiles) {
    const schema = JSON.parse(
      fs.readFileSync(path.join(SCHEMAS_DIR, file), "utf-8"),
    );
    ajv.addSchema(schema, file);
  }

  return ajv;
}

function validateFile(
  ajv: Ajv,
  filePath: string,
  schemaId: string,
  data: unknown,
): boolean {
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    addError(relativePath(filePath), `Schema "${schemaId}" not found`);
    return false;
  }

  const valid = validate(data);
  if (!valid) {
    for (const err of validate.errors ?? []) {
      addError(
        relativePath(filePath),
        `${err.instancePath || "/"}: ${err.message}`,
      );
    }
    return false;
  }
  return true;
}

// --- Load bibliography IDs ---

function loadBibliographyIds(): Set<string> {
  const bibPath = path.join(CONTENT_ROOT, "bibliographie.json");
  if (!fs.existsSync(bibPath)) {
    addWarning("bibliographie.json", "Bibliographie-Datei nicht gefunden");
    return new Set();
  }

  const data = readJson(bibPath) as {
    entries: Array<{ id: string }>;
  };

  // Validate each entry
  const ajv = createAjv();
  for (const entry of data.entries ?? []) {
    validateFile(
      ajv,
      bibPath,
      "bibliography-entry.schema.json",
      entry,
    );
  }

  return new Set((data.entries ?? []).map((e) => e.id));
}

// --- Check citations ---

function checkCitations(
  filePath: string,
  citations: Array<{ sourceId: string }>,
  bibIds: Set<string>,
): { todoCount: number } {
  let todoCount = 0;

  if (citations.length === 0) {
    addWarning(relativePath(filePath), "Leeres citations-Array");
  }

  for (const c of citations) {
    if (c.sourceId === "TODO") {
      todoCount++;
      addWarning(
        relativePath(filePath),
        `sourceId "TODO" — Beleg noch offen`,
      );
    } else if (!bibIds.has(c.sourceId)) {
      addError(
        relativePath(filePath),
        `sourceId "${c.sourceId}" nicht in Bibliographie gefunden`,
      );
    }
  }

  return { todoCount };
}

// --- Report data ---

interface StationReport {
  filename: string;
  status: string;
  todoCount: number;
  noCitations: boolean;
}

interface UnitReport {
  dirName: string;
  stations: StationReport[];
}

const unitReports: UnitReport[] = [];

// --- Validate units ---

function validateUnits(ajv: Ajv, bibIds: Set<string>) {
  const einheitenDir = path.join(CONTENT_ROOT, "einheiten");
  if (!fs.existsSync(einheitenDir)) return;

  const dirs = fs
    .readdirSync(einheitenDir, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const dir of dirs) {
    const unitDir = path.join(einheitenDir, dir.name);
    const metaPath = path.join(unitDir, "meta.json");

    if (!fs.existsSync(metaPath)) {
      addError(
        relativePath(unitDir),
        "meta.json fehlt im Einheiten-Ordner",
      );
      continue;
    }

    const meta = readJson(metaPath) as {
      stations: string[];
      citations: Array<{ sourceId: string }>;
    };

    // 1. Schema validation
    validateFile(ajv, metaPath, "unit.schema.json", meta);

    // 2. Check citations
    checkCitations(metaPath, meta.citations ?? [], bibIds);

    // 3. Check station file references
    const stationFiles = new Set<string>();
    const stationReports: StationReport[] = [];

    for (const stationFile of meta.stations ?? []) {
      const stationPath = path.join(unitDir, stationFile);
      stationFiles.add(stationFile);

      if (!fs.existsSync(stationPath)) {
        addError(
          relativePath(metaPath),
          `Station "${stationFile}" referenziert, aber Datei existiert nicht`,
        );
        continue;
      }

      const station = readJson(stationPath) as {
        status?: string;
        citations: Array<{ sourceId: string }>;
      };
      validateFile(ajv, stationPath, "station.schema.json", station);
      const { todoCount } = checkCitations(stationPath, station.citations ?? [], bibIds);

      stationReports.push({
        filename: stationFile,
        status: station.status ?? "—",
        todoCount,
        noCitations: (station.citations ?? []).length === 0,
      });
    }

    unitReports.push({ dirName: dir.name, stations: stationReports });

    // 4. Check for orphaned files
    const allFiles = fs
      .readdirSync(unitDir)
      .filter((f) => f.endsWith(".json") && f !== "meta.json");

    for (const file of allFiles) {
      if (!stationFiles.has(file)) {
        addWarning(
          relativePath(path.join(unitDir, file)),
          "Verwaiste Datei: nicht in meta.json referenziert",
        );
      }
    }
  }
}

// --- Report output ---

function printReport() {
  console.log("\n=== Statusbericht ===\n");

  for (const unit of unitReports) {
    console.log(`Einheit: ${unit.dirName}`);

    // Header
    const colStation = "Station".padEnd(30);
    const colStatus = "Status".padEnd(10);
    const colTodo = "TODO-Belege".padEnd(13);
    const colNoCit = "Ohne Beleg";
    console.log(`  ${colStation} | ${colStatus} | ${colTodo} | ${colNoCit}`);
    console.log(`  ${"—".repeat(30)} | ${"—".repeat(10)} | ${"—".repeat(13)} | ${"—".repeat(10)}`);

    for (const s of unit.stations) {
      const name = s.filename.replace(".json", "").padEnd(30);
      const status = s.status.padEnd(10);
      const todo = String(s.todoCount).padEnd(13);
      const noCit = s.noCitations ? "ja" : "—";
      console.log(`  ${name} | ${status} | ${todo} | ${noCit}`);
    }
    console.log();
  }
}

// --- Publish check ---

function checkPublishReady(): boolean {
  let ready = true;

  for (const unit of unitReports) {
    for (const s of unit.stations) {
      if (s.status !== "reviewed") {
        addError(
          `${unit.dirName}/${s.filename}`,
          `Status "${s.status}" — muss "reviewed" sein für Veröffentlichung`,
        );
        ready = false;
      }
      if (s.todoCount > 0) {
        addError(
          `${unit.dirName}/${s.filename}`,
          `${s.todoCount} TODO-Beleg(e) — müssen aufgelöst sein für Veröffentlichung`,
        );
        ready = false;
      }
    }
  }

  return ready;
}

// --- Main ---

function main() {
  console.log("Validiere Bibelstudium-Content...\n");

  const ajv = createAjv();
  const bibIds = loadBibliographyIds();

  console.log(`Bibliographie: ${bibIds.size} Einträge geladen`);

  validateUnits(ajv, bibIds);

  if (MODE === "report") {
    printReport();
  }

  if (MODE === "publish") {
    checkPublishReady();
  }

  // Print results
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");

  if (warnings.length > 0) {
    console.log(`\n⚠ ${warnings.length} Warnung(en):`);
    for (const w of warnings) {
      console.log(`  ${w.file}: ${w.message}`);
    }
  }

  if (errors.length > 0) {
    console.log(`\n✗ ${errors.length} Fehler:`);
    for (const e of errors) {
      console.log(`  ${e.file}: ${e.message}`);
    }
    process.exit(1);
  }

  console.log(
    `\n✓ Validierung erfolgreich (${warnings.length} Warnung(en))`,
  );
}

main();
