# Spec-Kit Governance Demo Script

## Overview — Two Repos, One Governance System

This demo showcases the **Spec-Kit Governance Framework** — a gate-based quality assurance system built across two interconnected repositories:

1. **Product Repo** (`trust-framework`) — A simple Node.js car rental API project that is being developed
2. **Governance Repo** (`trust-framework-governance`) — The reusable governance engine that enforces quality gates

The governance gates are published as an **npm package** to **GitHub Packages**, consumed by the product repo as a dependency. This means governance rules are managed in one place and versioned independently of any product.

---

## PART 1: The Product Repo — What Are We Building?

### The Application

A **car rental booking API** — a Node.js/Express application that lets customers:

- Browse available cars by name, type, and availability
- Check in/out dates (with validation — no past dates, no end-before-start)
- Book a reservation (stored in a database)
- Request data deletion (GDPR compliance)

### How the Artifacts Are Created

The project follows a structured development process captured in **phase artifacts** — JSON files in `spec-kit/`:

| Artifact | Phase | What It Contains |
|----------|-------|-----------------|
| `BRIEF.md` | Brief | Problem statement — what we're solving |
| `SPEC.json` | Specification | Requirements, success criteria, personas, compliance, PII, encryption, scope |
| `PLAN.json` | Architecture Plan | Architecture components, dependencies, tech stack, traceability matrix, schema changes, rollback strategy |
| `TASKS.json` | Task Breakdown | All development tasks with acceptance criteria, effort estimates, dependencies, status, and mapping to requirements + components |
| `IMPL.json` | Implementation | Test results, console errors, requirement coverage, task coverage, deployment checklist, task notes |

Each artifact is **created by an AI agent** based on the previous phase's artifact. For example:
- The AI reads `SPEC.json` and generates `PLAN.json` (architecture)
- The AI reads `PLAN.json` and generates `TASKS.json` (tasks)
- The AI reads `TASKS.json` and writes code + `IMPL.json` (implementation evidence)

The governance engine then **validates** each artifact before allowing the next phase to begin.

---

## PART 2: The Governance Repo — The Quality Engine

### Complete Directory Structure

