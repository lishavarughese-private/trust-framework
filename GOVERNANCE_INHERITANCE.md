# Governance Inheritance Model
**Project:** trust-framework (Car Reservation App)
**Status:** Inheriting from centralized governance repo
**Last Updated:** 2026-06-02

---

## Architecture Overview

`
trust-framework-governance  (CENTRAL - READ-ONLY)
  governance/
    CONSTITUTION.md             14 global principles
    gates/                      Gate evaluator modules (47 .js files)
      COMMON/                   Phase-agnostic gates (HG-SEC-01, INFO-TRACE-01)
      SPEC/                     SPEC phase gates (HG-SPEC-01..06)
      PLAN/                     PLAN phase gates (HG-PLAN-01..11, SG-PLAN-01..08)
      TASKS/                    TASKS phase gates (HG-TASK-01..05, SG-TASK-01..04)
      IMPL/                     IMPL phase gates (HG-IMPL-01..07, SG-IMPL-01..04)
    evaluator/
      gate-evaluator.js         Auto-discovers gate .js files
      evaluate-phase.js         Phase orchestrator
    tests/
      constitution/             Integrity and coverage tests
      sycophancy/               Sycophancy resistance tests
      unit/                     Unit test fixtures
    examples/
      HG-TASK-01-JIRA.json      Example: task to Jira story mapping

trust-framework  (THIS PROJECT)
  spec-kit/
    BRIEF.md, SPEC.json, PLAN.json, TASKS.json, IMPL.md
  scripts/
    speckit.js                 CLI: runs gates for any phase
  server/                      Backend (Express + Knex)
  pages/                       Frontend pages (Next.js)
  components/                  Reusable UI components (React)
  ci-reports/                  Gate evaluation reports
  TODO.md                      Upcoming work items
`

## How Inheritance Works

1. The CLI (scripts/speckit.js) loads the governance evaluator from the local governance repo clone
2. All 47 gates from the governance repo apply -- no opt-out
3. If any HARD gate fails, the phase transition is blocked

## Key Rules

| Rule | Why |
|------|-----|
| Global gates cannot be weakened | Compliance and security |
| Governance version must be pinned | Reproducibility |
| Gate results are immutable | Sycophancy resistance |

---
*Last updated: 2026-06-02*
