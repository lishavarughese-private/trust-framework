"use strict";
const fs     = require("fs");
const path   = require("path");
const assert = require("assert");

const BASE = path.resolve(__dirname, "../red-team");
const LEVELS = [
  { dir: "level1-adversarial",  expectedDir: "expected", fixturesDir: "fixtures", fixtureField: "fixture" },
  { dir: "level2-injection",    expectedDir: "expected", fixturesDir: "fixtures", fixtureField: "fixture" },
  { dir: "level3-sycophancy",   expectedDir: "expected", fixturesDir: "scripts",  fixtureField: "script"  },
  { dir: "level4-chained",      expectedDir: "expected", fixturesDir: "fixtures", fixtureField: "fixture" },
  { dir: "level5-obfuscation",  expectedDir: "expected", fixturesDir: "fixtures", fixtureField: "fixture" },
  { dir: "level6-tampering",    expectedDir: "expected", fixturesDir: "fixtures", fixtureField: "fixture" },
  { dir: "level7-phase-bypass", expectedDir: "expected", fixturesDir: "scripts",  fixtureField: "script"  },
];

let passed = 0, failed = 0;

function test(name, fn) {
  try   { fn(); console.log("  \u2713", name); passed++; }
  catch (e) { console.error("  \u2717", name); console.error("    ", e.message); failed++; }
}

console.log("\n=== hallucination.test.js ===\n");

LEVELS.forEach(({ dir, expectedDir, fixturesDir, fixtureField }) => {
  const expDir = path.join(BASE, dir, expectedDir);
  const fixDir = path.join(BASE, dir, fixturesDir);

  test(dir + ": expected/ directory exists", () => {
    assert.ok(fs.existsSync(expDir), expDir + " not found");
  });
  test(dir + ": fixtures/scripts directory exists", () => {
    assert.ok(fs.existsSync(fixDir), fixDir + " not found");
  });

  if (!fs.existsSync(expDir)) return;

  const files = fs.readdirSync(expDir).filter(f => f.endsWith(".json"));

  files.forEach(file => {
    let data;
    test(dir + "/expected/" + file + " is valid JSON", () => {
      data = JSON.parse(fs.readFileSync(path.join(expDir, file), "utf8"));
    });
    if (!data) return;

    test(dir + "/expected/" + file + " has required fields", () => {
      assert.ok(data.test_id,                                          "test_id missing");
      assert.strictEqual(typeof data.level, "number",                 "level must be a number");
      assert.ok(data.category,                                         "category missing");
      assert.ok(Array.isArray(data.expected_behaviours) &&
                data.expected_behaviours.length > 0,                  "expected_behaviours missing or empty");
      assert.ok(Array.isArray(data.must_not_behaviours) &&
                data.must_not_behaviours.length > 0,                  "must_not_behaviours missing or empty");
      assert.ok(data.pass_condition,                                   "pass_condition missing");
    });

    if (data.expected_gate) {
      test(dir + "/expected/" + file + ": gate ID matches HG-*/SG-* format", () => {
        assert.ok(
          /^(HG|SG)-[A-Z]+-\d{2}$/.test(data.expected_gate),
          "gate ID '" + data.expected_gate + "' does not match HG-XXX-NN or SG-XXX-NN"
        );
      });
    }

    const ref = data[fixtureField];
    if (ref) {
      test(dir + "/expected/" + file + ": referenced " + fixtureField + " exists", () => {
        const fp = path.join(fixDir, ref);
        assert.ok(fs.existsSync(fp), "file not found: " + fp);
      });
    }
  });
});

console.log("\nResults:", passed, "passed,", failed, "failed\n");
if (failed > 0) process.exit(1);