```
trust-framework-governance/
├── governance/
│   ├── gates/                    # ALL gate logic — one file per gate
│   │   ├── COMMON/               # Gates that run in EVERY phase
│   │   │   ├── HG-SEC-01.js      # Hardcoded secret scanner
│   │   │   └── INFO-TRACE-01.js  # Traceability report generator
│   │   ├── SPEC/                 # Specification phase gates
│   │   │   ├── HG-SPEC-01.js     # PII & encryption compliance
│   │   │   ├── HG-SPEC-02.js     # Payment card (PCI-DSS) compliance
│   │   │   ├── HG-SPEC-03.js     # Admin capability auth method
│   │   │   ├── HG-SPEC-04.js     # Data retention policy
│   │   │   ├── HG-SPEC-05.js     # Requirement contradictions
│   │   │   ├── HG-SPEC-06.js     # Problem statement presence
│   │   │   ├── SG-SPEC-01.js     # Persona defined?
│   │   │   ├── SG-SPEC-02.js     # Scope boundaries defined?
│   │   │   ├── SG-SPEC-03.js     # Success criteria defined?
│   │   │   └── SG-SPEC-04.js     # Tasks have acceptance criteria?
│   │   ├── PLAN/                 # Architecture plan gates
│   │   │   ├── HG-PLAN-01.js     # External dependencies declared
│   │   │   ├── HG-PLAN-02.js     # Dependency versions specified
│   │   │   ├── HG-PLAN-03.js     # Architecture components exist
│   │   │   ├── HG-PLAN-04.js     # API definitions present (if needed)
│   │   │   ├── HG-PLAN-05.js     # Valid traceability references
│   │   │   ├── HG-PLAN-06.js     # All requirements traced
│   │   │   ├── HG-PLAN-07.js     # Migration scripts for destructive changes
│   │   │   ├── HG-PLAN-08.js     # Rollback strategy coverage
│   │   │   ├── HG-PLAN-09.js     # Backward compatibility statement
│   │   │   ├── HG-PLAN-10.js     # State hydration plan
│   │   │   ├── HG-PLAN-11.js     # DB tasks blocked without rollback
│   │   │   ├── SG-PLAN-01.js     # All components traceable
│   │   │   ├── SG-PLAN-02.js     # Over-engineering check
│   │   │   ├── SG-PLAN-03.js     # Diagrams referenced
│   │   │   ├── SG-PLAN-04.js     # Dependencies have versions
│   │   │   ├── SG-PLAN-05.js     # Tech stack has versions
│   │   │   ├── SG-PLAN-06.js     # Data volume performance risks
│   │   │   ├── SG-PLAN-07.js     # Downtime during migration?
│   │   │   └── SG-PLAN-08.js     # Complex rehydration risk?
│   │   ├── TASKS/                # Task definition gates
│   │   │   ├── HG-TASK-01.js     # Tasks mapped to requirements
│   │   │   ├── HG-TASK-02.js     # Acceptance criteria present
│   │   │   ├── HG-TASK-03.js     # Valid dependency references
│   │   │   ├── HG-TASK-04.js     # All requirements covered by tasks
│   │   │   ├── HG-TASK-05.js     # Valid task status values
│   │   │   ├── SG-TASK-01.js     # Task size threshold (≤2 days)
│   │   │   ├── SG-TASK-02.js     # Description quality
│   │   │   ├── SG-TASK-03.js     # Effort estimates present
│   │   │   └── SG-TASK-04.js     # Tasks mapped to components
│   │   └── IMPL/                 # Implementation gates
│   │       ├── HG-IMPL-01.js     # All tests passing?
│   │       ├── HG-IMPL-02.js     # Console errors?
│   │       ├── HG-IMPL-03.js     # (Superseded by HG-SEC-01)
│   │       ├── HG-IMPL-04.js     # All requirements implemented?
│   │       ├── HG-IMPL-06.js     # All tasks marked complete?
│   │       ├── HG-IMPL-07.js     # Deployment checklist done?
│   │       ├── HG-IMPL-08.js     # Acceptance criteria tested?
│   │       ├── SG-IMPL-04.js     # Bypasses documented?
│   │       └── SG-IMPL-09.js     # Missing test task pairs?
│   ├── evaluator/
│   │   ├── gate-evaluator.js     # Loads gate files, manages gate lifecycle
│   │   └── evaluate-phase.js     # Orchestrates full phase evaluation
│   ├── agent/                    # System prompts for AI agent
│   │   └── SYSTEM_PROMPT.md      # Instructions for AI when creating artifacts
│   ├── templates/                # JSON templates for each phase artifact
│   │   ├── SPEC.json             # Template for specification
│   │   ├── PLAN.json             # Template for architecture plan
│   │   ├── TASKS.json            # Template for task breakdown
│   │   ├── IMPL.json             # Template for implementation evidence
│   │   └── speckit-ci.yml        # Template for GitHub Actions workflow
│   ├── tests/                    # Governance test suites
│   │   ├── constitution/         # Tests against CONSTITUTION.md
│   │   ├── unit/                 # Unit tests for individual gates
│   │   └── sycophancy/           # Resistance tests against AI persuasion
│   ├── CONSTITUTION.md           # Governing principles document
│   ├── DATAFLOW.md               # Data flow documentation
│   ├── METRICS.json              # Governance metrics & KPIs
│   └── scripts/
│       └── run-governance-tests.js   # Test runner
├── scripts/
│   └── speckit.js                # CLI tool entry point (in product repo root)
├── package.json                  # Published to GitHub Packages
└── README.md
```

### How the Governance Package Is Published & Consumed

**Publishing flow:**
```
trust-framework-governance/
    git push origin main
        -> GitHub Actions workflow triggers
            -> builds and publishes to GitHub Packages
                -> npm publish --registry=https://npm.pkg.github.com
```

**Consumption in product repo (`package.json`):**
```json
{
  "dependencies": {
    "@lishavarughese-private/governance": "^1.0.x"
  }
}
```

The product repo also has `.npmrc` to authenticate:
```
@lishavarughese-private:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}
```

---

## PART 3: How Gate Evaluation Works (The Core Architecture)

### Step-by-Step: What Happens When You Run `node scripts/speckit.js gate IMPL`

#### Phase 1: Entry — `speckit.js`

The CLI script is the entry point. It:

1. **Resolves the governance package** — tries `require.resolve("@lishavarughese-private/governance/evaluate-phase")` first, falls back to a local dev path. This is the bridge between product repo and governance rules.

