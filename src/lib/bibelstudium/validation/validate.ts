import Ajv from "ajv";
import addFormats from "ajv-formats";
import fs from "node:fs";
import path from "node:path";

const SCHEMAS_DIR = path.join(
  process.cwd(),
  "content",
  "bibelstudium",
  "schemas",
);

export function createValidator() {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  // Load all schemas
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

export function validateAgainstSchema(
  ajv: Ajv,
  data: unknown,
  schemaId: string,
): { valid: boolean; errors: string[] } {
  const validate = ajv.getSchema(schemaId);
  if (!validate) {
    return { valid: false, errors: [`Schema "${schemaId}" not found`] };
  }

  const valid = validate(data);
  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors ?? []).map(
    (e) => `${e.instancePath || "/"}: ${e.message}`,
  );
  return { valid: false, errors };
}
