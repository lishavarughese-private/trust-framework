# 🟡 CI — Soft Gate
Phase: CI (Post-PR)
Type: SOFT (non-blocking — warns and requires Lead acknowledgement before merge)
Enforced by: GitHub Actions PR comment + `needs-lead-review` label + CODEOWNERS required review

---

## Overview
These checks run after the CI hard gate passes on every Pull Request targeting main.
Warnings do not fail the CI job or block merge outright, but they:
  - Post a structured warning comment on the PR
  - Apply the `needs-lead-review` label to the PR automatically
  - Trigger a required Team Lead approval via CODEOWNERS before merge is permitted
The Lead's approval is the formal acknowledgement of each warning.
If no warnings are present, the Lead review requirement is waived.

---

## Checks

### SG-CI-01 — Implementation Task Without Paired Test Task
**Check:** For every task in `TASKS.json tasks[]` where `maps_to_component` is NOT of type
`test` or `qa`, there should be a corresponding test task in `TASKS.json` that:
  - Has a description referencing the same component or requirement
  - Contains the word "test", "spec", or "coverage" in its title or description
**Threshold:** Any implementation task with no paired test task triggers a warning.
**Action:** WARN for each unpaired implementation task. Flag for Lead review.
Suggest adding a test task to TASKS.json covering the implementation task's acceptance criteria.

---

### SG-CI-02 — Coverage Approach Not Declared
**Check:** For each module or component in `PLAN.json architecture.components[]` that is
required by CONSTITUTION.md to have tests (type: `backend`, `frontend`, `database`, `stateful`),
a coverage approach must be declared. Coverage approach is declared by the presence of at least
one of the following in the codebase root or component directory:
  - `jest.config.js` / `vitest.config.js` / `pytest.ini` (unit)
  - `cypress.config.js` / `playwright.config.js` (e2e)
  - A `coverage` script in `package.json`
**Threshold:** Any required component with no detectable coverage configuration triggers a warning.
**Action:** WARN for each component missing a coverage declaration.
Flag for Lead review. Suggest adding a coverage configuration file.

---

### SG-CI-03 — Implementation-to-Test Task Ratio Exceeds Threshold
**Check:** Count all tasks in `TASKS.json tasks[]`:
  - `impl_count` = tasks where title/description does NOT contain "test", "spec", "migration", "coverage"
  - `test_count` = tasks where title/description contains "test", "spec", or "coverage"
  - `ratio` = impl_count / test_count (if test_count is 0, ratio = ∞)
**Threshold:** Warn if ratio exceeds 3:1.
**Action:** WARN with the calculated ratio. Flag for Lead review.
Suggest adding test tasks to bring the ratio to 3:1 or below.

---

## Lead Acknowledgement Flow

```
CI soft gate warnings detected
        ↓
CI job posts warning comment on PR
        ↓
CI job applies "needs-lead-review" label
        ↓
GitHub notifies CODEOWNERS (Team Lead)
        ↓
Team Lead reviews warnings
        ↓
  ┌─────────────────────────────────┐
  │ Lead approves PR                │  → Merge permitted ✅
  │ (acknowledgement on record)     │
  └─────────────────────────────────┘
        OR
  ┌─────────────────────────────────┐
  │ Lead requests changes           │  → Developer fixes → re-run CI
  └─────────────────────────────────┘
```

---

## Output Format

```
CI SOFT GATE REPORT
══════════════════════════════════════════════════════
PR:     #42 — feat/booking-submission
Branch: feat/booking-submission → main
──────────────────────────────────────────────────────
[WARN] SG-CI-01 — TASK-008 "Implement AWS KMS encryption
        helper" has no paired test task in TASKS.json.
        Suggest adding a test task covering the KMS
        encrypt/decrypt round-trip.

[WARN] SG-CI-03 — Implementation-to-test task ratio is
        10:2 (5:1). Threshold is 3:1.
        Suggest adding at least 2 more test tasks.

[PASS] SG-CI-02 — Coverage approach declared for all
        required components.
──────────────────────────────────────────────────────
TOTAL: 3 checks — 2 warnings, 1 passed

SOFT_GATE_RESULT: PASS (with warnings)
⚠️  Label "needs-lead-review" applied to PR.
⚠️  Team Lead approval is required before merge.
══════════════════════════════════════════════════════
```

```
CI SOFT GATE REPORT
══════════════════════════════════════════════════════
[PASS] SG-CI-01 — All implementation tasks have paired test tasks.
[PASS] SG-CI-02 — Coverage approach declared for all required components.
[PASS] SG-CI-03 — Implementation-to-test ratio is 2:1. Within threshold.
──────────────────────────────────────────────────────
TOTAL: 3 checks — 0 warnings, 3 passed

SOFT_GATE_RESULT: PASS (no warnings)
✅ Lead review not required. Merge permitted if hard gate passed.
══════════════════════════════════════════════════════
```
