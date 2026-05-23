#!/usr/bin/env node
"use strict";

/**
 * run-threshold-tests.js
 * ----------------------
 * Runs thresholds.test.js in isolation.
 * Use this as a fast pre-commit check to verify that no threshold value has
 * been relaxed without an explicit decision.
 *
 * Exits with code 1 if any threshold assertion fails.
 *
 * Usage (from project root):
 *   node spec-kit/scripts/run-threshold-tests.js
 */

const { execSync } = require("child_process");
const path         = require("path");

const SUITE = path.resolve(__dirname, "../tests/metrics/thresholds.test.js");

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║          Spec-Kit Threshold Enforcement Check        ║");
console.log("╚══════════════════════════════════════════════════════╝");

try {
  execSync("node " + SUITE, { stdio: "inherit" });
  console.log("══════════════════════════════════════════════════════");
  console.log("  PASS — All thresholds are at required levels.\n");
} catch {
  console.log("══════════════════════════════════════════════════════");
  console.error("  FAIL — One or more thresholds are below required levels.\n");
  process.exit(1);
}
