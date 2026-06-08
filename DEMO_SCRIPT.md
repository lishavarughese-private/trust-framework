# Spec-Kit Governance Demo Script

## Part 1: Running Gates Locally

```bash
cd trust-framework
node scripts/speckit.js gate IMPL
```

**Console output explained:**
- Shows product name, phase, number of artifacts loaded
- Lists every gate with ✅ PASS or ⛔ FAIL
- **Hard gates (HARD)** — if any fail, transition to next phase is BLOCKED
- **Soft gates (SOFT)** — warnings, don't block but flag quality concerns

```
Summary:
  Failures:  2 (HARD)
  Warnings:  1 (SOFT)
  Blocking failures:
    HG-SEC-01 - Generic secret assignment found in ...
    HG-TASK-01 - TASK-003 has empty or null maps_to_requirement (spec-kit/IMPL.json:47)
```

Hard gate failures block the phase transition. Fix must be pushed before merge.

---

## Part 2: Gates Run Automatically on PR

- Gates run in CI on every PR push via GitHub Actions
- **HTML report** is generated and uploaded as an artifact
- **PR comment** is posted with gate results summary

**Show on GitHub:**
1. Open the PR → show the **Spec-Kit Gate Report** comment (table of passed/failed gates)
2. Show the **Actions tab** → "Spec-Kit Phase Gates" workflow run
3. Download the **HTML report** from Artifacts and open it locally (full formatted report)

---

## Part 3: Repo Structure & Deep Dive

### Governance Repo (`trust-framework-governance`)

```
trust-framework-governance/
├── governance/
│   ├── gates/           ← All gate logic
│   │   ├── COMMON/      ← Gates that run in ALL phases
│   │   ├── SPEC/        ← Specification phase gates
│   │   ├── PLAN/        ← Architecture/plan phase gates
│   │   ├── TASKS/       ← Task definition phase gates
│   │   └── IMPL/        ← Implementation phase gates
│   ├── evaluator/
│   │   ├── gate-evaluator.js    ← Loads & runs individual gates
│   │   └── evaluate-phase.js    ← Orchestrates phase-level evaluation
│   ├── agent/           ← System prompt for AI agent
│   ├── templates/       ← Phase artifact JSON templates
│   ├── CONSTITUTION.md  ← Governing principles
│   └── DATAFLOW.md      ← Data flow documentation
├── scripts/
│   └── speckit.js       ← CLI tool
└── package.json
```

### Gate Deep Dive — 3 Examples

**HG-SEC-01 (HARD, COMMON):**
Scans ALL source files for hardcoded secrets using regex patterns. Checks for Stripe keys, AWS keys, GitHub tokens, JWT tokens, PII (emails, SSNs, credit cards), and generic key/secret assignments. Skips `process.env` lines.

**HG-TASK-01 (HARD, TASKS/IMPL):**
Validates every task has a `maps_to_requirement` referencing a valid requirement ID from SPEC.json. Ensures no task exists without being traceable to a requirement.

**SG-IMPL-04 (SOFT, IMPL):**
Checks if task notes mention bypasses, deferred work, or skipped items. If yes, requires them to be documented in the `exceptions_logged` table with approval trail.

### Evaluator Architecture

**`gate-evaluator.js`:**
- Loads gate files by phase
- Calls `evaluate(ctx)` on each gate
- Each gate returns `{ gate, result: "PASS"|"FAIL", reason }`

**`evaluate-phase.js`:**
- Loads phase artifacts (SPEC.json, PLAN.json, etc.)
- Builds the `ctx` object (requirements, tasks, files, etc.)
- Calls `gate-evaluator` for all gates in the current phase
- Appends `source_map` locations to failure reasons
- Determines if transition to next phase is allowed
- Returns the complete manifest with summary, gates, and blocking failures

---

## Part 4: Product Repo Integration

### How the Governance Package is Consumed

```json
// package.json
"dependencies": {
  "@lishavarughese-private/governance": "^1.0.x"
}
```

Published to GitHub Packages registry. Installed via:
```bash
npm install @lishavarughese-private/governance
```

### How Speckit Runs

```
node scripts/speckit.js gate --auto
```