2. **Builds the context (`buildContext`)** — reads ALL relevant artifacts from `spec-kit/` into a single JavaScript object (`ctx`). This is the most critical function. It loads:

   ```
   ctx = {
     spec: { ... },           // Entire SPEC.json object
     requirements: [ ... ],   // spec.requirements[]
     tasks: [ ... ],          // TASKS.json tasks[]
     components: [ ... ],     // PLAN.json architecture.components[]
     impl: { ... },           // Entire IMPL.json object
     files: [ ... ],          // ALL source files from server/ directory scanned in
     source_map: { ... },     // File:line mapping for each artifact ID (for error messages)
     compliance: [ ... ],
     pii_fields: [ ... ],
     encryption: { ... },
     ...
   }
   ```

   The `files[]` array contains `{ path, content }` for every `.js`, `.ts`, `.json`, `.env` file under `server/`. This is how gates like `HG-SEC-01` can scan the actual source code for hardcoded secrets.

3. **Calls `evaluatePhase(phase, ctx)`** from the governance package.

#### Phase 2: Orchestration — `evaluate-phase.js`

This module:

1. **Looks up the phase folder mapping** — determines which gate folders to load:
   ```
   PHASE_FOLDERS = {
     IMPL: ["IMPL", "TASKS", "COMMON"]
   }
   ```
   So for IMPL phase, it runs:
   - All gates in `gates/IMPL/` (HG-IMPL-01 through SG-IMPL-09)
   - All gates in `gates/TASKS/` (HG-TASK-01 through SG-TASK-04) — because TASKS gates also apply in IMPL
   - All gates in `gates/COMMON/` (HG-SEC-01, INFO-TRACE-01) — these run in EVERY phase

2. **Collects unique gate IDs** — deduplicates across folders (a gate ID appears only once)

3. **Evaluates each gate** — calls `evaluateGate(gateId, context)` for each unique gate

4. **Classifies results** — counts results by severity:
   - `hardFailures` — gates with `result !== "PASS"` AND `severity === "HARD"`
   - `softWarnings` — gates with `result !== "PASS"` AND `severity === "SOFT"`
   - `infoReports` — gates with `result !== "PASS"` AND `severity === "INFO"`

5. **Appends source_map locations** — for every failure, it finds the task/requirement/component ID referenced in the reason string and appends the file:line from `ctx.source_map`. Example:
   ```
   Original: "TASK-003 has empty or null maps_to_requirement"
   After:    "TASK-003 has empty or null maps_to_requirement (spec-kit/IMPL.json:47)"
   ```

6. **Determines transition** — if `hardFailures.length === 0`, the transition to the next phase is UNLOCKED. Otherwise BLOCKED.

7. **Returns manifest** — the complete evaluation result:
   ```javascript
   {
     phase: "IMPL",
     evaluated_at: "2025-01-15T10:30:00.000Z",
     transition_allowed: false,
     transition: { from: "IMPL", to: "REVIEW" },
     summary: {
       total_gates: 18,
       passed: 14,
       hard_failures: 2,
       soft_warnings: 2,
       info_reports: 0
     },
     gates: [ /* every gate with result */ ],
     blocking_failures: [ /* only hard failures */ ]
   }
   ```

#### Phase 3: Individual Gate Execution — `gate-evaluator.js`

This module:

1. **`listGatesByPhase(folderName)`** — reads the gate files in a folder, returns array of gate IDs (filename without `.js`)

2. **`evaluateGate(gateId, context)`** — loads the gate module, calls `evaluate(ctx)`, and returns:
   ```javascript
   {
     gate: "HG-SEC-01",
     result: "FAIL",
     reason: "Generic secret assignment found in server\\routes\\bookings.js line 126",
     severity: "HARD",
     gate_name: "Hardcoded Secrets Scanner"
   }
   ```

3. **`getGateMeta(gateId)`** — returns `{ name, severity, constitution_principle }` from the gate module

### How a Gate File Is Structured

Every gate is a JavaScript module with this exact interface:

