#!/usr/bin/env node
"use strict";

/**
 * run-governance-tests.js
 * -----------------------
 * Orchestrates all global governance test suites in the correct order.
 *
 * Suite order (dependency-aware):
 *   1. constitution/integrity.test.js  — gate definitions are well-formed
 *   2. constitution/coverage.test.js   — every principle has a gate and vice versa
 *   3. tests/unit/run-unit-tests.js    — gate logic is correct for all field states
 *   4. pstable/transitions.test.js     — phase sequence and invariants are valid
 *   5. sycophancy/resistance.test.js   — gate results are immutable to social pressure
 *
 * Why this order:
 *   Integrity must pass before coverage (coverage depends on valid gate files).
 *   Coverage must pass before unit tests (unit tests depend on correct gate IDs).
 *   Unit tests must pass before sycophancy (sycophancy uses canonical FAIL states
 *   from the evaluator, which the unit tests already validated).
 *
 * Usage (from project root):
 *   node governance/scripts/run-governance-tests.js
 *
 * Exit codes:
 *   0 — all suites passed
 *   1 — one or more suites failed
 */

const { spawnSync } = require("child_process");
const path          = require("path");

const ROOT = path.resolve(__dirname, "..");

const SUITES = [
  {
    label: "constitution/integrity.test.js",
    file:  path.join(ROOT, "tests/constitution/integrity.test.js"),
    desc:  "Gate definition structure, naming, severity, examples"
  },
  {
    label: "constitution/coverage.test.js",
    file:  path.join(ROOT, "tests/constitution/coverage.test.js"),
    desc:  "Principle ↔ gate bidirectional coverage map"
  },
  {
    label: "unit/run-unit-tests.js",
    file:  path.join(ROOT, "tests/unit/run-unit-tests.js"),
    desc:  "Gate logic — all field-state combinations per gate"
  },
  {
    label: "pstable/transitions.test.js",
    file:  path.join(ROOT, "tests/pstable/transitions.test.js"),
    desc:  "Phase sequence, transition prerequisites, invariant scenarios"
  },
  {
    label: "sycophancy/resistance.test.js",
    file:  path.join(ROOT, "tests/sycophancy/resistance.test.js"),
    desc:  "Gate result immutability under all pressure types (structural proof)"
  }
];

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║         Global Governance Test Runner               ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

let totalSuitesPassed = 0;
let totalSuitesFailed = 0;
const results = [];

SUITES.forEach(suite => {
  console.log("── Running: " + suite.label + " ──");
  console.log("   " + suite.desc);

  const start = Date.now();
  const out   = spawnSync("node", [suite.file], { encoding: "utf8" });
  const ms    = Date.now() - start;

  const exitOk = out.status === 0;

  // Print suite output (indent each line)
  const output = (out.stdout || "") + (out.stderr || "");
  output.split("\n").forEach(line => {
    if (line.trim()) console.log("   " + line);
  });

  if (exitOk) {
    console.log("   \u2714 SUITE PASS  (" + ms + "ms)\n");
    totalSuitesPassed++;
    results.push({ label: suite.label, status: "PASS", ms });
  } else {
    console.error("   \u2718 SUITE FAIL  (" + ms + "ms)\n");
    totalSuitesFailed++;
    results.push({ label: suite.label, status: "FAIL", ms });
  }
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("══════════════════════════════════════════════════════");
console.log("  Suite results:\n");
results.forEach(r => {
  const icon = r.status === "PASS" ? "\u2705" : "\u274C";
  console.log("  " + icon + "  " + r.label.padEnd(42) + r.status + "  (" + r.ms + "ms)");
});

console.log("\n  Suites passed : " + totalSuitesPassed + " / " + SUITES.length);
console.log("  Suites failed : " + totalSuitesFailed);
console.log("══════════════════════════════════════════════════════\n");

if (totalSuitesFailed > 0) {
  console.error("FAIL — " + totalSuitesFailed + " governance suite(s) failed.\n");
  process.exit(1);
} else {
  console.log("PASS — All " + SUITES.length + " governance suites passed.\n");
}