- `--auto` detects the current phase by checking which artifacts exist
- Loads SPEC.json → PLAN.json → TASKS.json → IMPL.json
- Calls `evaluate-phase` for that phase
- Generates JSON report (`ci-reports-tmp/`) and HTML report (`ci-reports/`)

### How to Trigger Gate Runs

| Method | Command |
|--------|---------|
| All phases (auto-detect) | `node scripts/speckit.js gate --auto` |
| Specific phase | `node scripts/speckit.js gate IMPL` |
| With HTML report | `node scripts/speckit.js gate IMPL --html` |
| All phases sequentially | `node scripts/speckit.js gate ALL` |
| CI (automated) | Push to PR → GitHub Actions runs it |

---

## Part 5: All Gates by Phase

### SPEC Phase

| Gate | Type | What It Validates |
|------|------|-------------------|
| **HG-SPEC-01** | HARD | PII compliance — encryption at rest/in transit must be declared |
| **HG-SPEC-02** | HARD | Payment card data — PCI-DSS compliance required |
| **HG-SPEC-03** | HARD | Admin capabilities — specific auth method must be declared |
| **HG-SPEC-04** | HARD | User data storage — retention policy must be declared |
| **HG-SPEC-05** | HARD | Requirement contradictions — no conflicting requirement pairs |
| **HG-SPEC-06** | HARD | Problem statement — must be defined and non-empty |
| **SG-SPEC-01** | SOFT | **Undefined Persona** — spec must define persona with name, role, and goal |
| **SG-SPEC-02** | SOFT | **Scope Boundary** — spec must define in-scope (2+) and out-of-scope (1+) items |
| **SG-SPEC-03** | SOFT | **No Success Criteria** — spec must define measurable success criteria |
| **SG-SPEC-04** | SOFT | **Missing Acceptance Criteria** — all tasks must have acceptance criteria |

### PLAN Phase

| Gate | Type | What It Validates |
|------|------|-------------------|
| **HG-PLAN-01** | HARD | Missing required dependencies |
| **HG-PLAN-02** | HARD | Version drift |
| **HG-PLAN-03** | HARD | Missing architecture components |
| **HG-PLAN-04** | HARD | Missing API definitions |
| **HG-PLAN-05** | HARD | Broken traceability |
| **HG-PLAN-06** | HARD | Untraced requirements |
| **HG-PLAN-07** | HARD | Destructive schema changes without migration scripts |
| **HG-PLAN-08** | HARD | Missing rollback strategy |
| **HG-PLAN-09** | HARD | Missing backward compatibility statement |
| **HG-PLAN-10** | HARD | Missing state hydration plan |
| **HG-PLAN-11** | HARD | DB / stateful tasks blocked without rollback strategy |

### TASKS Phase

| Gate | Type | What It Validates |
|------|------|-------------------|
| **HG-TASK-01** | HARD | Tasks not mapped to requirements |
| **HG-TASK-02** | HARD | Missing acceptance criteria |
| **HG-TASK-03** | HARD | Invalid task dependencies |
| **HG-TASK-04** | HARD | Full requirement coverage |
| **HG-TASK-05** | HARD | Invalid task status |

### IMPL Phase

| Gate | Type | What It Validates |
|------|------|-------------------|
| **HG-IMPL-01** | HARD | Failing tests |
| **HG-IMPL-02** | HARD | Console errors |
| **HG-IMPL-03** | HARD | *Superseded by HG-SEC-01* |
| **HG-IMPL-04** | HARD | Missing requirement coverage |
| **HG-IMPL-06** | HARD | Incomplete task coverage |
| **HG-IMPL-07** | HARD | Deployment checklist incomplete |
| **HG-IMPL-08** | **HARD** | **Acceptance Criteria Test Coverage** — each task's acceptance criteria must have a matching test result |
| **SG-IMPL-09** | **SOFT** | **Missing Test Task Pairing** — each implementation task should have a corresponding test task |

### Security Gates (COMMON)

| Gate | Type | What It Scans |
|------|------|---------------|
| **HG-SEC-01** | HARD | Hardcoded secrets, API keys, tokens, PII in source files |
| **INFO-TRACE-01** | INFO | Traceability report — chains of requirements → tasks → implementation |
