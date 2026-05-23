"use strict";

/**
 * transitions.test.js
 * -------------------
 * Validates PSTABLE.json structure and evaluates all phase-transition invariants
 * against a set of representative artifact-state scenarios.
 *
 * Tests:
 *   1. PSTABLE.json is valid JSON with required fields
 *   2. Phase sequence is linear with no gaps or duplicates
 *   3. Every transition references valid phases
 *   4. Every transition has human_approval: true
 *   5. All invariants are defined with id and rule
 *   6. Scenario-based invariant evaluation (the L7 global equivalents)
 *
 * Usage:
 *   node governance/tests/pstable/transitions.test.js
 */

const fs     = require("fs");
const path   = require("path");
const assert = require("assert");

const PSTABLE_PATH = path.resolve(__dirname, "../../PSTABLE.json");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try   { fn(); console.log("  \u2713", name); passed++; }
  catch (e) { console.error("  \u2717", name); console.error("    ", e.message); failed++; }
}

console.log("\n=== pstable/transitions.test.js ===\n");

// ── Load PSTABLE.json ─────────────────────────────────────────────────────────
test("PSTABLE.json exists", () => {
  assert.ok(fs.existsSync(PSTABLE_PATH), "PSTABLE.json not found");
});

let pstable;
test("PSTABLE.json is valid JSON", () => {
  pstable = JSON.parse(fs.readFileSync(PSTABLE_PATH, "utf8"));
});

if (!pstable) {
  console.log("\nResults:", passed, "passed,", failed, "failed\n");
  process.exit(1);
}

// ── Structure tests ───────────────────────────────────────────────────────────
test("PSTABLE has _meta block", () => {
  assert.ok(pstable._meta, "_meta block missing");
});

test("PSTABLE._meta.artifact is 'PSTABLE'", () => {
  assert.strictEqual(pstable._meta.artifact, "PSTABLE");
});

test("PSTABLE.phases is a non-empty array", () => {
  assert.ok(Array.isArray(pstable.phases) && pstable.phases.length > 0,
    "phases must be a non-empty array");
});

test("PSTABLE.transitions is a non-empty array", () => {
  assert.ok(Array.isArray(pstable.transitions) && pstable.transitions.length > 0,
    "transitions must be a non-empty array");
});

test("PSTABLE.invariants is a non-empty array", () => {
  assert.ok(Array.isArray(pstable.invariants) && pstable.invariants.length > 0,
    "invariants must be a non-empty array");
});

// ── Phase list tests ──────────────────────────────────────────────────────────
const phases = pstable.phases || [];

test("Phase list has no duplicates", () => {
  const unique = new Set(phases);
  assert.strictEqual(unique.size, phases.length, "Duplicate phase names found: " + phases);
});

test("Phase list contains at least BRIEF, SPEC, PLAN, TASKS, IMPL", () => {
  const required = ["BRIEF", "SPEC", "PLAN", "TASKS", "IMPL"];
  required.forEach(p => {
    assert.ok(phases.includes(p), "Required phase missing from phases list: " + p);
  });
});

// ── Transition tests ──────────────────────────────────────────────────────────
const transitions = pstable.transitions || [];

transitions.forEach(t => {
  test("Transition " + (t.id || "?") + ": from phase exists in phases list", () => {
    assert.ok(phases.includes(t.from),
      "from phase '" + t.from + "' not in phases list");
  });

  test("Transition " + (t.id || "?") + ": to phase exists in phases list", () => {
    assert.ok(phases.includes(t.to),
      "to phase '" + t.to + "' not in phases list");
  });

  test("Transition " + (t.id || "?") + ": from and to are different phases", () => {
    assert.notStrictEqual(t.from, t.to,
      "from and to are the same phase: " + t.from);
  });

  test("Transition " + (t.id || "?") + ": requires human_approval: true", () => {
    assert.strictEqual(t.requires && t.requires.human_approval, true,
      "Transition " + t.from + "→" + t.to + " does not require human_approval: true");
  });

  test("Transition " + (t.id || "?") + ": blocked_if is non-empty array", () => {
    assert.ok(Array.isArray(t.blocked_if) && t.blocked_if.length > 0,
      "blocked_if must be a non-empty array");
  });
});

// ── Invariant tests ───────────────────────────────────────────────────────────
const invariants = pstable.invariants || [];

invariants.forEach(inv => {
  test("Invariant " + (inv.id || "?") + ": has id and rule", () => {
    assert.ok(inv.id && inv.rule, "Invariant missing id or rule field");
  });
});

