# 🔴 IMPLEMENT — Hard Gate
Phase: IMPLEMENT
Type: HARD (blocking — MUST pass before DEPLOY)

---

## Checks

### HG-IMPL-01 — Failing Tests
**Check:** IMPL.md "Test Results" table must have at least one row, and every row must show "Pass".
**Fail if:** Any test row shows "Fail", or the test results table is completely empty.

---

### HG-IMPL-02 — Console Errors
**Check:** IMPL.md must explicitly confirm zero console errors at runtime.
**Fail if:** IMPL.md notes any unresolved console errors, or the confirmation is absent.

---

### HG-IMPL-03 — Security Violations
**Check:** Scan IMPL.md and task notes for any of the following:
- Hardcoded secrets, passwords, or API keys in source
- PII logged to console or unencrypted storage
- Auth/authz checks missing on protected routes or endpoints
- TLS not enforced for PII in transit
**Fail if:** Any security violation is identified.

---

### HG-IMPL-04 — Missing Requirement Coverage
**Check:** Every `id` in SPEC.json `requirements[]` must appear in the IMPL.md "Requirement Coverage" table
with a status of "covered" or equivalent.
**Fail if:** Any requirement is missing from the coverage table or has a non-covered status.

---

### HG-IMPL-05 — Missing Error Handling
**Check:** For every task that involves an API call, database operation, or external integration,
IMPL.md or task notes must confirm that error handling was implemented (try/catch, fallback, user-facing error state).
**Fail if:** Any such task has no mention of error handling.

---

### HG-IMPL-06 — Incomplete Task Coverage
**Check:** Every task in TASKS.json must appear in the IMPL.md "Task Coverage" table with a status of "complete".
**Fail if:** Any task is missing from the coverage table or has a non-complete status.

---

### HG-IMPL-07 — Deployment Checklist Incomplete
**Check:** Every item in the IMPL.md "Deployment Checklist" must be checked.
**Fail if:** Any checklist item is unchecked.

---

## Output Format

```
HARD_GATE: IMPLEMENT
──────────────────────────────
[FAIL] HG-IMPL-01 — Test "UserAuth integration test" is marked Fail.
[FAIL] HG-IMPL-04 — REQ-005 is missing from the requirement coverage table.
──────────────────────────────
HARD_GATE_RESULT: FAIL
⛔ DEPLOY is LOCKED. Fix all violations above before proceeding.
```

```
HARD_GATE: IMPLEMENT
──────────────────────────────
[PASS] HG-IMPL-01 — All tests passing.
[PASS] HG-IMPL-02 — No console errors confirmed.
[PASS] HG-IMPL-03 — No security violations detected.
[PASS] HG-IMPL-04 — All requirements covered.
[PASS] HG-IMPL-05 — Error handling confirmed for all integration tasks.
[PASS] HG-IMPL-06 — All tasks complete.
[PASS] HG-IMPL-07 — Deployment checklist fully checked.
──────────────────────────────
HARD_GATE_RESULT: PASS
✅ DEPLOY is UNLOCKED.
```
