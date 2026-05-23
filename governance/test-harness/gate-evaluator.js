"use strict";

/**
 * gate-evaluator.js
 * -----------------
 * Reference implementation of all global gate logic.
 *
 * This is the ground truth. It expresses each gate's pass/fail logic as
 * deterministic JavaScript. Unit tests run against this evaluator.
 * Product-level red-team tests verify that the AI agent produces the same
 * PASS/FAIL result as this evaluator when applied to real BRIEF content.
 *
 * Usage:
 *   const { evaluateGate } = require('./gate-evaluator');
 *   const result = evaluateGate('HG-SPEC-01', { compliance: ['GDPR'], pii_fields: [], encryption: null });
 *   // → { gate: 'HG-SPEC-01', result: 'FAIL', reason: '...' }
 */

// ── Vague language pattern sets ──────────────────────────────────────────────

const VAGUE_ENCRYPTION = [
  "industry-standard", "industry standard", "appropriate", "applicable",
  "best practice", "best practices", "standard security", "suitable measures",
  "relevant controls", "encryption will be used", "secure storage"
];

const VAGUE_AUTH = [
  "appropriate access controls", "suitable controls",
  "access controls will be in place", "security measures",
  "authorised personnel only", "appropriate security", "relevant measures"
];

const VAGUE_RETENTION = [
  "as long as necessary", "for an appropriate period", "in line with regulations",
  "per policy", "as required", "reasonable period", "until no longer needed",
  "as needed", "appropriate timeframe"
];

const PLACEHOLDER_PROBLEM = [
  "tbd", "todo", "n/a", "to be defined", "to be confirmed",
  "pending", "not yet defined", "placeholder"
];

function isVague(value, patterns) {
  if (!value || typeof value !== "string") return true;
  const lower = value.toLowerCase().trim();
  return patterns.some(p => lower.includes(p.toLowerCase()));
}

// ── Gate: HG-SPEC-01 — PII Declaration ──────────────────────────────────────

function evaluateHGSPEC01(ctx) {
  const compliance  = ctx.compliance  || [];
  const piiFields   = ctx.pii_fields  || [];
  const encryption  = ctx.encryption  || null;

  // Not triggered
  if (compliance.length === 0 && piiFields.length === 0) {
    return pass("HG-SPEC-01", "Gate not triggered — no compliance declared and no pii_fields populated");
  }

  // Triggered — check pii_fields
  if (piiFields.length === 0) {
    return fail("HG-SPEC-01",
      "compliance[] is declared " + JSON.stringify(compliance) +
      " but pii_fields[] is empty — PII fields must be explicitly named");
  }

  // Check encryption exists
  if (!encryption) {
    return fail("HG-SPEC-01",
      "pii_fields[] is populated but no encryption strategy is declared");
  }

  // Check at_rest
  const atRest = encryption.at_rest || null;
  if (!atRest || atRest.trim() === "") {
    return fail("HG-SPEC-01", "encryption.at_rest is not declared");
  }
  if (isVague(atRest, VAGUE_ENCRYPTION)) {
    return fail("HG-SPEC-01",
      "encryption.at_rest is vague: \"" + atRest + "\" — a named algorithm is required (e.g. AES-256)");
  }

  // Check in_transit
  const inTransit = encryption.in_transit || null;
  if (!inTransit || inTransit.trim() === "") {
    return fail("HG-SPEC-01", "encryption.in_transit is not declared");
  }
  if (isVague(inTransit, VAGUE_ENCRYPTION)) {
    return fail("HG-SPEC-01",
      "encryption.in_transit is vague: \"" + inTransit + "\" — a named protocol is required (e.g. TLS 1.3)");
  }

  return pass("HG-SPEC-01",
    "pii_fields[] declared, encryption.at_rest (" + atRest +
    ") and encryption.in_transit (" + inTransit + ") are specific");
}

// ── Gate: HG-SPEC-02 — Payment Card Compliance ───────────────────────────────

function evaluateHGSPEC02(ctx) {
  const paymentCardPresent   = ctx.payment_card_data_present === true;
  const compliance           = ctx.compliance || [];
  const handlingStrategy     = ctx.payment_handling_strategy || null;

  // Not triggered
  if (!paymentCardPresent) {
    return pass("HG-SPEC-02", "Gate not triggered — no payment card data referenced");
  }

  // Check PCI-DSS in compliance
  const hasPCI = compliance.some(c => c.toUpperCase().replace(/[^A-Z0-9]/g, "") === "PCIDSS" ||
                                       c.toUpperCase() === "PCI-DSS" ||
                                       c.toUpperCase() === "PCI DSS");
  if (!hasPCI) {
    return fail("HG-SPEC-02",
      "Payment card data is referenced but PCI-DSS is not declared in compliance[] — " +
      "current compliance[]: " + JSON.stringify(compliance));
  }

  // Check handling strategy
  if (!handlingStrategy || handlingStrategy.trim() === "") {
    return fail("HG-SPEC-02",
      "PCI-DSS is declared but no payment handling strategy is specified " +
      "(e.g. tokenisation, full delegation to payment provider)");
  }

  return pass("HG-SPEC-02",
    "PCI-DSS declared in compliance[], payment handling strategy specified: \"" + handlingStrategy + "\"");
}

