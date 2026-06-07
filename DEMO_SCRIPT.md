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

## Part 5: Security Gates by Phase

| Phase | Security Gate | What It Scans |
|-------|---------------|---------------|
| **ALL (COMMON)** | **HG-SEC-01** | Hardcoded secrets, API keys, tokens, PII in source files |
| **IMPL** | **HG-IMPL-03** | *Duplicated — superseded by HG-SEC-01* |
| **SPEC** | **HG-SPEC-01** | PII compliance — encryption at rest/in transit must be declared |
| **SPEC** | **HG-SPEC-02** | Payment card data — PCI-DSS compliance required |
| **SPEC** | **HG-SPEC-03** | Admin capabilities — specific auth method must be declared |
| **SPEC** | **HG-SPEC-04** | User data storage — retention policy must be declared |
