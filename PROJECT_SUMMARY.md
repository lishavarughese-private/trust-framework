# 📘 Project Summary — Car Reservation App
> A complete record of what was built, how it was built, and why every decision was made.

---

## Table of Contents
1. [What This Project Is](#1-what-this-project-is)
2. [The Process — Spec-Kit](#2-the-process--spec-kit)
3. [Phase-by-Phase Walkthrough](#3-phase-by-phase-walkthrough)
4. [Repository Structure](#4-repository-structure)
5. [File-by-File Reference](#5-file-by-file-reference)
6. [Governance & Rules](#6-governance--rules)
7. [CI/CD Pipeline](#7-cicd-pipeline)
8. [Technology Stack](#8-technology-stack)
9. [Data & Privacy](#9-data--privacy)
10. [Lessons Learned & Process Fixes Applied](#10-lessons-learned--process-fixes-applied)

---

## 1. What This Project Is

A **Car Reservation Web Application** that allows tourists to:
- Browse a paginated list of available cars (no account required)
- Select a rental start and end date
- Submit a booking with their name and email
- Request permanent deletion of their personal data (GDPR)

No payments, no authentication, no inventory management. Those are explicitly out of scope.

---

## 2. The Process — Spec-Kit

Spec-Kit is a **structured, gate-checked development governance framework** that runs entirely
inside the repository. It does not write code first. It forces every project through a series
of documented phases, each with soft gates (warnings) and hard gates (blockers), before
a single line of application code is written.

### Core Principle
> **The spec is the truth. Plans trace to the spec. Tasks trace to the plan. Code traces to the tasks.**

No phase can be skipped. No gate can be bypassed without a documented exception. The AI agent
cannot make unilateral decisions on technology, architecture, or compliance — it must follow
the rules defined in `CONSTITUTION.md`.

### Phase Order
```
SPECIFY → PLAN → TASKS → IMPLEMENT → PR → CI → LEAD ACK → MERGE → DEPLOY
```

Each phase has:
- A **command** (e.g. `/speckit.specify`) that the AI agent executes
- An **input artifact** (e.g. `BRIEF.md`)
- An **output artifact** (e.g. `SPEC.json`)
- A **soft gate** (warnings — non-blocking)
- A **hard gate** (blockers — must pass before next phase unlocks)

---

## 3. Phase-by-Phase Walkthrough

### Phase 0 — SETUP
**What happened:** The Spec-Kit framework was installed into the repository.
This created the folder structure, gate files, command files, and governance documents.
No project-specific content was written yet.

---

### Phase 1 — SPECIFY
**Command:** `/speckit.specify`
**Input:** `spec-kit/BRIEF.md` (plain English project description)
**Output:** `spec-kit/SPEC.json`

The SPECIFY phase transforms a plain English brief into a structured, machine-readable
specification. It forces the author to define:
- Requirements with measurable acceptance criteria
- Personas with pain points
- PII fields and encryption strategy
- Compliance obligations (GDPR)
- Success metrics
- Risks with mitigations
- Out-of-scope items

**Violations found and fixed:**

| Violation | Type | Fix Applied |
|-----------|------|-------------|
| `encryption` block was empty despite PII declared | Hard gate | Filled AES-256 + TLS 1.2+ + KMS |
| GDPR declared but no deletion requirement existed | Hard gate | Added REQ-004 (right to erasure) |
| REQ-002 had no acceptance criteria | Hard gate | Added 4 specific, measurable criteria |
| REQ-003 had a pre-checked consent box (deceptive UI) | Hard gate | Replaced with proper booking submission |
| Ambiguous words: "easily", "simple", "fast" | Soft gate | Replaced with measurable language |
| Persona "Tourist" had no pain points | Soft gate | Added 4 specific pain points |
| `success_metrics[]` was empty | Soft gate | Added 6 measurable metrics |
| `risks[]` was empty | Soft gate | Added 3 risks with severities and mitigations |

**Final requirements:**
| ID | Type | Description |
|----|------|-------------|
| REQ-001 | Functional | User can browse a paginated list of cars without an account |
| REQ-002 | Functional | User can select a valid start and end date |
| REQ-003 | Functional | User can submit a booking |
| REQ-004 | Compliance | Users can request GDPR right-to-erasure |

---

### Phase 2 — PLAN
**Command:** `/speckit.plan`
**Input:** `spec-kit/SPEC.json`
**Output:** `spec-kit/PLAN.json`

The PLAN phase transforms the approved spec into a technical blueprint.

> ⚠️ **Process issue identified and fixed during this phase:**
> The AI agent populated the tech stack without asking the user first.
> This violated the principle that humans — not AI — make technology decisions.
> The fix was applied to `speckit.plan.md` and `CONSTITUTION.md §2.6` to require
> a mandatory human confirmation step before any tech stack is written.
> The user approved the suggested stack retrospectively.

**What was defined:**
- 5 architecture components (Frontend, API Server, Database, Secrets Manager, Data Deletion Service)
- Full tech stack with explicit versions
- 9 versioned dependencies
- 4 API definitions mapping to each requirement
- 3 data models (Car, Booking, DeletionRequest)
- 10 traceability entries (every requirement → component)
- 3 database migrations with up/down scripts
- Rollback strategy, backward compatibility statement, state hydration plan

---

### Phase 3 — TASKS
**Command:** `/speckit.tasks`
**Input:** `spec-kit/PLAN.json`
**Output:** `spec-kit/TASKS.json`

The TASKS phase breaks the plan into 13 individual, sequenced work items.
Each task has:
- A unique ID
- A clear description
- Mapped requirement ID
- Mapped component ID
- Specific acceptance criteria
- Dependencies on other tasks
- An effort estimate

**Task execution order (dependency graph):**
```
TASK-001 (DB: cars)
  └─ TASK-002 (DB: bookings)
       ├─ TASK-003 (DB: deletion_requests)
       │    └─ TASK-011 (deletion service)
       │         └─ TASK-012 (DELETE /api/users/data)
       │              └─ TASK-013 (GDPR UI)
       └─ TASK-008 (KMS helper)
            └─ TASK-009 (POST /api/bookings)
  └─ TASK-004 (GET /api/cars)
       └─ TASK-005 (car listing UI)
            └─ TASK-010 (booking form UI) ←─┐
TASK-006 (validate-dates API)              │
  └─ TASK-007 (date picker UI) ────────────┘
```

---

### Phase 4 — IMPLEMENT
**Command:** `/speckit.implement`
**Input:** `spec-kit/TASKS.json`
**Output:** Application code + `spec-kit/IMPL.md`

All 13 tasks were implemented in dependency order. For every task:
- Source files were created
- Tests were written covering every acceptance criterion
- IMPL.md was updated with task status, files modified, and test results
- No hardcoded secrets
- No PII in logs
- Error handling on every route and service

**32 tests written. 32 tests passing. 0 exceptions taken.**

---

### Phase 5 — CI (Post-PR)
**Not yet triggered** — runs automatically when a PR is opened against `main`.

The CI pipeline (`speckit-ci.yml`) will:
1. Run the full test suite
2. Run `speckit-trace.js` to cross-check spec artifacts against code and test results
3. Run 5 hard gate checks (block merge on failure)
4. Run 3 soft gate checks (warn + require Lead approval)
5. Post a structured report as a PR comment

---

## 4. Repository Structure

```
/
├── CONSTITUTION.md              # Org-wide governance rules (highest authority)
├── PSTABLE.md                   # Phase & state reference table
├── PROJECT_SUMMARY.md           # This file
├── package.json                 # Node.js dependencies and scripts
├── vitest.config.js             # Test runner configuration
│
├── spec-kit/                    # All Spec-Kit artifacts
│   ├── BRIEF.md                 # Original plain English project brief
│   ├── SPEC.json                # Approved specification (APPROVED)
│   ├── PLAN.json                # Approved technical plan (APPROVED)
│   ├── TASKS.json               # Approved task breakdown (APPROVED)
│   └── IMPL.md                  # Implementation log (COMPLETE)
│
├── gates/                       # Gate rule definitions for each phase
│   ├── specify/
│   │   ├── SPECIFY_SOFT_GATE.md
│   │   └── SPECIFY_HARD_GATE.md
│   ├── plan/
│   │   ├── PLAN_SOFT_GATE.md
│   │   └── PLAN_HARD_GATE.md
│   ├── tasks/
│   │   ├── TASKS_SOFT_GATE.md
│   │   └── TASKS_HARD_GATE.md
│   ├── implement/
│   │   ├── IMPLEMENT_SOFT_GATE.md
│   │   └── IMPLEMENT_HARD_GATE.md
│   └── ci/
│       ├── CI_HARD_GATE.md
│       └── CI_SOFT_GATE.md
│
├── .continue/
│   └── commands/                # AI agent command definitions
│       ├── speckit.specify.md
│       ├── speckit.plan.md
│       ├── speckit.tasks.md
│       ├── speckit.implement.md
│       └── speckit.ci.md
│
├── .github/
│   └── workflows/
│       └── speckit-ci.yml       # GitHub Actions CI pipeline
│
├── scripts/
│   └── speckit-trace.js         # Traceability checker (used by CI)
│
├── server/                      # Express API (Node.js backend)
│   ├── index.js                 # App entry point
│   ├── db.js                    # Database connection singleton
│   ├── knexfile.js              # Knex DB config (dev + prod)
│   ├── lib/
│   │   └── kms.js               # AWS KMS encryption helper
│   ├── middleware/
│   │   └── errorHandler.js      # Central error handler
│   ├── routes/
│   │   ├── cars.js              # GET /api/cars
│   │   ├── bookings.js          # POST /api/bookings/validate-dates + POST /api/bookings
│   │   └── users.js             # DELETE /api/users/data
│   ├── services/
│   │   └── deletionService.js   # GDPR erasure logic
│   ├── migrations/
│   │   ├── 001_create_cars.js
│   │   ├── 002_create_bookings.js
│   │   └── 003_create_deletion_requests.js
│   └── __tests__/
│       ├── cars.test.js
│       ├── bookings.test.js
│       ├── kms.test.js
│       └── deletionService.test.js
│
├── pages/                       # Next.js pages (frontend)
│   ├── index.jsx                # Car listing page
│   ├── book.jsx                 # Booking form page
│   └── gdpr.jsx                 # GDPR data deletion page
│
└── components/                  # Shared React components
    ├── CarList.jsx              # Car grid with availability badges
    ├── DatePicker.jsx           # Date range picker with validation
    └── LoadingSkeleton.jsx      # Loading state skeleton
```

---

## 5. File-by-File Reference

### Governance Files

| File | Purpose |
|------|---------|
| `CONSTITUTION.md` | The highest authority in the project. Defines all org-wide rules, gate definitions, security requirements, compliance obligations, and escalation paths. Overrides all project-level rules. Currently at V1.3. |
| `PSTABLE.md` | The Phase & State Table. Defines every phase, its command, input artifact, output artifact, gate folder, and phase state rules. The source of truth for what phase the project is in. |

### Spec-Kit Artifacts

| File | Status | Purpose |
|------|--------|---------|
| `spec-kit/BRIEF.md` | — | The original plain English description of the project. The starting point for everything. |
| `spec-kit/SPEC.json` | APPROVED | The structured specification. Contains requirements with acceptance criteria, personas, PII fields, encryption config, GDPR compliance, risks, success metrics, and out-of-scope items. |
| `spec-kit/PLAN.json` | APPROVED | The technical blueprint. Contains architecture components, tech stack, dependencies, API definitions, data models, traceability, and the full database migration plan including rollback strategy. |
| `spec-kit/TASKS.json` | APPROVED | 13 work items derived from the plan. Each task maps to a requirement and a component, has acceptance criteria, dependencies, and an effort estimate. |
| `spec-kit/IMPL.md` | COMPLETE | The implementation log. Records every task's completion status, files modified, test results, exceptions, and the deployment checklist. |

### Gate Files

| File | Purpose |
|------|---------|
| `gates/specify/SPECIFY_SOFT_GATE.md` | Soft gate rules for the SPECIFY phase. Checks for ambiguous language, missing persona details, missing success metrics, missing risks. Produces warnings only. |
| `gates/specify/SPECIFY_HARD_GATE.md` | Hard gate rules for the SPECIFY phase. Checks for PII without encryption, GDPR violations, deceptive UI patterns, missing acceptance criteria. Blocks phase if failed. |
| `gates/plan/PLAN_SOFT_GATE.md` | Soft gate rules for the PLAN phase. Checks for scope creep, over-engineering, missing diagrams, large data volume risk, downtime risk. |
| `gates/plan/PLAN_HARD_GATE.md` | Hard gate rules for the PLAN phase. Checks for missing dependencies, version drift, missing rollback strategy, missing backward compatibility. Blocks phase if failed. |
| `gates/tasks/TASKS_SOFT_GATE.md` | Soft gate rules for the TASKS phase. Checks for tasks that are too large, unclear descriptions, missing estimates. |
| `gates/tasks/TASKS_HARD_GATE.md` | Hard gate rules for the TASKS phase. Checks that every task maps to a valid requirement, has acceptance criteria, and that all requirements are covered. |
| `gates/implement/IMPLEMENT_SOFT_GATE.md` | Soft gate rules for the IMPLEMENT phase. Checks for performance issues, UI inconsistencies, missing inline comments. |
| `gates/implement/IMPLEMENT_HARD_GATE.md` | Hard gate rules for the IMPLEMENT phase. Checks for failing tests, console errors, security violations, missing requirement coverage, missing error handling. |
| `gates/ci/CI_HARD_GATE.md` | Hard gate rules for the CI phase (post-PR). Defines the 5 checks that block merge: test coverage gaps, missing implementations, broken spec traceability, regressions, broken spec contracts. |
| `gates/ci/CI_SOFT_GATE.md` | Soft gate rules for the CI phase. Defines the 3 checks that warn and require Lead approval: unpaired test tasks, missing coverage config, impl-to-test ratio exceeding 3:1. |

### AI Agent Commands

| File | Purpose |
|------|---------|
| `.continue/commands/speckit.specify.md` | Instructions for the AI on how to run the SPECIFY phase. Loads BRIEF.md, populates SPEC.json, runs both gates. |
| `.continue/commands/speckit.plan.md` | Instructions for the AI on how to run the PLAN phase. **Includes mandatory human confirmation step for tech stack before any artifact is written.** |
| `.continue/commands/speckit.tasks.md` | Instructions for the AI on how to run the TASKS phase. Includes rollback strategy guard — DB tasks cannot be generated without a defined rollback strategy. |
| `.continue/commands/speckit.implement.md` | Instructions for the AI on how to run the IMPLEMENT phase. Executes tasks in dependency order, writes code, updates IMPL.md. |
| `.continue/commands/speckit.ci.md` | Instructions for the AI to validate the CI setup is complete and correctly wired before the first PR is opened. |

### Backend — Server

| File | Purpose |
|------|---------|
| `server/index.js` | Express app entry point. Registers all routes, applies security headers, enforces HTTPS redirect in production, registers the central error handler. |
| `server/db.js` | Database connection singleton using Knex. Reads environment variables for connection config. Single instance shared across all routes. |
| `server/knexfile.js` | Knex configuration for development and production environments. Production enforces SSL. |
| `server/lib/kms.js` | AWS KMS encryption/decryption helper. `encrypt(value)` returns a BYTEA-compatible Buffer. `decrypt(buffer)` returns the original plaintext. Keys loaded from `KMS_KEY_ARN` env variable only — never hardcoded. No PII ever logged. |
| `server/middleware/errorHandler.js` | Central Express error handler. Suppresses stack traces in production. Logs sanitised error messages only (no PII). Returns 500 for unexpected errors, preserves status codes for known errors. |
| `server/routes/cars.js` | `GET /api/cars` — Returns paginated car list. Query params validated with Zod. Returns `{ cars, total, page }`. |
| `server/routes/bookings.js` | `POST /api/bookings/validate-dates` — Server-side date range validation. `POST /api/bookings` — Creates a booking, encrypts PII before insert, validates all inputs with Zod. |
| `server/routes/users.js` | `DELETE /api/users/data` — GDPR erasure endpoint. Accepts email, invokes deletion service, returns confirmation. No PII logged at any point. |
| `server/services/deletionService.js` | Core GDPR erasure logic. Encrypts the email to match stored BYTEA values, deletes all matching bookings in a transaction, inserts a `deletion_requests` record with SHA-256 hash only. Permanently irreversible. |

### Backend — Migrations

| File | Purpose |
|------|---------|
| `server/migrations/001_create_cars.js` | Creates the `cars` table. Columns: `id`, `name`, `type`, `availability_status`. Idempotent. Includes `down` script. |
| `server/migrations/002_create_bookings.js` | Creates the `bookings` table. `email` and `name` are `BYTEA` — encrypted at rest. Foreign key to `cars.id`. Idempotent. Includes `down` script. |
| `server/migrations/003_create_deletion_requests.js` | Creates the `deletion_requests` table. Stores only SHA-256 hash of email — no PII. Tracks GDPR erasure audit trail. Idempotent. Includes `down` script. |

### Backend — Tests

| File | Purpose |
|------|---------|
| `server/__tests__/cars.test.js` | Tests for `GET /api/cars`. Covers: correct fields returned, pagination, 400 for invalid params, 500 without stack trace on DB error. |
| `server/__tests__/bookings.test.js` | Tests for `POST /api/bookings/validate-dates` and `POST /api/bookings`. Covers: valid/invalid date ranges, PII encryption called, field-level errors, 404 for unknown car, server-side date validation, 500 without stack trace. |
| `server/__tests__/kms.test.js` | Tests for the KMS helper. Covers: encrypt returns Buffer, key loaded from env not hardcoded, no PII logged during encrypt or decrypt, decrypt returns original plaintext, round-trip. |
| `server/__tests__/deletionService.test.js` | Tests for the deletion service and DELETE endpoint. Covers: SHA-256 hash correctness, case-insensitivity, no PII in hash output, deletion called, audit record created, no PII logged, 400 for invalid email, 500 without stack trace. |

### Frontend — Pages

| File | Purpose |
|------|---------|
| `pages/index.jsx` | Car listing page. Fetches `GET /api/cars` with pagination. Shows `LoadingSkeleton` while loading, `CarList` when loaded, empty state if no cars. Handles API errors with a banner. |
| `pages/book.jsx` | Booking form page. Integrates `DatePicker`, email/name inputs, and submits to `POST /api/bookings`. Submit button disabled until all fields valid. Shows confirmation screen within 1 second of success. Field-level error messages. |
| `pages/gdpr.jsx` | GDPR data deletion page. Email input + submit. Calls `DELETE /api/users/data`. Shows confirmation screen. Field-level error on invalid email. Explicit warning that deletion is permanent. |

### Frontend — Components

| File | Purpose |
|------|---------|
| `components/CarList.jsx` | Renders a responsive grid of `CarCard` components. Each card shows name, type, and an availability badge. Available cars have a "Book this car" link. Handles empty state. |
| `components/DatePicker.jsx` | Controlled date range picker. Disables past start dates. Disables end dates before the selected start date. Inline error message shown within 300ms of an invalid selection. Fully accessible with aria labels. |
| `components/LoadingSkeleton.jsx` | Animated skeleton placeholder shown while API calls are in flight. Prevents UI flicker. Uses CSS animation. Screen-reader accessible via `sr-only` text. |

### CI/CD

| File | Purpose |
|------|---------|
| `.github/workflows/speckit-ci.yml` | GitHub Actions workflow. Triggers on every PR to `main`. Job 1 runs the test suite and saves `test-report.json`. Job 2 runs `speckit-trace.js`, posts a structured PR comment, applies/removes `needs-lead-review` label, saves the baseline test report after a clean run, and exits 1 if any hard gate fails. |
| `scripts/speckit-trace.js` | Node.js traceability script. Reads `SPEC.json`, `TASKS.json`, `PLAN.json`, and `IMPL.md`. Runs all 5 CI hard gate checks and 3 CI soft gate checks. Produces JSON reports in `ci-reports/`. Saves a baseline test report after a passing run for future regression detection. Exits with code 1 if any hard gate fails. |

---

## 6. Governance & Rules

### CONSTITUTION.md — Key Rules

| Section | Rule |
|---------|------|
| §2.2 | Specs define the truth. All code must trace back to the spec. |
| §2.6 | AI agents MUST NOT decide tech stack, libraries, or infrastructure. They may suggest. Humans confirm. |
| §4.1 | Soft gates produce warnings, never blocks. Post-PR soft gate warnings require Lead acknowledgement. |
| §4.2 | Hard gates block the next phase entirely until fixed. Post-PR hard gates block merge AND deployment. |
| §5.2 | All PII must be encrypted at rest (AES-256) and in transit (TLS 1.2+). Keys never stored with data. |
| §5.3 | Logs must never contain PII, tokens, or secrets. |
| §5.6 | Pre-checked consent boxes are forbidden. "Agree only" flows are forbidden. |
| §7.5 | All schema changes classified as additive/mutative/destructive. DB tasks forbidden without rollback strategy. |
| §7.6 | CI hard gates block merge and deployment. CI soft gates require Lead approval. |

### Gate Summary

| Phase | Soft Gates | Hard Gates |
|-------|-----------|-----------|
| SPECIFY | Ambiguous language, missing metrics, missing risks | PII without encryption, GDPR violation, deceptive UI, missing AC |
| PLAN | Scope creep, over-engineering, missing diagrams | Missing dependencies, missing rollback strategy, missing backward compat |
| TASKS | Tasks too large, unclear descriptions | Tasks not mapped to requirements, missing AC, missing full coverage |
| IMPLEMENT | Performance issues, UI inconsistencies | Failing tests, console errors, security violations, missing coverage |
| CI | Unpaired test tasks, missing coverage config, ratio > 3:1 | No test coverage for AC, missing implementation, regressions, broken contracts |

---

## 7. CI/CD Pipeline

### How It Works
```
Developer opens PR → main
        ↓
GitHub Actions: speckit-ci.yml triggers
        ↓
Job 1 — Run Tests
  npm ci → vitest run → ci-reports/test-report.json
        ↓
Job 2 — Spec-Kit Gates
  node scripts/speckit-trace.js
        ↓
  ┌─────────────────────────────────────────┐
  │  5 Hard Gate Checks                     │
  │  HG-CI-01: Every AC has a test          │
  │  HG-CI-02: Every task implemented       │
  │  HG-CI-03: Every requirement covered    │
  │  HG-CI-04: No regressions               │
  │  HG-CI-05: No broken spec contracts     │
  └─────────────────────────────────────────┘
        ↓ Any FAIL → exit 1
  ⛔ Branch protection blocks merge
  ⛔ Deployment pipeline blocked
  📝 PR comment posted with failure details
        ↓ All PASS
  ┌─────────────────────────────────────────┐
  │  3 Soft Gate Checks                     │
  │  SG-CI-01: Impl tasks have paired tests │
  │  SG-CI-02: Coverage config declared     │
  │  SG-CI-03: Impl:test ratio ≤ 3:1       │
  └─────────────────────────────────────────┘
        ↓ Any WARN
  ⚠️  needs-lead-review label applied
  👤 CODEOWNERS notifies Team Lead
  🔐 Lead approval required before merge
        ↓ No warnings
  ✅ Merge permitted
```

### Manual Setup Required
Two steps must be configured manually in GitHub (cannot be automated):

1. **Branch protection:** Settings → Branches → Branch protection rules → `main`
   - Required status check: `Spec-Kit CI Gates / Spec-Kit CI Gates`
   - Require branches to be up to date: ✅

2. **CODEOWNERS:** Create `.github/CODEOWNERS`:
   ```
   spec-kit/   @your-team-lead
   scripts/    @your-team-lead
   ```

---

## 8. Technology Stack

| Layer | Technology | Version | Why |
|-------|-----------|---------|-----|
| Frontend framework | Next.js | 14.1.0 | SSR, routing, and page rendering |
| UI library | React | 18.2.0 | Component model |
| Backend runtime | Node.js | 20.11.0 | LTS, well-supported |
| API framework | Express | 4.18.2 | Lightweight REST API |
| Database | PostgreSQL | 16.2 | Relational, strong ACID guarantees |
| Query builder / migrations | Knex | 3.1.0 | SQL query builder with migration support |
| Input validation | Zod | 3.22.4 | Schema validation for all API inputs |
| Key management | AWS KMS | 3.540.0 | PII column encryption keys — never co-located with data |
| Test runner | Vitest | 1.3.1 | Fast, ESM-native, compatible with React |

> ⚠️ **Note:** This stack was selected by the AI agent without consulting the user during the PLAN phase.
> This was identified as a process violation. `CONSTITUTION.md §2.6` and `speckit.plan.md` were updated
> to require mandatory human confirmation of all tech choices before any artifact is written.
> The user reviewed and approved this stack retrospectively.

---

## 9. Data & Privacy

### PII Fields
| Field | Where stored | Protection |
|-------|-------------|-----------|
| `email` | `bookings.email` | AES-256 encrypted via AWS KMS, stored as BYTEA |
| `name` | `bookings.name` | AES-256 encrypted via AWS KMS, stored as BYTEA |

### What Is Never Stored
- Plaintext email or name in any database column
- PII in any log file
- Encryption keys in the database or codebase
- Payment information (out of scope)

### GDPR Compliance
| Obligation | Implementation |
|-----------|---------------|
| Right to erasure (Art. 17) | `DELETE /api/users/data` → `deletionService.js` permanently deletes all matching bookings |
| Deletion audit trail | `deletion_requests` table stores SHA-256 email hash + timestamp (no PII) |
| Encryption at rest | AES-256 via AWS KMS on all PII columns |
| Encryption in transit | TLS 1.2+ enforced via HTTPS redirect in production |
| No pre-checked consent | Confirmed in spec and implementation — forbidden by CONSTITUTION.md §5.6 |

---

## 10. Lessons Learned & Process Fixes Applied

### Fix 1 — Tech Stack Must Be Human-Confirmed
**Problem:** The AI populated `tech_stack[]` in PLAN.json without asking the user.
**Fix:** `speckit.plan.md` now has a mandatory STOP before tech stack is written.
The AI must present suggestions and wait for explicit human confirmation.
**Where:** `CONSTITUTION.md §2.6`, `.continue/commands/speckit.plan.md Step 3`

### Fix 2 — Post-PR CI Gates
**Problem:** The original workflow ended at DEPLOY with no automated enforcement on PRs.
Any developer could theoretically write code that breaks the spec and merge it.
**Fix:** A full CI phase was added with 5 hard gates (block merge) and 3 soft gates
(warn + require Lead approval). Enforced by GitHub Actions + branch protection rules.
**Where:** `CONSTITUTION.md §7.6`, `gates/ci/`, `scripts/speckit-trace.js`,
`.github/workflows/speckit-ci.yml`

### Fix 3 — Deceptive UI Pattern Caught Early
**Problem:** The original SPEC.json described a pre-checked consent checkbox that
users could not uncheck. This is a GDPR violation and a deceptive UI pattern.
**Fix:** Caught by hard gate HG-SPEC-07 in the SPECIFY phase before any code was written.
REQ-003 was rewritten with proper acceptance criteria.
**Where:** `spec-kit/SPEC.json REQ-003`, `CONSTITUTION.md §5.6`

### Fix 4 — GDPR Deletion Requirement Added
**Problem:** The original SPEC.json declared GDPR compliance but contained no requirement
for data retention or user deletion.
**Fix:** REQ-004 (right to erasure) was added with 5 acceptance criteria.
RISK-002 and RISK-003 were added to risks[].
**Where:** `spec-kit/SPEC.json REQ-004`, `spec-kit/RISKS`

---

*Generated by Spec-Kit at the end of the IMPLEMENT phase.*
*Project version: 1.0 | Constitution version: V1.3 | PSTABLE version: 1.2*
