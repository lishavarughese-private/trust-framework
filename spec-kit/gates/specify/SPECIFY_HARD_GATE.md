# 🔴 SPECIFY — Hard Gate
Phase: SPECIFY
Type: HARD (blocking — MUST pass before PLAN phase)

---

## Checks

### HG-SPEC-01 — PII Without Encryption
**Check:** If `pii_fields[]` is non-empty, then ALL of the following MUST be defined:
- `encryption.at_rest` — must specify algorithm (e.g. AES-256)
- `encryption.in_transit` — must specify protocol (e.g. TLS 1.2+)
- `encryption.key_storage` — must confirm keys are NOT stored with data
**Fail if:** Any PII field exists AND any encryption property is empty.

---

### HG-SPEC-02 — GDPR / CCPA Violation
**Check:** If `compliance[]` includes "GDPR" or "CCPA":
- `pii_fields[]` must be non-empty (you must identify what PII is collected)
- `encryption.at_rest` must be defined
- A retention/deletion policy must be referenced in requirements or risks
**Fail if:** Compliance is declared but PII handling is incomplete.

---

### HG-SPEC-03 — Missing Acceptance Criteria
**Check:** Every entry in `requirements[]` MUST have at least one item in `acceptance_criteria[]`.
**Fail if:** Any requirement has an empty `acceptance_criteria` array.

---

### HG-SPEC-04 — Missing Persona
**Check:** `personas[]` must have at least one entry with a non-empty `name` and `role`.
**Fail if:** `personas[]` is empty or all personas have empty name/role.

---

### HG-SPEC-05 — Missing Problem Statement
**Check:** `problem_statement` must be a non-empty string.
**Fail if:** `problem_statement` is empty or only whitespace.

---

### HG-SPEC-06 — Missing Requirements
**Check:** `requirements[]` must have at least one entry with a non-empty `description`.
**Fail if:** `requirements[]` is empty or all descriptions are blank.

---

### HG-SPEC-07 — Deceptive UI Patterns
**Check:** Scan requirement descriptions for language suggesting:
- Pre-checked consent
- Hidden privacy settings
- Agree-only flows
- Fake urgency or scarcity
- Fake security badges
**Fail if:** Any requirement explicitly describes a deceptive pattern.

---

## Output Format

```
HARD_GATE: SPECIFY
──────────────────────────────
[FAIL] HG-SPEC-01 — PII fields declared (email, phone) but encryption.at_rest is empty.
[FAIL] HG-SPEC-03 — REQ-002 has no acceptance criteria.
──────────────────────────────
HARD_GATE_RESULT: FAIL
⛔ PLAN phase is LOCKED. Fix all violations above before proceeding.
```

```
HARD_GATE: SPECIFY
──────────────────────────────
[PASS] HG-SPEC-01 — PII encryption defined.
[PASS] HG-SPEC-02 — Compliance fields complete.
[PASS] HG-SPEC-03 — All requirements have acceptance criteria.
[PASS] HG-SPEC-04 — Persona defined.
[PASS] HG-SPEC-05 — Problem statement present.
[PASS] HG-SPEC-06 — Requirements present.
[PASS] HG-SPEC-07 — No deceptive UI patterns detected.
──────────────────────────────
HARD_GATE_RESULT: PASS
✅ PLAN phase is UNLOCKED.
```
