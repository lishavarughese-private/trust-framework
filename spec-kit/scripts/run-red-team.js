#!/usr/bin/env node
"use strict";

/**
 * run-red-team.js
 * ---------------
 * Discovers all red-team test cases across L1 through L7.
 * Reports fixture / expected-file coverage and prints a summary table.
 * Exits with code 1 if any test case is missing either its fixture or its
 * expected file.
 *
 * Usage (from project root):
 *   node spec-kit/scripts/run-red-team.js
 */

const fs   = require("fs");
const path = require("path");

const BASE = path.resolve(__dirname, "../tests/red-team");

const LEVELS = [
  { label: "L1 — Adversarial BRIEFs",   dir: "level1-adversarial",   fixturesDir: "fixtures", expectedDir: "expected", ext: ".md"   },
  { label: "L2 — Prompt Injection",     dir: "level2-injection",     fixturesDir: "fixtures", expectedDir: "expected", ext: ".md"   },
  { label: "L3 — Sycophancy",           dir: "level3-sycophancy",    fixturesDir: "scripts",  expectedDir: "expected", ext: ".md"   },
  { label: "L4 — Chained Violations",   dir: "level4-chained",       fixturesDir: "fixtures", expectedDir: "expected", ext: ".md"   },
  { label: "L5 — Obfuscated Language",  dir: "level5-obfuscation",   fixturesDir: "fixtures", expectedDir: "expected", ext: ".md"   },
  { label: "L6 — Artifact Tampering",   dir: "level6-tampering",     fixturesDir: "fixtures", expectedDir: "expected", ext: ".json" },
  { label: "L7 — Phase Bypass",         dir: "level7-phase-bypass",  fixturesDir: "scripts",  expectedDir: "expected", ext: ".md"   },
];

let totalTests  = 0;
let totalPassed = 0;
let totalFailed = 0;

function exists(p) { return fs.existsSync(p); }

function idFromFile(filename) {
  // "L1-TC-001-some-name.md" → "L1-TC-001"
  const m = filename.match(/^(L\d-TC-\d{3})/);
  return m ? m[1] : filename.replace(/\.[^.]+$/, "");
}

console.log("\n╔══════════════════════════════════════════════════════╗");
console.log("║              Spec-Kit Red-Team Runner                ║");
console.log("╚══════════════════════════════════════════════════════╝\n");

LEVELS.forEach(({ label, dir, fixturesDir, expectedDir, ext }) => {
  console.log("── " + label + " ──");

  const fixDir = path.join(BASE, dir, fixturesDir);
  const expDir = path.join(BASE, dir, expectedDir);

  if (!exists(fixDir) || !exists(expDir)) {
    console.log("  ERROR: directory missing —", !exists(fixDir) ? fixDir : expDir, "\n");
    return;
  }

  const fixtures  = fs.readdirSync(fixDir).filter(f => f.endsWith(ext));
  const expecteds = fs.readdirSync(expDir).filter(f => f.endsWith(".json"));

  const fixtureIds  = new Set(fixtures.map(idFromFile));
  const expectedIds = new Set(expecteds.map(f => f.replace(".json", "")));
  const allIds      = new Set([...fixtureIds, ...expectedIds]);

  allIds.forEach(id => {
    const hasFixture  = fixtureIds.has(id);
    const hasExpected = expectedIds.has(id);
    const status      = (hasFixture && hasExpected) ? "PASS" : "FAIL";
    const fixtMark    = hasFixture  ? "\u2713" : "\u2717";
    const expMark     = hasExpected ? "\u2713" : "\u2717";

    console.log(
      "  [" + status + "]  " + id.padEnd(12) +
      "  fixture:" + fixtMark + "  expected:" + expMark +
      (!hasFixture  ? "  << fixture missing"  : "") +
      (!hasExpected ? "  << expected missing" : "")
    );

    totalTests++;
    if (status === "PASS") totalPassed++;
    else totalFailed++;
  });

  console.log();
});

// ── Summary ──────────────────────────────────────────────────────────────────
console.log("══════════════════════════════════════════════════════");
console.log("  Total test cases : " + totalTests);
console.log("  Full coverage    : " + totalPassed);
console.log("  Missing files    : " + totalFailed);
console.log("══════════════════════════════════════════════════════\n");

if (totalFailed > 0) {
  console.error("FAIL — " + totalFailed + " test case(s) have missing fixture or expected file.\n");
  process.exit(1);
} else {
  console.log("PASS — All test cases have complete fixture + expected file coverage.\n");
}
