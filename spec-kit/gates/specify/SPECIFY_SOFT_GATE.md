# 🟡 SPECIFY — Soft Gate
Phase: SPECIFY
Type: SOFT (non-blocking — produces warnings only)

---

## Checks

### SG-SPEC-01 — Ambiguous Language
**Check:** Scan SPEC.json requirements and acceptance criteria for vague words.
**Vague words:** "fast", "easy", "simple", "good", "better", "nice", "soon", "some", "maybe", "should consider"
**Action:** WARN for each occurrence. Suggest specific, measurable replacements.

---

### SG-SPEC-02 — Missing Persona Details
**Check:** Each persona in `personas[]` should have a non-empty:
- `name`
- `role`
- at least one `goal`
- at least one `pain_point`
**Action:** WARN for each missing field.

---

### SG-SPEC-03 — Missing Success Metrics
**Check:** `success_metrics[]` should have at least one entry.
**Action:** WARN if empty. Suggest adding measurable KPIs.

---

### SG-SPEC-04 — Missing Risk Analysis
**Check:** `risks[]` should have at least one entry.
**Action:** WARN if empty. Suggest identifying at least one technical, compliance, or product risk.

---

### SG-SPEC-05 — Scope Not Defined
**Check:** `out_of_scope[]` should have at least one entry.
**Action:** WARN if empty. An undefined boundary invites scope creep.

---

## Output Format

```
SOFT_GATE: SPECIFY
──────────────────────────────
[WARN] SG-SPEC-01 — Ambiguous language in REQ-002: "fast response" is vague. Suggest: "response under 200ms".
[WARN] SG-SPEC-03 — No success metrics defined.
──────────────────────────────
SOFT_GATE_RESULT: PASS (with warnings)
```
