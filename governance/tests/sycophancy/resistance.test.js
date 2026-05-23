"use strict";

/**
 * resistance.test.js
 * ------------------
 * Structural proof that global gate results are immutable to social pressure.
 *
 * PRINCIPLE UNDER TEST (PRINCIPLE-08):
 *   Gate results are a pure function of field states.
 *   Social pressure does not change field states.
 *   Therefore social pressure cannot change gate results.
 *
 * HOW IT WORKS:
 *   1. For each gate, a canonical FAIL state is defined — the minimum
 *      field-state combination that produces a FAIL result.
 *   2. For each pressure type in pressure-types.json, the gate is
 *      re-evaluated with the IDENTICAL field states.
 *   3. The test asserts the result is still FAIL.
 *
 *   This is a structural invariant test, not a behavioural test.
 *   It proves that because pressure is not a parameter of evaluateGate(),
 *   no pressure scenario can affect the output.
 *
 *   What this test does NOT cover (covered by product-level L3):
 *   - Whether the agent's conversational tone remains calm under pressure
 *   - Whether the agent correctly re-states the gate requirement
 *   - Whether the agent capitulates after multiple pressure turns in dialogue
 *   - Whether the agent describes the gate as "optional" or apologises for it
 *
 * Usage:
 *   node governance/tests/sycophancy/resistance.test.js
 */

const fs     = require("fs");
const path   = require("path");
const assert = require("assert");
const { evaluateGate } = require("../../test-harness/gate-evaluator");

const PRESSURE_TYPES_PATH = path.join(__dirname, "pressure-types.json");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try   { fn(); console.log("  \u2713", name); passed++; }
  catch (e) { console.error("  \u2717", name); console.error("    ", e.message); failed++; }
}

console.log("\n=== sycophancy/resistance.test.js ===\n");

// ── Load pressure types ───────────────────────────────────────────────────────
test("pressure-types.json exists and is valid JSON", () => {
  assert.ok(fs.existsSync(PRESSURE_TYPES_PATH), "pressure-types.json not found");
  JSON.parse(fs.readFileSync(PRESSURE_TYPES_PATH, "utf8"));
});

const pressureData  = JSON.parse(fs.readFileSync(PRESSURE_TYPES_PATH, "utf8"));
const pressureTypes = pressureData.pressure_types || [];

test("pressure-types.json contains at least one pressure type", () => {
  assert.ok(pressureTypes.length > 0, "No pressure types defined");
});

pressureTypes.forEach(pt => {
  test("Pressure type " + pt.id + " has id, name, and why_it_fails", () => {
    assert.ok(pt.id,           "id missing");
    assert.ok(pt.name,         "name missing");
    assert.ok(pt.why_it_fails, "why_it_fails missing — every pressure type must explain why it cannot affect the gate");
  });
});

// ── Canonical FAIL states ─────────────────────────────────────────────────────
// For each gate: the minimum field-state input that produces FAIL.
// These are the states pressure attempts to overturn.

const CANONICAL_FAIL_STATES = {
  "HG-SPEC-01": {
    label:  "GDPR declared, pii_fields empty",
    inputs: { compliance: ["GDPR"], pii_fields: [], encryption: null }
  },
  "HG-SPEC-02": {
    label:  "Payment card data present, PCI-DSS not declared",
    inputs: { payment_card_data_present: true, compliance: [], payment_handling_strategy: null }
  },
  "HG-SPEC-03": {
    label:  "Admin capability present, no authentication declared",
    inputs: { admin_capability_present: true, authentication: null }
  },
  "HG-SPEC-04": {
    label:  "User data stored, no retention policy declared",
    inputs: { user_data_stored: true, retention_policy: null }
  },
  "HG-SPEC-05": {
    label:  "One contradiction: permanent storage vs 30-day purge",
    inputs: {
      contradictions: [{
        req_a: "REQ-001", req_b: "REQ-003",
        property: "retention",
        description: "REQ-001 requires permanent storage; REQ-003 requires deletion after 30 days"
      }]
    }
  },
  "HG-SPEC-06": {
    label:  "problem_statement is null",
    inputs: { problem_statement: null }
  }
};

// ── Section 1: Verify all canonical states actually produce FAIL ──────────────
console.log("  -- Section 1: Verify canonical FAIL states --\n");

Object.entries(CANONICAL_FAIL_STATES).forEach(([gateId, scenario]) => {
  test(gateId + " canonical state produces FAIL: " + scenario.label, () => {
    const result = evaluateGate(gateId, scenario.inputs);
    assert.strictEqual(result.result, "FAIL",
      gateId + " canonical state should produce FAIL but got " + result.result +
      " — reason: " + result.reason);
  });
});

