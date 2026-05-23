# 🔴 TASKS — Hard Gate
Phase: TASKS
Type: HARD (blocking — MUST pass before IMPLEMENT phase)

---

## Checks

### HG-TASK-01 — Tasks Not Mapped to Requirements
**Check:** Every task in `tasks[]` MUST have a non-empty `maps_to_requirement` field that references a valid `id` in SPEC.json `requirements[]`.
**Fail if:** Any task has an empty `maps_to_requirement`, or references a requirement ID that does not exist in SPEC.json.

---

### HG-TASK-02 — Missing Acceptance Criteria Mapping
**Check:** Every task MUST have at least one entry in its `acceptance_criteria[]` array.
**Fail if:** Any task has an empty `acceptance_criteria` array.

---

### HG-TASK-03 — Missing Dependencies
**Check:** If a task's `dependencies[]` array is non-empty, all referenced task IDs must exist in `tasks[]`.
**Fail if:** A task dependency references a non-existent task ID.

---

### HG-TASK-04 — Full Requirement Coverage
**Check:** Every `id` in SPEC.json `requirements[]` must be referenced by at least one task via `maps_to_requirement`.
**Fail if:** Any requirement has zero tasks mapped to it.

---

### HG-TASK-05 — Invalid Task Status
**Check:** Every task `status` must be one of: `todo`, `in_progress`, `done`, `blocked`.
**Fail if:** Any task has a status value outside this set.

---

## Output Format

```
HARD_GATE: TASKS
──────────────────────────────
[FAIL] HG-TASK-01 — TASK-003 maps_to_requirement is empty.
[FAIL] HG-TASK-04 — REQ-004 has no tasks mapped to it.
──────────────────────────────
HARD_GATE_RESULT: FAIL
⛔ IMPLEMENT phase is LOCKED. Fix all violations above before proceeding.
```

```
HARD_GATE: TASKS
──────────────────────────────
[PASS] HG-TASK-01 — All tasks mapped to requirements.
[PASS] HG-TASK-02 — All tasks have acceptance criteria.
[PASS] HG-TASK-03 — All task dependencies are valid.
[PASS] HG-TASK-04 — All requirements covered by tasks.
[PASS] HG-TASK-05 — All task statuses are valid.
──────────────────────────────
HARD_GATE_RESULT: PASS
✅ IMPLEMENT phase is UNLOCKED.
```