```javascript
/**
 * HG-SEC-01
 * Phase: ALL (COMMON)
 * Type: HARD
 *
 * Scans source files for hardcoded secrets, credentials, and PII.
 *
 * Pass when:
 *   All scanned files are free of hardcoded API keys, passwords, tokens...
 *
 * Fail if:
 *   Any of the following patterns are found in source files.
 */

"use strict";

const gate_id = "HG-SEC-01";
const name = "Hardcoded Secrets Scanner";
const severity = "HARD";
const constitution_principle = "PRINCIPLE-05";

function evaluate(ctx) {
  // The ctx contains everything: requirements, tasks, files, impl, etc.
  // This gate uses ctx.files[] to scan source code

  const patterns = [
    { regex: /sk_live_|pk_live_/, name: "Stripe Live Key" },
    { regex: /AKIA[0-9A-Z]{16}/, name: "AWS Access Key" },
    { regex: /ghp_[a-zA-Z0-9]{36}/, name: "GitHub Token" },
    { regex: /-----BEGIN RSA PRIVATE KEY-----/, name: "RSA Private Key" },
    { regex: /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/, name: "JWT Token" },
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, name: "Email Address (PII)" },
    { regex: /\b\d{3}-\d{2}-\d{4}\b/, name: "SSN (PII)" },
    { regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/, name: "Credit Card Number" },
    // Generic key=secret assignments (skip process.env)
    { regex: /const\s+\w*(?:SECRET|KEY|PASSWORD|TOKEN|PWD|CREDENTIAL|API_KEY)\w*\s*=\s*["'`][^"'{}\s]+["'`]/i,
      name: "Generic Secret Assignment" }
  ];

  const findings = [];
  for (let f of ctx.files) {
    const lines = f.content.split("\n");
    for (let p of patterns) {
      for (let ln = 0; ln < lines.length; ln++) {
        if (lines[ln].includes("process.env")) continue; // skip env vars
        if (p.regex.test(lines[ln])) {
          findings.push(`${p.name} found in ${f.path} line ${ln + 1}: "${lines[ln].trim().substring(0, 60)}..."`);
        }
      }
    }
  }

  if (findings.length === 0) {
    return pass("No hardcoded secrets or PII found in " + ctx.files.length + " source files.");
  }
  return fail(findings.join("; "));
}

function pass(reason) { return { gate: gate_id, result: "PASS", reason: reason }; }
function fail(reason) { return { gate: gate_id, result: "FAIL", reason: reason }; }

module.exports = { gate_id, name, severity, constitution_principle, evaluate };
```

Every gate follows this contract:
- **`evaluate(ctx)`** receives the full context and returns `{ gate, result, reason }`
- **`pass(reason)` / `fail(reason)`** are helper functions for consistent output
- **`gate_id`, `name`, `severity`, `constitution_principle`** are exported for metadata

---

## PART 4: Running the Demo — IMPL Phase Gates

### Context Setting

We are at the **IMPL (Implementation) phase** of development. All previous phases have passed their respective gates:

| Phase | Status |
|-------|--------|
| ✅ BRIEF | Problem statement accepted |
| ✅ SPEC | Requirements gates passed |
| ✅ PLAN | Architecture gates passed |
| ✅ TASKS | Task definition gates passed |
| 🔴 **IMPL** | **We are here — about to check implementation** |

The transition is: **IMPL → REVIEW**

If all gates pass, this PR is ready for review. If any HARD gates fail, the transition is BLOCKED.

### Step 1: Run the Gate Evaluation

```bash
cd trust-framework
node scripts/speckit.js gate IMPL --html
```

**Command breakdown:**
- `node scripts/speckit.js` — calls the CLI tool
- `gate` — tells it to run gate evaluation
- `IMPL` — specifies the Implementation phase
- `--html` — generates an HTML report file in addition to JSON

### Step 2: What You See in the Terminal Output

```
============================================================
  Speckit Gate Evaluator
============================================================

  Product:     trust-framework
  Phase:       IMPL
  Governance:  local (development)

  Artifacts loaded: 4 requirements, 16 tasks, 5 components