// ── Scenario-based invariant evaluation ──────────────────────────────────────
// These are the global equivalents of L7 phase-bypass tests.
// They use the PSTABLE logic to evaluate specific artifact-state scenarios.

console.log("\n  -- Scenario evaluations (PSTABLE invariant checks) --\n");

/**
 * Evaluator: given artifact states, should the given transition be blocked?
 * Returns { blocked: boolean, reason: string }
 */
function evaluateTransition(transitionId, artifactStates) {
  const t = transitions.find(tr => tr.id === transitionId);
  if (!t) return { blocked: true, reason: "Transition " + transitionId + " not found" };

  const fromStatus = artifactStates[t.from + "_status"] || "DRAFT";
  const approvalEvents = artifactStates[t.from + "_approval_events"] || [];

  if (fromStatus !== "APPROVED") {
    return {
      blocked: true,
      reason: t.from + ".status is '" + fromStatus + "' — must be APPROVED"
    };
  }

  if (approvalEvents.length === 0) {
    return {
      blocked: true,
      reason: t.from + " has no approval events in audit_log — status APPROVED without audit entry is invalid"
    };
  }

  return { blocked: false, reason: "All prerequisites met" };
}

const SCENARIOS = [
  {
    id: "SCEN-01",
    description: "SPEC→PLAN blocked: SPEC is DRAFT",
    transition: "T-02",
    states: { SPEC_status: "DRAFT", SPEC_approval_events: [] },
    expected_blocked: true
  },
  {
    id: "SCEN-02",
    description: "SPEC→PLAN blocked: SPEC is APPROVED but no audit entry",
    transition: "T-02",
    states: { SPEC_status: "APPROVED", SPEC_approval_events: [] },
    expected_blocked: true
  },
  {
    id: "SCEN-03",
    description: "SPEC→PLAN allowed: SPEC is APPROVED with valid audit entry",
    transition: "T-02",
    states: {
      SPEC_status: "APPROVED",
      SPEC_approval_events: [{ timestamp: "2025-01-10T10:00:00Z", event: "SPEC APPROVED", actor: "human" }]
    },
    expected_blocked: false
  },
  {
    id: "SCEN-04",
    description: "PLAN→TASKS blocked: PLAN is DRAFT",
    transition: "T-03",
    states: { PLAN_status: "DRAFT", PLAN_approval_events: [] },
    expected_blocked: true
  },
  {
    id: "SCEN-05",
    description: "TASKS→IMPL blocked: TASKS is DRAFT",
    transition: "T-04",
    states: { TASKS_status: "DRAFT", TASKS_approval_events: [] },
    expected_blocked: true
  },
  {
    id: "SCEN-06",
    description: "PLAN→TASKS allowed: PLAN is APPROVED with valid audit entry",
    transition: "T-03",
    states: {
      PLAN_status: "APPROVED",
      PLAN_approval_events: [{ timestamp: "2025-01-11T09:00:00Z", event: "PLAN APPROVED", actor: "human" }]
    },
    expected_blocked: false
  },
  {
    id: "SCEN-07",
    description: "SPEC→PLAN blocked: SPEC APPROVED but audit event has actor 'agent' not 'human'",
    transition: "T-02",
    states: {
      SPEC_status: "APPROVED",
      SPEC_approval_events: [{ timestamp: "2025-01-10T10:00:00Z", event: "SPEC APPROVED", actor: "agent" }]
    },
    expected_blocked: true,
    extra_check: function(states) {
      const events = states["SPEC_approval_events"] || [];
      const humanApproval = events.some(e => e.actor === "human" &&
        /^(BRIEF|SPEC|PLAN|TASKS|IMPL) APPROVED$/.test(e.event));
      return !humanApproval;
    }
  }
];

SCENARIOS.forEach(scenario => {
  test(scenario.id + ": " + scenario.description, () => {
    let result = evaluateTransition(scenario.transition, scenario.states);

    // Apply extra check if defined (e.g. actor validation)
    if (scenario.extra_check) {
      const extraBlocked = scenario.extra_check(scenario.states);
      if (extraBlocked) {
        result = { blocked: true, reason: result.reason + " (actor is not human)" };
      }
    }

    assert.strictEqual(
      result.blocked,
      scenario.expected_blocked,
      "Expected blocked=" + scenario.expected_blocked +
      " but got blocked=" + result.blocked +
      " — reason: " + result.reason
    );
  });
});

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\nResults:", passed, "passed,", failed, "failed\n");
if (failed > 0) process.exit(1);
