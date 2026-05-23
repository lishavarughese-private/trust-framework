#!/usr/bin/env node
"use strict";

/**
 * run-metrics-tests.js
 * --------------------
 * Runs the full metrics test suite in sequence:
 *   1. metrics.test.js       — METRICS.json structure and field validation
 *   2. hallucination.test.js — expected-file integrity and fixture cross-references
 *   3. thresholds.test.js    — threshold value enforcement
 *
 * Exits with code 1 if any suite fails.
 *
 * Usage (from project root):
 *   node spec-kit/scripts/run-metrics-tests.js
 */

const { execSync } = require("child_process");
const path         = require("path");

const TESTS_DIR = path.resolve(__dirname, "../tests/metrics");

const SUITES = [
  "metrics.test.js",
  "hallucination.test.js",
  "thresholds.test.js",
];

let allPassed = true;

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║            Spec-Kit Metrics Test Runner              ║");
console.log("╚══════════════════════════════════════════════════════╝");

SUITES.forEach(suite => {
  const filePath = path.join(TESTS_DIR, suite);
  try {
    execSync("node " + filePath, { stdio: "inherit" });
  } catch {
    allPassed = false;
  }
});

console.log("══════════════════════════════════════════════════════");
if (allPassed) {
  console.log("  PASS — All metrics suites passed.\n");
} else {
  console.error("  FAIL — One or more metrics suites failed.\n");
  process.exit(1);
}