```

This tells us:
- **Product**: `trust-framework` (the car rental API project)
- **Phase**: IMPL (we're checking implementation gates)
- **Governance source**: "local (development)" means it found the governance package locally. In CI, this would say the npm package version.
- **Artifacts loaded**: The evaluator found 4 requirements (from SPEC.json), 16 tasks (from TASKS.json), 5 architecture components (from PLAN.json)

Then the gate results:

```
  Gate Results:
  ----------------------------------------------------------------------
  ✅ HG-IMPL-01       (HARD)   All 4 tests passing
  ✅ HG-IMPL-02       (HARD)   Zero console errors confirmed
  ✅ HG-IMPL-03       (HARD)   Superseded by HG-SEC-01
  ✅ HG-IMPL-04       (HARD)   All 4 requirements covered in implementation
  ✅ HG-IMPL-06       (HARD)   All 16 tasks complete
  ✅ HG-IMPL-07       (HARD)   All 4 deployment checklist items checked
  ✅ HG-IMPL-08       (HARD)   All 16 task acceptance criteria have corresponding test coverage.
  ✅ HG-TASK-01       (HARD)   All 16 tasks mapped to valid requirements
  ✅ HG-TASK-02       (HARD)   All 16 tasks have acceptance criteria
  ✅ HG-TASK-03       (HARD)   All task dependencies reference valid existing tasks
  ✅ HG-TASK-04       (HARD)   All 4 requirements have at least one mapped task
  ✅ HG-TASK-05       (HARD)   All 16 tasks have valid status values
  ✅ SG-TASK-01       (SOFT)   All tasks within size threshold
  ✅ SG-TASK-02       (SOFT)   All task descriptions are clear and detailed
  ✅ SG-TASK-03       (SOFT)   All tasks have effort estimates
  ✅ SG-TASK-04       (SOFT)   All tasks mapped to architecture components
  ✅ INFO-TRACE-01    (INFO)   Traceability report generated with 4 chains and 0 gaps
  ⛔ HG-SEC-01        (HARD)   Generic secret assignment found in
                               server\routes\bookings.js line 126: "const INTERNAL_...
  ⛔ SG-IMPL-04       (SOFT)   Task notes mention bypasses but exceptions_logged is empty
  ⛔ SG-IMPL-09       (SOFT)   10 implementation task(s) missing paired test task
  ----------------------------------------------------------------------
```

**Understanding the gate naming:**
| Prefix | Stands For | Meaning |
|--------|------------|---------|
| `HG-` | **Hard Gate** | Blocking — transition denied if failed |
| `SG-` | **Soft Gate** | Warning — doesn't block but flags concerns |
| `INFO-` | **Information** | Always passes — generates reports |

**Reading a gate result:**
```
⛔ HG-SEC-01        (HARD)   Generic secret assignment found in
                              server\routes\bookings.js line 126: "const INTERNAL_...
```
- `⛔` = FAIL
- `HG-SEC-01` = Security Hard Gate #1
- `(HARD)` = This severity — blocks the phase transition
- The reason tells us exactly what's wrong and where: `bookings.js` line 126 has a hardcoded secret

### Step 3: The Summary Section

```
  Summary:
    Total:     20
    Passed:    17
    Failures:  1 (HARD)
    Warnings:  2 (SOFT)

  1 HARD GATE(S) FAILED
  IMPL -> REVIEW transition is BLOCKED.

  Blocking failures:
    HG-SEC-01 - Generic secret assignment found in server\routes\bookings.js line 126: "const INTERNAL_...
