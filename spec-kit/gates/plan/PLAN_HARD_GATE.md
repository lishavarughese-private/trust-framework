# 🔴 PLAN — Hard Gate
Phase: PLAN
Type: HARD (blocking — MUST pass before TASKS phase)

---

## Checks

### HG-PLAN-01 — Missing Required Dependencies
**Check:** `dependencies[]` must be non-empty if any component has an external integration.
Any dependency referenced by name in component descriptions MUST appear in `dependencies[]`.
**Fail if:** A dependency is mentioned in a component but missing from the dependencies list.

---

### HG-PLAN-02 — Version Drift
**Check:** All items in `dependencies[]` and `tech_stack[]` MUST have a non-empty `version`.
**Fail if:** Any entry has an empty or missing `version` field.

---

### HG-PLAN-03 — Missing Architecture Components
**Check:** `architecture.components[]` must have at least one entry with a non-empty `name` and `responsibility`.
**Fail if:** `components[]` is empty or all entries have blank name/responsibility.

---

### HG-PLAN-04 — Missing API Definitions
**Check:** If any requirement in SPEC.json implies a client–server interaction, at least one API definition must exist in `api_definitions[]`.
**Fail if:** Requirements imply API interactions but `api_definitions[]` is empty.

---

### HG-PLAN-05 — Broken Traceability
**Check:** Every `requirement_id` in `traceability[]` must match an `id` in SPEC.json `requirements[]`.
Every `component_id` in `traceability[]` must match an `id` in `architecture.components[]`.
**Fail if:** Any traceability entry references a non-existent requirement or component ID.

---

### HG-PLAN-06 — Untraced Requirements
**Check:** Every `id` in SPEC.json `requirements[]` must appear at least once in `traceability[].requirement_id`.
**Fail if:** Any requirement has no corresponding entry in the traceability matrix.

---

---

### HG-PLAN-07 — Destructive Schema Changes Without Migration Scripts
**Check:** If `migration.has_schema_changes` is `true`, scan `migration.schema_changes[]` for entries where `type` is `destructive` or `mutative`.
Every such entry MUST have a corresponding entry in `migration.migration_scripts[]` via `maps_to_schema_change`.
Every destructive/mutative script MUST have a non-empty `up` AND `down` field.
**Fail if:** Any destructive or mutative schema change has no matching migration script, or a script is missing its `up` or `down`.

---

### HG-PLAN-08 — Missing Rollback Strategy
**Check:** If `migration.has_schema_changes` is `true` OR any component in `architecture.components[]` is of type `database`, `stateful`, or `state-manager`, then `migration.rollback_strategy` MUST be a non-empty string.
The rollback strategy MUST describe: trigger conditions, rollback steps, and data recovery approach.
**Fail if:** Schema changes or stateful components exist and `migration.rollback_strategy` is empty.

---

### HG-PLAN-09 — Missing Backward Compatibility Statement
**Check:** If `migration.has_schema_changes` is `true`, then `migration.backward_compatibility` MUST be a non-empty string that explicitly states whether existing data is preserved, transformed, or at risk.
**Fail if:** `has_schema_changes` is `true` and `backward_compatibility` is empty.

---

### HG-PLAN-10 — Missing State Hydration Plan
**Check:** If any component in `architecture.components[]` is of type `state-manager`, `frontend`, or `client`, AND any schema change or stateful logic change is present, then `migration.state_hydration` MUST be a non-empty string.
The plan MUST address stale state handling, rehydration order, and UI flicker prevention.
**Fail if:** Client-side state is affected by changes and `state_hydration` is empty.

---

### HG-PLAN-11 — DB / Stateful Tasks Blocked Without Rollback Strategy
**Check:** This check applies at the boundary between PLAN and TASKS.
If any component is of type `database`, `stateful`, or `state-manager` AND `migration.rollback_strategy` is empty:
- The AI MUST NOT generate any tasks for those components.
- The TASKS phase MUST remain locked until `rollback_strategy` is defined and PLAN hard gates are re-run.
**Fail if:** DB or stateful components exist and `rollback_strategy` is empty.

---

## Output Format

```
HARD_GATE: PLAN
──────────────────────────────
[FAIL] HG-PLAN-02 — dependency "postgres" has no version specified.
[FAIL] HG-PLAN-06 — REQ-003 is not covered by any component in the traceability matrix.
──────────────────────────────
HARD_GATE_RESULT: FAIL
⛔ TASKS phase is LOCKED. Fix all violations above before proceeding.
```

```
HARD_GATE: PLAN
──────────────────────────────
[PASS] HG-PLAN-01 — All dependencies declared.
[PASS] HG-PLAN-02 — All versions specified.
[PASS] HG-PLAN-03 — Architecture components defined.
[PASS] HG-PLAN-04 — API definitions present.
[PASS] HG-PLAN-05 — All traceability IDs are valid.
[PASS] HG-PLAN-06 — All requirements are traced.
[PASS] HG-PLAN-07 — All destructive/mutative schema changes have up + down migration scripts.
[PASS] HG-PLAN-08 — Rollback strategy is defined.
[PASS] HG-PLAN-09 — Backward compatibility statement is present.
[PASS] HG-PLAN-10 — State hydration plan is defined.
[PASS] HG-PLAN-11 — Rollback strategy confirmed before DB/stateful task generation.
──────────────────────────────
HARD_GATE_RESULT: PASS
✅ TASKS phase is UNLOCKED.
```