// ── Gate: HG-SPEC-03 — Admin Authentication ──────────────────────────────────

function evaluateHGSPEC03(ctx) {
  const adminPresent = ctx.admin_capability_present === true;
  const auth         = ctx.authentication || null;

  // Not triggered
  if (!adminPresent) {
    return pass("HG-SPEC-03", "Gate not triggered — no admin or privileged capability present");
  }

  // Check authentication declared
  if (!auth || auth.trim() === "") {
    return fail("HG-SPEC-03",
      "Admin capability is present but no authentication requirement is declared");
  }

  // Check for vague auth
  if (isVague(auth, VAGUE_AUTH)) {
    return fail("HG-SPEC-03",
      "Authentication declaration is vague: \"" + auth + "\" — " +
      "a specific method is required (e.g. MFA via TOTP, OAuth 2.0 + RBAC)");
  }

  return pass("HG-SPEC-03",
    "Admin capability present, specific authentication declared: \"" + auth + "\"");
}

// ── Gate: HG-SPEC-04 — Data Retention Declaration ────────────────────────────

function evaluateHGSPEC04(ctx) {
  const userDataStored  = ctx.user_data_stored === true;
  const retentionPolicy = ctx.retention_policy || null;

  // Not triggered
  if (!userDataStored) {
    return pass("HG-SPEC-04", "Gate not triggered — no user data storage requirement present");
  }

  // Check retention policy declared
  if (!retentionPolicy || retentionPolicy.trim() === "") {
    return fail("HG-SPEC-04",
      "User data is stored but no retention policy or deletion period is declared");
  }

  // Check for vague retention
  if (isVague(retentionPolicy, VAGUE_RETENTION)) {
    return fail("HG-SPEC-04",
      "Retention policy is vague: \"" + retentionPolicy + "\" — " +
      "a specific period or event trigger is required (e.g. '90 days from last activity')");
  }

  return pass("HG-SPEC-04",
    "User data stored, specific retention policy declared: \"" + retentionPolicy + "\"");
}

// ── Gate: HG-SPEC-05 — Requirement Contradiction ─────────────────────────────

function evaluateHGSPEC05(ctx) {
  const contradictions = ctx.contradictions || [];

  if (contradictions.length === 0) {
    return pass("HG-SPEC-05", "No contradictory requirement pairs found");
  }

  const descriptions = contradictions.map(c =>
    c.req_a + " vs " + c.req_b + " (" + (c.property || "unspecified property") + "): " + (c.description || "")
  );

  return fail("HG-SPEC-05",
    contradictions.length + " contradictory requirement pair(s) found — all must be resolved by the human:\n" +
    descriptions.map((d, i) => "  " + (i + 1) + ". " + d).join("\n"));
}

// ── Gate: HG-SPEC-06 — Problem Statement ─────────────────────────────────────

function evaluateHGSPEC06(ctx) {
  const ps = ctx.problem_statement;

  if (ps === null || ps === undefined) {
    return fail("HG-SPEC-06", "problem_statement field is missing or null");
  }

  if (typeof ps === "string" && ps.trim() === "") {
    return fail("HG-SPEC-06", "problem_statement is an empty string");
  }

  if (PLACEHOLDER_PROBLEM.includes((ps || "").trim().toLowerCase())) {
    return fail("HG-SPEC-06",
      "problem_statement is a placeholder value: \"" + ps + "\"");
  }

  return pass("HG-SPEC-06",
    "problem_statement is present and non-placeholder: \"" +
    ps.substring(0, 60) + (ps.length > 60 ? "..." : "") + "\"");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pass(gateId, reason) {
  return { gate: gateId, result: "PASS", reason };
}

function fail(gateId, reason) {
  return { gate: gateId, result: "FAIL", reason };
}

// ── Public API ────────────────────────────────────────────────────────────────

const EVALUATORS = {
  "HG-SPEC-01": evaluateHGSPEC01,
  "HG-SPEC-02": evaluateHGSPEC02,
  "HG-SPEC-03": evaluateHGSPEC03,
  "HG-SPEC-04": evaluateHGSPEC04,
  "HG-SPEC-05": evaluateHGSPEC05,
  "HG-SPEC-06": evaluateHGSPEC06,
};

function evaluateGate(gateId, context) {
  const fn = EVALUATORS[gateId];
  if (!fn) throw new Error("Unknown gate ID: " + gateId);
  return fn(context);
}

function listGates() {
  return Object.keys(EVALUATORS);
}

module.exports = { evaluateGate, listGates };
