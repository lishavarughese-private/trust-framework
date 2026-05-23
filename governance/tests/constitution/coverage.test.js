"use strict";

/**
 * coverage.test.js
 * ----------------
 * Verifies that:
 *   1. Every principle declared in CONSTITUTION.md has either a gate ID or an
 *      explicit enforcement note in the Principle–Gate Coverage Map table.
 *   2. Every gate defined in gates/*.json maps back to a principle declared in
 *      CONSTITUTION.md — no orphaned gates.
 *   3. Every gate referenced in CONSTITUTION.md exists as a file in gates/.
 *
 * Usage (via run-metrics-tests.js or directly):
 *   node governance/tests/constitution/coverage.test.js
 */

const fs     = require("fs");
const path   = require("path");
const assert = require("assert");

const ROOT        = path.resolve(__dirname, "../..");
const CONST_PATH  = path.join(ROOT, "CONSTITUTION.md");
const GATES_DIR   = path.join(ROOT, "gates");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try   { fn(); console.log("  \u2713", name); passed++; }
  catch (e) { console.error("  \u2717", name); console.error("    ", e.message); failed++; }
}

console.log("\n=== constitution/coverage.test.js ===\n");

// ── Load CONSTITUTION.md ──────────────────────────────────────────────────────
test("CONSTITUTION.md exists", () => {
  assert.ok(fs.existsSync(CONST_PATH), "CONSTITUTION.md not found at " + CONST_PATH);
});

const constitutionText = fs.existsSync(CONST_PATH)
  ? fs.readFileSync(CONST_PATH, "utf8")
  : "";

// ── Load gate definition files ────────────────────────────────────────────────
test("gates/ directory exists", () => {
  assert.ok(fs.existsSync(GATES_DIR), "gates/ directory not found at " + GATES_DIR);
});

const gateFiles = fs.existsSync(GATES_DIR)
  ? fs.readdirSync(GATES_DIR).filter(f => f.endsWith(".json"))
  : [];

test("at least one gate definition file exists", () => {
  assert.ok(gateFiles.length > 0, "No .json files found in gates/");
});

// Parse gate definitions
const gateDefs = {};
gateFiles.forEach(f => {
  try {
    const def = JSON.parse(fs.readFileSync(path.join(GATES_DIR, f), "utf8"));
    gateDefs[def.gate_id] = def;
  } catch(e) { /* parse errors caught separately */ }
});

// ── Extract principle IDs from CONSTITUTION.md ───────────────────────────────
// Matches "### PRINCIPLE-NN" headings
const principleMatches = constitutionText.match(/###\s+(PRINCIPLE-\d+)/g) || [];
const declaredPrinciples = principleMatches.map(m => m.replace(/###\s+/, "").trim());

test("CONSTITUTION.md declares at least one principle", () => {
  assert.ok(declaredPrinciples.length > 0, "No PRINCIPLE-NN headings found");
});

// ── Extract the coverage map table ───────────────────────────────────────────
// Find lines like: | PRINCIPLE-03 | ... | HG-SPEC-01 |
const coverageRows = constitutionText
  .split("\n")
  .filter(l => l.includes("PRINCIPLE-") && l.startsWith("|"));

test("Coverage map table is present (at least one row)", () => {
  assert.ok(coverageRows.length > 0,
    "No coverage map table rows found in CONSTITUTION.md");
});

// Build a map: principle → coverage entry
const coverageMap = {};
coverageRows.forEach(row => {
  const cells = row.split("|").map(c => c.trim()).filter(Boolean);
  if (cells.length >= 2) {
    coverageMap[cells[0]] = cells[cells.length - 1];
  }
});

// ── Test: every declared principle has a coverage map entry ──────────────────
declaredPrinciples.forEach(pid => {
  test(pid + " has an entry in the coverage map", () => {
    assert.ok(
      coverageMap[pid] !== undefined,
      pid + " is declared as a heading but missing from the coverage map table"
    );
  });

  test(pid + " coverage entry is non-empty", () => {
    const entry = coverageMap[pid] || "";
    assert.ok(entry.length > 0, pid + " has an empty coverage map entry");
  });
});

// ── Test: every gate in gates/ maps to a constitution principle ───────────────
Object.entries(gateDefs).forEach(([gateId, def]) => {
  test(gateId + ": constitution_principle field is present", () => {
    assert.ok(def.constitution_principle,
      gateId + " has no constitution_principle field");
  });

  test(gateId + ": constitution_principle is declared in CONSTITUTION.md", () => {
    const pid = def.constitution_principle;
    assert.ok(
      declaredPrinciples.includes(pid),
      gateId + " references " + pid + " but that principle is not declared in CONSTITUTION.md"
    );
  });
});

// ── Test: every gate referenced in coverage map exists in gates/ ──────────────
// Extract gate IDs from coverage map values
const gateIdPattern = /HG-[A-Z]+-\d{2}/g;
const referencedGateIds = new Set();
Object.values(coverageMap).forEach(entry => {
  const matches = entry.match(gateIdPattern) || [];
  matches.forEach(id => referencedGateIds.add(id));
});

referencedGateIds.forEach(gateId => {
  test(gateId + " referenced in coverage map exists in gates/", () => {
    assert.ok(
      gateDefs[gateId] !== undefined,
      gateId + " is referenced in the coverage map but has no definition file in gates/"
    );
  });
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\nResults:", passed, "passed,", failed, "failed\n");
if (failed > 0) process.exit(1);
