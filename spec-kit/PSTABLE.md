# 📋 PSTABLE — Phase & State Table
Version: 1.2

---

## Phase Order (Mandatory)

| # | Phase      | Command               | Input Artifact | Output Artifact | Gate Folder              |
|---|------------|-----------------------|----------------|-----------------|--------------------------|
| 0 | SETUP      | /speckit.setup        | —              | Folder structure + PSTABLE | —               |
| 1 | SPECIFY    | /speckit.specify      | BRIEF.md       | SPEC.json        | gates/specify/           |
| 2 | PLAN       | /speckit.plan         | SPEC.json      | PLAN.json        | gates/plan/              |
| 3 | TASKS      | /speckit.tasks        | PLAN.json      | TASKS.json       | gates/tasks/             |
| 4 | IMPLEMENT  | /speckit.implement    | TASKS.json     | Code + IMPL.md   | gates/implement/         |
| 5 | CI         | /speckit.ci           | Code + IMPL.md | CI report + PR status | gates/ci/           |

---

## Phase State Rules

- A phase is **LOCKED** until all hard gates of the previous phase have passed.
- A phase is **OPEN** when all hard gates of the previous phase have passed.
- A phase is **COMPLETE** when its own hard gates have passed and its output artifact is written.
- The CI phase is **always active** on every PR targeting main. It cannot be skipped.
- A PR is **mergeable** only when CI hard gates pass AND (no soft gate warnings OR Lead has approved).

---

## CI Enforcement

| Mechanism | Tool | Purpose |
|-----------|------|---------|
| CI runner | `.github/workflows/speckit-ci.yml` | Runs hard + soft gate checks on every PR |
| Traceability script | `scripts/speckit-trace.js` | Parses Spec-Kit artifacts, cross-checks against code + tests |
| Branch protection | GitHub Branch Rules | Requires CI hard gate job to pass before merge |
| Lead review | GitHub CODEOWNERS + `needs-lead-review` label | Requires Lead approval when soft gate warnings exist |

---

## Artifact Locations

| Artifact   | Path                        |
|------------|-----------------------------|
| BRIEF.md   | spec-kit/BRIEF.md           |
| SPEC.json  | spec-kit/SPEC.json          |
| BRIEF.md   | spec-kit/BRIEF.md           |
| SPEC.json  | spec-kit/SPEC.json          |
| PLAN.json  | spec-kit/PLAN.json          |
| TASKS.json | spec-kit/TASKS.json         |
| IMPL.md    | spec-kit/IMPL.md            |
| SPECIFY   | gates/specify/SPECIFY_SOFT_GATE.md          | gates/specify/SPECIFY_HARD_GATE.md          |                                            |
| PLAN      | gates/plan/PLAN_SOFT_GATE.md                | gates/plan/PLAN_HARD_GATE.md                | Includes Data Migration & State Impact checks (§7.5) |
| TASKS     | gates/tasks/TASKS_SOFT_GATE.md              | gates/tasks/TASKS_HARD_GATE.md              | DB/stateful tasks blocked without rollback_strategy  |
| IMPLEMENT | gates/implement/IMPLEMENT_SOFT_GATE.md      | gates/implement/IMPLEMENT_HARD_GATE.md      |                                                      |
| CI        | gates/ci/CI_SOFT_GATE.md                    | gates/ci/CI_HARD_GATE.md                    | Enforced by GitHub Actions + branch protection (§7.6)|
