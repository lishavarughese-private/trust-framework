# 🟡 IMPLEMENT — Soft Gate
Phase: IMPLEMENT
Type: SOFT (non-blocking — produces warnings only)

---

## Checks

### SG-IMPL-01 — Minor Performance Issues
**Check:** Scan IMPL.md task notes for mentions of known performance concerns such as:
- N+1 queries
- Unindexed lookups
- Synchronous calls in hot paths
- Large bundle sizes
**Action:** WARN for each issue noted. Suggest optimization or a follow-up task.

---

### SG-IMPL-02 — Minor UI Inconsistencies
**Check:** Scan IMPL.md notes for UI-related tasks. Look for mentions of:
- Inconsistent spacing or typography
- Non-standard component usage
- Accessibility gaps (missing aria labels, poor contrast)
**Action:** WARN for each inconsistency. Suggest aligning with design system.

---

### SG-IMPL-03 — Missing Inline Comments for Complex Logic
**Check:** If any task description references complex algorithms, security logic, or non-obvious decisions,
verify that IMPL.md notes that comments were added.
**Action:** WARN if complex logic tasks have no comment notation.

---

### SG-IMPL-04 — Incomplete Exception Log
**Check:** If any exceptions were taken during implementation (bypassed rules, deferred tasks),
they should be documented in the IMPL.md "Exceptions Logged" table.
**Action:** WARN if exceptions appear to have been taken but the table is empty.

---

## Output Format

```
SOFT_GATE: IMPLEMENT
──────────────────────────────
[WARN] SG-IMPL-01 — TASK-005 notes mention N+1 query risk on user listing endpoint.
[WARN] SG-IMPL-03 — TASK-008 involves auth token logic but no comment notation found.
──────────────────────────────
SOFT_GATE_RESULT: PASS (with warnings)
```
