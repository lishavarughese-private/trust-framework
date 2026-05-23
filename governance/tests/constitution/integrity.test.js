"use strict";

/**
 * integrity.test.js
 * -----------------
 * Validates the structural integrity of every gate definition file in gates/.
 * Verifies:
 *   - Every gate JSON file is valid JSON
 *   - Every gate has all required fields
 *   - Gate IDs follow the naming convention
 *   - Severity is HARD or SOFT
 *   - HARD gates have a non-empty resolution_required array
 *   - Pass and fail condition arrays are non-empty
 *   - context_schema is declared
 *   - No duplicate gate IDs across files
 *
 * Usage:
 *   node governance/tests/constitution/integrity.test.js
 */

const fs     = require("fs");
const path   = require("path");
const assert = require("assert");

const GATES_DIR = path.resolve(__dirname, "../../gates");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try   { fn(); console.log("  \u2713", name); passed++; }
  catch (e) { console.error("  \u2717", name); console.error("    ", e.message); failed++; }
}

console.log("\n=== constitution/integrity.test.js ===\n");

test("gates/ directory exists", () => {
  assert.ok(fs.existsSync(GATES_DIR), "gates/ not found: " + GATES_DIR);
});

if (!fs.existsSync(GATES_DIR)) {
  console.log("\nResults:", passed, "passed,", failed, "failed\n");
  process.exit(1);
}

const gateFiles = fs.readdirSync(GATES_DIR).filter(f => f.endsWith(".json"));

test("at least one gate definition file exists in gates/", () => {
  assert.ok(gateFiles.length > 0, "No .json files found in gates/");
});

const seenIds   = new Set();
const parsedDefs = {};

// ── Per-file structural validation ───────────────────────────────────────────
gateFiles.forEach(filename => {
  const filePath = path.join(GATES_DIR, filename);
  let def;

  test(filename + " is valid JSON", () => {
    def = JSON.parse(fs.readFileSync(filePath, "utf8"));
    parsedDefs[filename] = def;
  });

  if (!def) return;

  test(filename + ": gate_id field present", () => {
    assert.ok(def.gate_id && typeof def.gate_id === "string",
      "gate_id missing or not a string");
  });

  test(filename + ": gate_id matches naming convention HG-XXX-NN", () => {
    assert.ok(
      /^(HG|SG)-[A-Z]+-\d{2}$/.test(def.gate_id),
      "gate_id '" + def.gate_id + "' does not match HG-XXX-NN or SG-XXX-NN"
    );
  });

  test(filename + ": gate_id matches filename", () => {
    const expectedFilename = def.gate_id + ".json";
    assert.strictEqual(filename, expectedFilename,
      "File is named '" + filename + "' but gate_id is '" + def.gate_id + "'");
  });

  test(filename + ": no duplicate gate_id", () => {
    assert.ok(!seenIds.has(def.gate_id),
      "Duplicate gate_id '" + def.gate_id + "' — already seen in another file");
    seenIds.add(def.gate_id);
  });

  test(filename + ": name field present and non-empty", () => {
    assert.ok(def.name && def.name.trim().length > 0, "name missing or empty");
  });

  test(filename + ": severity is HARD or SOFT", () => {
    assert.ok(
      def.severity === "HARD" || def.severity === "SOFT",
      "severity must be 'HARD' or 'SOFT', got: '" + def.severity + "'"
    );
  });

  test(filename + ": constitution_principle present", () => {
    assert.ok(def.constitution_principle &&
              typeof def.constitution_principle === "string",
      "constitution_principle missing or not a string");
  });

  test(filename + ": constitution_principle matches PRINCIPLE-NN format", () => {
    assert.ok(
      /^PRINCIPLE-\d{2}$/.test(def.constitution_principle),
      "constitution_principle '" + def.constitution_principle +
      "' does not match PRINCIPLE-NN format"
    );
  });

  test(filename + ": description is non-empty", () => {
    assert.ok(def.description && def.description.trim().length > 0,
      "description missing or empty");
  });

  test(filename + ": trigger object present with condition and rationale", () => {
    assert.ok(def.trigger && def.trigger.condition && def.trigger.rationale,
      "trigger must have condition and rationale fields");
  });

  test(filename + ": pass_conditions is non-empty array", () => {
    assert.ok(Array.isArray(def.pass_conditions) && def.pass_conditions.length > 0,
      "pass_conditions must be a non-empty array");
  });

  test(filename + ": fail_conditions is non-empty array", () => {
    assert.ok(Array.isArray(def.fail_conditions) && def.fail_conditions.length > 0,
      "fail_conditions must be a non-empty array");
  });

  test(filename + ": context_schema is present", () => {
    assert.ok(def.context_schema && typeof def.context_schema === "object",
      "context_schema missing or not an object");
  });

  if (def.severity === "HARD") {
    test(filename + " (HARD): resolution_required is non-empty array", () => {
      assert.ok(
        Array.isArray(def.resolution_required) && def.resolution_required.length > 0,
        "HARD gate must have a non-empty resolution_required array"
      );
    });
  }

  test(filename + ": examples.pass is a non-empty array", () => {
    assert.ok(
      def.examples && Array.isArray(def.examples.pass) && def.examples.pass.length > 0,
      "examples.pass must be a non-empty array"
    );
  });

  test(filename + ": examples.fail is a non-empty array", () => {
    assert.ok(
      def.examples && Array.isArray(def.examples.fail) && def.examples.fail.length > 0,
      "examples.fail must be a non-empty array"
    );
  });
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\nResults:", passed, "passed,", failed, "failed\n");
if (failed > 0) process.exit(1);
