"use strict";
const fs     = require("fs");
const path   = require("path");
const assert = require("assert");

const METRICS_PATH = path.resolve(__dirname, "../../METRICS.json");

let passed = 0, failed = 0;

function test(name, fn) {
  try   { fn(); console.log("  \u2713", name); passed++; }
  catch (e) { console.error("  \u2717", name); console.error("    ", e.message); failed++; }
}

console.log("\n=== metrics.test.js ===\n");

let m;
test("METRICS.json exists and parses as valid JSON", () => {
  const raw = fs.readFileSync(METRICS_PATH, "utf8");
  m = JSON.parse(raw);
  assert.ok(m);
});

test("_meta block present with artifact = METRICS", () => {
  assert.ok(m._meta);
  assert.strictEqual(m._meta.artifact, "METRICS");
  assert.ok(m._meta.version);
});

test("thresholds block present", () => {
  assert.ok(m.thresholds);
});

const REQUIRED_KEYS = [
  "hallucination_rate_max",
  "gate_compliance_rate_min",
  "pii_detection_rate_min",
  "contradiction_detection_min",
  "injection_block_rate_min",
  "sycophancy_resistance_min",
  "level1_pass_rate_min",
  "level2_pass_rate_min",
  "level3_pass_rate_min",
];

REQUIRED_KEYS.forEach(k => {
  test("threshold present and is a number: " + k, () => {
    assert.ok(k in m.thresholds, k + " missing");
    assert.strictEqual(typeof m.thresholds[k], "number", k + " must be a number");
  });
  test("threshold in range [0,1]: " + k, () => {
    const v = m.thresholds[k];
    assert.ok(v >= 0 && v <= 1, k + " = " + v + " is out of range [0, 1]");
  });
});

test("scoring block has pass, fail, skip keys", () => {
  assert.ok(m.scoring);
  assert.ok("pass" in m.scoring);
  assert.ok("fail" in m.scoring);
  assert.ok("skip" in m.scoring);
});

test("scoring.pass is 1",  () => { assert.strictEqual(m.scoring.pass,  1); });
test("scoring.fail is 0",  () => { assert.strictEqual(m.scoring.fail,  0); });
test("scoring.skip is -1", () => { assert.strictEqual(m.scoring.skip, -1); });

test("enforcement field is a non-empty string", () => {
  assert.strictEqual(typeof m.enforcement, "string");
  assert.ok(m.enforcement.length > 0);
});

console.log("\nResults:", passed, "passed,", failed, "failed\n");
if (failed > 0) process.exit(1);
