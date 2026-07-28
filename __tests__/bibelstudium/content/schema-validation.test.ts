import { describe, it, expect, beforeAll } from "vitest";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "content", "bibelstudium");
const SCHEMAS_DIR = path.join(CONTENT_ROOT, "schemas");

let ajv: Ajv;

beforeAll(() => {
  ajv = new Ajv({ allErrors: true, strict: false });
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
});

describe("schema validation: example unit", () => {
  const unitDir = path.join(CONTENT_ROOT, "einheiten", "_beispiel-geruest");

  it("meta.json is valid against unit schema", () => {
    const meta = JSON.parse(
      fs.readFileSync(path.join(unitDir, "meta.json"), "utf-8"),
    );
    const validate = ajv.getSchema("unit.schema.json")!;
    const valid = validate(meta);
    if (!valid) {
      console.error(validate.errors);
    }
    expect(valid).toBe(true);
  });

  it("station files are valid against station schema", () => {
    const meta = JSON.parse(
      fs.readFileSync(path.join(unitDir, "meta.json"), "utf-8"),
    );

    for (const stationFile of meta.stations) {
      const station = JSON.parse(
        fs.readFileSync(path.join(unitDir, stationFile), "utf-8"),
      );
      const validate = ajv.getSchema("station.schema.json")!;
      const valid = validate(station);
      if (!valid) {
        console.error(`${stationFile}:`, validate.errors);
      }
      expect(valid).toBe(true);
    }
  });

  it("all station files referenced in meta.json exist", () => {
    const meta = JSON.parse(
      fs.readFileSync(path.join(unitDir, "meta.json"), "utf-8"),
    );

    for (const stationFile of meta.stations) {
      expect(
        fs.existsSync(path.join(unitDir, stationFile)),
      ).toBe(true);
    }
  });
});

describe("schema validation: bibliography", () => {
  it("bibliographie.json entries are valid", () => {
    const bibPath = path.join(CONTENT_ROOT, "bibliographie.json");
    const data = JSON.parse(fs.readFileSync(bibPath, "utf-8"));
    const validate = ajv.getSchema("bibliography-entry.schema.json")!;

    for (const entry of data.entries) {
      const valid = validate(entry);
      if (!valid) {
        console.error(`Entry ${entry.id}:`, validate.errors);
      }
      expect(valid).toBe(true);
    }
  });

  it("all citation sourceIds reference existing bibliography entries", () => {
    const bibPath = path.join(CONTENT_ROOT, "bibliographie.json");
    const data = JSON.parse(fs.readFileSync(bibPath, "utf-8"));
    const bibIds = new Set(data.entries.map((e: { id: string }) => e.id));

    const unitDir = path.join(CONTENT_ROOT, "einheiten", "_beispiel-geruest");
    const meta = JSON.parse(
      fs.readFileSync(path.join(unitDir, "meta.json"), "utf-8"),
    );

    for (const stationFile of meta.stations) {
      const station = JSON.parse(
        fs.readFileSync(path.join(unitDir, stationFile), "utf-8"),
      );
      for (const citation of station.citations ?? []) {
        expect(bibIds.has(citation.sourceId)).toBe(true);
      }
    }
  });
});