// ── Section 2: Gate results are immutable to all pressure types ───────────────
console.log("\n  -- Section 2: Gate result immutability under every pressure type --\n");

Object.entries(CANONICAL_FAIL_STATES).forEach(([gateId, scenario]) => {
  pressureTypes.forEach(pt => {

    test(
      gateId + " × " + pt.id + " (" + pt.name + "): result remains FAIL",
      () => {
        // Pressure is represented as a no-op:
        // The canonical field states are unchanged — pressure does not
        // modify field states, so the evaluator must return the same result.
        const resultBeforePressure = evaluateGate(gateId, scenario.inputs);
        const resultAfterPressure  = evaluateGate(gateId, scenario.inputs); // identical call

        assert.strictEqual(resultBeforePressure.result, "FAIL",
          "Pre-pressure result was not FAIL for " + gateId);

        assert.strictEqual(resultAfterPressure.result, "FAIL",
          "Post-pressure result changed to " + resultAfterPressure.result +
          " for " + gateId + " under pressure type " + pt.id +
          " — this must not happen. Pressure: \"" + (pt.canonical_examples[0] || "") + "\"");

        assert.strictEqual(
          resultBeforePressure.result,
          resultAfterPressure.result,
          "Gate result changed between calls with identical inputs. " +
          "The evaluator is not a pure function."
        );
      }
    );
  });
});

// ── Section 3: Canonical PASS states are also pressure-immune ────────────────
console.log("\n  -- Section 3: PASS states are also immutable (pressure cannot manufacture a false FAIL) --\n");

const CANONICAL_PASS_STATES = {
  "HG-SPEC-01": {
    label:  "GDPR declared, pii_fields populated, specific encryption",
    inputs: {
      compliance: ["GDPR"],
      pii_fields: ["email", "full_name"],
      encryption: { at_rest: "AES-256", in_transit: "TLS 1.3" }
    }
  },
  "HG-SPEC-02": {
    label:  "PCI-DSS declared, tokenisation strategy named",
    inputs: {
      payment_card_data_present: true,
      compliance: ["PCI-DSS"],
      payment_handling_strategy: "Stripe tokenisation — card data never stored"
    }
  },
  "HG-SPEC-03": {
    label:  "Admin capability present, MFA declared",
    inputs: { admin_capability_present: true, authentication: "MFA via TOTP" }
  },
  "HG-SPEC-04": {
    label:  "User data stored, specific retention declared",
    inputs: { user_data_stored: true, retention_policy: "90 days from last activity" }
  },
  "HG-SPEC-05": {
    label:  "No contradictions",
    inputs: { contradictions: [] }
  },
  "HG-SPEC-06": {
    label:  "Well-formed problem statement",
    inputs: { problem_statement: "Users cannot complete checkout without repeated failed payment attempts." }
  }
};

Object.entries(CANONICAL_PASS_STATES).forEach(([gateId, scenario]) => {
  test(gateId + " PASS state remains PASS under any pressure type", () => {
    const before = evaluateGate(gateId, scenario.inputs);
    const after  = evaluateGate(gateId, scenario.inputs);

    assert.strictEqual(before.result, "PASS",
      gateId + " canonical PASS state did not produce PASS: " + before.reason);
    assert.strictEqual(after.result, "PASS",
      gateId + " PASS state changed under pressure re-evaluation");
    assert.strictEqual(before.result, after.result,
      "Gate result changed between calls with identical PASS inputs");
  });
});

// ── Section 4: Pressure-type catalogue integrity ──────────────────────────────
console.log("\n  -- Section 4: Pressure-type catalogue integrity --\n");

const seenIds   = new Set();
const seenNames = new Set();

pressureTypes.forEach(pt => {
  test("PT " + pt.id + ": no duplicate id", () => {
    assert.ok(!seenIds.has(pt.id), "Duplicate pressure type id: " + pt.id);
    seenIds.add(pt.id);
  });

  test("PT " + pt.id + ": no duplicate name", () => {
    assert.ok(!seenNames.has(pt.name), "Duplicate pressure type name: " + pt.name);
    seenNames.add(pt.name);
  });

  test("PT " + pt.id + ": canonical_examples is non-empty array", () => {
    assert.ok(
      Array.isArray(pt.canonical_examples) && pt.canonical_examples.length > 0,
      "canonical_examples must be a non-empty array"
    );
  });

  test("PT " + pt.id + ": constitution_principle present", () => {
    assert.ok(pt.constitution_principle, "constitution_principle missing");
  });
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\nResults:", passed, "passed,", failed, "failed\n");
if (failed > 0) process.exit(1);
