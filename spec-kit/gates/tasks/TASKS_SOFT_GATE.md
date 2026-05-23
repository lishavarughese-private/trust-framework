# 🟡 TASKS — Soft Gate
Phase: TASKS
Type: SOFT (non-blocking — produces warnings only)

---

## Checks

### SG-TASK-01 — Tasks Too Large
**Check:** Any task with `estimated_effort` greater than 2 days (or described as "large", "week", "sprint")
should be broken down.
**Action:** WARN and suggest splitting into sub-tasks.

---

### SG-TASK-02 — Unclear Task Descriptions
**Check:** Any task with a `description` shorter than 20 characters or containing only a title restatement.
**Action:** WARN and suggest adding context: what to build, how to verify, definition of done.

---

### SG-TASK-03 — Missing Effort Estimates
**Check:** Every task should have a non-empty `estimated_effort`.
**Action:** WARN for each task missing an estimate.

---

### SG-TASK-04 — Missing Component Mapping
**Check:** Every task should have a non-empty `maps_to_component`.
**Action:** WARN for each task not mapped to an architecture component.

---

## Output Format

```
SOFT_GATE: TASKS
──────────────────────────────
[WARN] SG-TASK-01 — TASK-004 "Build reporting module" is estimated at 1 week. Consider splitting.
[WARN] SG-TASK-03 — TASK-007 has no estimated_effort.
──────────────────────────────
SOFT_GATE_RESULT: PASS (with warnings)
```