```

**What this means:**
- **20 gates evaluated** total (all phases' applicable gates combined)
- **17 passed** (everything working correctly)
- **1 HARD failure** (HG-SEC-01 — this BLOCKS the transition)
- **2 SOFT warnings** (SG-IMPL-04, SG-IMPL-09 — quality flags, don't block)
- **Transition BLOCKED** — we cannot move to REVIEW until HG-SEC-01 is fixed

**The blocking failure message tells you exactly what to fix:**
> Generic secret assignment found in `server\routes\bookings.js` line 126

### Step 4: Understanding Every Gate in the Results

Here's why each gate exists and what it checks:

#### IMPL Phase Gates (the ones specific to implementation)

| Gate | Type | Why It Exists | What It Checks |
|------|------|---------------|----------------|
| **HG-IMPL-01** | HARD | Ensures code doesn't break existing tests | Checks `test_results[]` — all must have `passed > 0` and none have `failed > 0` |
| **HG-IMPL-02** | HARD | Prevents shipping with console errors | Checks `console_errors` field is explicitly `false` |
| **HG-IMPL-03** | HARD | Superseded — security scanning is done by HG-SEC-01 | Always passes with a note |
| **HG-IMPL-04** | HARD | Ensures every requirement was actually implemented | Checks `requirement_coverage[]` — each requirement must have `status: "covered"` |
| **HG-IMPL-06** | HARD | Prevents unfinished work from being submitted | Checks `task_coverage{}` — every task must have an entry marked `"complete"` |
| **HG-IMPL-07** | HARD | Ensures deployment readiness | Checks `deployment_checklist[]` — all items must be checked/complete |
| **HG-IMPL-08** | HARD | Ensures acceptance criteria are actually tested | Checks that each task's paired test task has a matching test suite result |
| **SG-IMPL-04** | SOFT | Catches bypassed/deferred work that isn't documented | Scans `task_notes{}` for keywords like "temporary", "manual", "bypass", "skip" — if found, expects entries in `exceptions_logged[]` |
| **SG-IMPL-09** | SOFT | Encourages test coverage culture | Each implementation task should have at least one paired test task (type "test" or title containing "Test for") |

#### TASKS Phase Gates (also run in IMPL)

| Gate | Type | Why It Exists | What It Checks |
|------|------|---------------|----------------|
| **HG-TASK-01** | HARD | Prevents orphan tasks with no requirement link | Every task's `maps_to_requirement` must reference a valid requirement ID from SPEC.json |
| **HG-TASK-02** | HARD | Ensures every task has defined done criteria | Every task must have `acceptance_criteria[]` with at least one item |
| **HG-TASK-03** | HARD | Prevents broken dependency chains | Every task's `dependencies[]` must only reference task IDs that exist |
| **HG-TASK-04** | HARD | Ensures requirements don't get lost | Every requirement from SPEC.json must have at least one task mapped to it |
| **HG-TASK-05** | HARD | Ensures consistent task tracking | Every task must have `status` in: todo, in_progress, done, blocked |

| Gate | Type | Why It Exists | What It Checks |
|------|------|---------------|----------------|
| **SG-TASK-01** | SOFT | Prevents oversized tasks | No task's `estimated_effort` should exceed 2 days |
| **SG-TASK-02** | SOFT | Ensures task descriptions are useful | Description must be ≥20 chars and not just restate the title |
| **SG-TASK-03** | SOFT | Ensures estimation discipline | Every task must have `estimated_effort` |
| **SG-TASK-04** | SOFT | Ensures architectural traceability | Every task's `maps_to_component` must reference a real component |

#### SECURITY Gates (run in ALL phases)

| Gate | Type | Why It Exists | What It Checks |
|------|------|---------------|----------------|
| **HG-SEC-01** | HARD | Prevents shipping secrets, tokens, or PII in source code | Scans ALL source files (`server/` directory) for hardcoded API keys (Stripe live, AWS, GitHub), private keys, JWT tokens, emails, SSNs, credit card numbers, and generic `const SECRET = "..."` patterns |
| **INFO-TRACE-01** | INFO | Provides traceability documentation | Generates a report linking requirements → tasks → components with coverage status |

#### How HG-SEC-01 Works (Deep Dive Example)

The gate defines regex patterns for each security concern:

```javascript
const patterns = [
  { regex: /sk_live_|pk_live_/,                name: "Stripe Live Key" },
  { regex: /AKIA[0-9A-Z]{16}/,                  name: "AWS Access Key" },
  { regex: /ghp_[a-zA-Z0-9]{36}/,               name: "GitHub Token" },
  { regex: /const\s+\w*SECRET\w*\s*=\s*["'`][^"'{}\s]+["'`]/i, name: "Generic Secret" },
  // ... more patterns
];
```

For each source file in `ctx.files[]`, it:
1. Splits the file into lines
2. Tests each line against every pattern
3. Skips lines containing `process.env` (environment variables are acceptable)
4. Reports the exact file path and line number of each finding

The gate returns `FAIL` with ALL findings joined by semicolons.

---

## PART 5: CI Integration — Gates Run Automatically on PR

### GitHub Actions Workflow

When you push to a PR on `main`, the workflow in `.github/workflows/speckit-ci.yml` triggers:

1. **Checkout code** — pulls the PR branch
2. **Set up Node.js** — v20
3. **Configure npm** — sets up GitHub Packages registry auth
4. **Install dependencies** — `npm ci` (installs the governance package)
5. **Run gate evaluation** — `node scripts/speckit.js gate --auto --html`
   - `--auto` detects the current phase (checks for `IMPL.json` → `TASKS.json` → `PLAN.json` → `SPEC.json`)
   - `--html` generates the HTML report
   - The exit code is captured (0 = all pass, 1 = hard failure)
6. **Upload reports as artifacts** — JSON + HTML reports saved for 90 days
7. **Post PR comment** — uses `actions/github-script@v7` to:
   - Read the JSON report from `ci-reports-tmp/`
   - Format the results as a GitHub comment
   - Update existing comment if there's already one (no spam)
8. **Fail the job** — if any hard gate failed, the CI step exits with code 1

### The PR Comment

The workflow posts a formatted comment like this:

```
##  Spec-Kit Gate Report

### IMPL Phase: BLOCKED
> 17/20 gates passed | 1 HARD failures | 2 SOFT warnings

**Failed gates:**

| Gate | Severity | Reason |
|------|----------|--------|
| `HG-SEC-01` | HARD | Generic secret assignment found in server\routes\bookings.js line 126... |
| `SG-IMPL-04` | SOFT | Task notes mention bypasses but exceptions_logged is empty |
| `SG-IMPL-09` | SOFT | 10 implementation task(s) missing paired test task |

---

### Merge BLOCKED - fix hard gate failures and push again.

View full HTML report: https://github.com/.../actions/runs/...

Generated by Spec-Kit CI
```

### The HTML Report

The `--html` flag generates a full HTML report saved as an artifact. It includes:
- Summary box (total, passed, failures, warnings, transition status)
- Full table of all gates with status icons, severity, result, and reasons
- Blocking failures section (if any)
- Downloadable from GitHub Actions Artifacts

---

## PART 6: Demo Walkthrough Script

### Setup

```bash
# Show the two repos
ls trust-framework/spec-kit/
# → BRIEF.md  SPEC.json  PLAN.json  TASKS.json  IMPL.json

ls trust-framework-governance/governance/gates/IMPL/
# → HG-IMPL-01.js  HG-IMPL-02.js  ... SG-IMPL-09.js
```

### Narrate

> "We're developing a car rental booking API. We've gone through the specification, architecture, and task planning phases. Now we're about to submit our implementation for review. Before we do, the Spec-Kit governance system runs a set of Hard Gates to validate our work.
>
> These gates check everything — are all tests passing? Is there any hardcoded secret in the source code? Are all requirements covered? Are all tasks marked complete? If any Hard Gate fails, our code cannot move to the REVIEW phase and our PR cannot be merged."

### Run the Gate

```bash
node scripts/speckit.js gate IMPL --html
```

### Walk Through Results

> "The gate evaluator loaded our artifacts — 4 requirements, 16 tasks, 5 architecture components — and ran 20 gates across them.
>
> 17 passed. 1 Hard gate failed — HG-SEC-01. This is the security scanner that checks for hardcoded secrets. It found a generic secret assignment in bookings.js at line 126.
>
> 2 Soft warnings — SG-IMPL-04 flags that we have task notes mentioning bypasses but no documented exceptions. SG-IMPL-09 notes that 10 tasks don't have paired test tasks. These don't block the merge but are quality flags.
>
> The transition is BLOCKED. We need to fix that hardcoded secret before we can proceed."

### Show the CI Comment

Navigate to the PR on GitHub and show:
1. The **Spec-Kit Gate Report** comment that was posted automatically
2. The **Actions tab** showing the workflow run
3. The **Artifacts section** where the HTML report can be downloaded

---

## PART 7: Summary — Key Takeaways

1. **Two repos**: Governance rules are separate from product code — published as an npm package
2. **Phase-based gates**: Each development phase (SPEC → PLAN → TASKS → IMPL → REVIEW) has its own set of gates that validate the artifacts before moving forward
3. **Three severity levels**: HARD (blocks transition), SOFT (quality warnings), INFO (informational reports)
4. **HARD gates block merge**: If any hard gate fails in CI, the PR comment shows exactly what to fix and the CI job fails
5. **Gates have access to everything**: They can read JSON artifacts, scan source files, check test results — the context object includes all project data
6. **Source mapping**: Failure messages include exact file:line locations so developers know where to fix
7. **CI integrated**: Gates run automatically on every PR push — no manual steps needed
