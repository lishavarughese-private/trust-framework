# 🟡 PLAN — Soft Gate
Phase: PLAN
Type: SOFT (non-blocking — produces warnings only)

---

## Checks

### SG-PLAN-01 — Scope Creep
**Check:** Compare PLAN.json components and API definitions against SPEC.json requirements.
**Action:** WARN for any component or API that cannot be traced to a requirement.

---

### SG-PLAN-02 — Over-Engineering
**Check:** Look for signs of unnecessary complexity:
- More than 3 layers of abstraction for simple CRUD
- Components with no clear single responsibility
- External dependencies for functionality that is trivially built in
**Action:** WARN and suggest simplification.

---

### SG-PLAN-03 — Missing Diagrams
**Check:** `architecture.diagrams[]` should have at least one entry referencing a diagram (file path or description).
**Action:** WARN if empty. Suggest adding at minimum a component diagram.

---

### SG-PLAN-04 — Missing Dependency Versions
**Check:** Every entry in `dependencies[]` should have a non-empty `version`.
**Action:** WARN for each dependency with a missing version.

---

### SG-PLAN-05 — Missing Tech Stack Versions
**Check:** Every entry in `tech_stack[]` should have a non-empty `version`.
**Action:** WARN for each stack entry with a missing version.

---

---

### SG-PLAN-06 — Large Data Volume Performance Risk
**Check:** If any entry in `migration.migration_scripts[]` has `estimated_rows_affected` greater than 100,000 (or the value contains "100k", "million", "all rows", or similar).
**Action:** WARN that the migration carries a performance risk. Suggest batching the migration, running during off-peak hours, or adding a progress indicator.

---

### SG-PLAN-07 — Potential Downtime During Migration
**Check:** If `migration.estimated_downtime` is non-empty and not `"0"` or `"none"`.
**Action:** WARN with the estimated downtime value. Suggest a blue/green deployment, a feature flag, or an online migration strategy to reduce downtime.

---

### SG-PLAN-08 — Complex State Rehydration / UI Flicker Risk
**Check:** If `migration.state_hydration` is non-empty and contains words like "complex", "multi-step", "sequential", "order-dependent", or "async".
**Action:** WARN that complex rehydration logic may cause UI flicker or loading state inconsistencies. Suggest adding a loading skeleton, optimistic UI, or a rehydration readiness flag before rendering.

---

## Output Format

```
SOFT_GATE: PLAN
──────────────────────────────
[WARN] SG-PLAN-01 — COMP-003 "AnalyticsDashboard" has no traceability to any requirement.
[WARN] SG-PLAN-03 — No architecture diagrams referenced.
[WARN] SG-PLAN-06 — MS-001 estimates 500,000 rows affected. Performance risk. Suggest batching.
[WARN] SG-PLAN-07 — Estimated downtime is "10 minutes". Consider an online migration strategy.
[WARN] SG-PLAN-08 — State hydration plan describes multi-step async rehydration. UI flicker risk.
──────────────────────────────
SOFT_GATE_RESULT: PASS (with warnings)
```
