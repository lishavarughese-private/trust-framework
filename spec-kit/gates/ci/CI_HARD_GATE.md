# 🔴 CI — Hard Gate
Phase: CI (Post-PR)
Type: HARD (blocking — MUST pass before merge to main and before deployment pipeline triggers)
Enforced by: GitHub Actions + branch protection status checks

---

## Overview
These checks run automatically on every Pull Request targeting the main branch.
They are executed by `scripts/speckit-trace.js` inside `.github/workflows/speckit-ci.yml`.
A failure in any check causes the CI job to exit with a non-zero code, which:
  - Blocks merge via branch protection rules
  - Blocks the deployment pipeline from triggering
  - Posts a detailed failure report as a PR comment

---

## Checks

### HG-CI-01 — Acceptance Criteria Without Test Coverage
**Check:** For every task in `TASKS.json tasks[]`, each entry in `acceptance_criteria[]` must have
at least one corresponding test in the codebase that references or covers that criterion.
The traceability script maps acceptance criteria text to test file names, test descriptions,
or inline `// AC: TASK-XXX` annotations in test files.
**Fail if:** Any acceptance criterion has zero matching tests in the codebase.
**Remedy:** Add tests covering the missing acceptance criteria before opening a PR.

---

### HG-CI-02 — Tasks Without Corresponding Implementation
**Check:** Every task `id` in `TASKS.json tasks[]` must appear in `IMPL.md` Task Coverage table
with a status of `complete`. Additionally, the source files listed in IMPL.md for each task
must exist on disk.
**Fail if:** Any task is missing from IMPL.md, has a non-complete status, or references a
source file that does not exist.
**Remedy:** Complete the task implementation and update IMPL.md before opening a PR.

---

### HG-CI-03 — Spec Items Unimplemented (Spec Traceability)
**Check:** Every requirement `id` in `SPEC.json requirements[]` must appear in `IMPL.md`
Requirement Coverage table with a status of `covered`. Cross-check that at least one
task mapped to each requirement is marked `complete` in IMPL.md.
**Fail if:** Any requirement is missing from IMPL.md or has a non-covered status.
**Remedy:** Implement all spec requirements and update IMPL.md before opening a PR.

---

### HG-CI-04 — Regression Detection (Previously Passing Tests Now Failing)
**Check:** Run the full test suite. Compare results against the baseline test report from
the last successful merge to main (stored as `ci-reports/baseline-test-report.json`).
Any test that passed in the baseline but fails in the current run is a regression.
**Fail if:** Any test that previously passed is now failing.
**Remedy:** Fix the regression before opening a PR. Do not suppress or skip failing tests.

---

### HG-CI-05 — Broken Spec Contract
**Check:** For every requirement in `SPEC.json requirements[]`, identify all tests that
reference that requirement (via task mapping or inline annotation). If any such test
is currently failing, the spec contract for that requirement is considered broken.
**Fail if:** Any requirement from SPEC.json is referenced by a currently failing test.
**Remedy:** Fix the implementation so all spec-linked tests pass before opening a PR.

---

## Output Format

```
CI HARD GATE REPORT
══════════════════════════════════════════════════════
PR:     #42 — feat/booking-submission
Branch: feat/booking-submission → main
Commit: a1b2c3d
──────────────────────────────────────────────────────
[FAIL] HG-CI-01 — TASK-009 acceptance criterion
        "email and name are encrypted before being
        written to the database" has no corresponding
        test in the codebase.

[FAIL] HG-CI-04 — Regression detected.
        Test "POST /api/bookings returns 400 for
        missing fields" passed on baseline but is
        now FAILING.

[PASS] HG-CI-02 — All tasks present in IMPL.md with status complete.
[PASS] HG-CI-03 — All requirements covered in IMPL.md.
[PASS] HG-CI-05 — No spec contracts broken.
──────────────────────────────────────────────────────
TOTAL: 5 checks — 2 failed, 3 passed

HARD_GATE_RESULT: FAIL
⛔ Merge to main is BLOCKED.
⛔ Deployment pipeline is BLOCKED.
Fix all violations above and push a new commit.
══════════════════════════════════════════════════════
```

```
CI HARD GATE REPORT
══════════════════════════════════════════════════════
[PASS] HG-CI-01 — All acceptance criteria have test coverage.
[PASS] HG-CI-02 — All tasks implemented and present in IMPL.md.
[PASS] HG-CI-03 — All spec requirements covered.
[PASS] HG-CI-04 — No regressions detected.
[PASS] HG-CI-05 — No spec contracts broken.
──────────────────────────────────────────────────────
TOTAL: 5 checks — 0 failed, 5 passed

HARD_GATE_RESULT: PASS
✅ Merge to main is PERMITTED (pending soft gate review).
══════════════════════════════════════════════════════
```
