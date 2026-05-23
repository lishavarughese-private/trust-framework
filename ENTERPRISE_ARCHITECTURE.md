# Spec-Kit Enterprise Architecture
> How Spec-Kit integrates with Jira, Dev, QA, and governance across an enterprise.

---

## 1. Repository Architecture

```
┌──────────────────────────┐
│   GLOBAL SPEC-KIT REPO   │
│  (Constitution + Gates)  │
└───────────┬──────────────┘
            │
            │ Inherits rules
            ▼
┌──────────────────────────────────────┐
│   PRODUCT SPEC-KIT REPO (per team)   │
│  BRIEF → SPEC → PLAN → TASKS → IMPL  │
└───────────┬──────────────┬───────────┘
            │              │
            ▼              ▼
┌──────────────────┐   ┌───────────────────┐
│   DEV REPO       │   │   QA REPO         │
│  (Code + CI/CD)  │   │  (Tests + CI/CD)  │
└────────┬─────────┘   └────────┬──────────┘
         │                      │
         ▼                      ▼
┌────────────────┐      ┌──────────────────┐
│    JIRA        │      │      AHA!         │
│ Stories/Tasks  │      │  Features/Epics  │
└────────────────┘      └──────────────────┘
```

### What Each Repo Owns

| Repo | Owns | Governed By |
|------|------|-------------|
| Global Spec-Kit | CONSTITUTION.md, core gates, security rules, compliance rules | Governance Board |
| Product Spec-Kit | BRIEF, SPEC, PLAN, TASKS, IMPL, local gate extensions | Product Tech Lead |
| Dev Repo | Application code, migrations, CI/CD pipeline | Engineering Team |
| QA Repo | Test suites, regression tests, QA CI/CD | QA Team |
| Jira | Stories, tasks, bugs, epics | Product + Engineering |
| Aha! | Features, epics, roadmap items | Product Management |

---

## 2. Full Workflow — With Gates, Jira Tasks, QA Bugs, and Regression

```
BRIEF.md
    │
    ▼
/speckit.specify
    │
    ├── Soft Gates         (AI — ambiguous language, missing metrics)
    ├── Hard Gates         (AI — PII, GDPR, deceptive UI, missing AC)
    ├── Jira Gates         (Epic approved and linked in Aha?)
    ├── Compliance Gates   (PII classified, encryption defined)
    └── Human Gates        (optional — product owner sign-off)
    │
    ▼
SPEC.json (APPROVED)
    │
    ▼
/speckit.plan
    │
    ├── Dependency Gates        (all libraries versioned)
    ├── Jira Story Mapping      (requirements linked to epics)
    ├── Architecture Gates      (components defined, rollback strategy)
    └── Human Architect Sign-off
    │
    ▼
PLAN.json (APPROVED)
    │
    ▼
/speckit.tasks
    │
    ├── Jira Story Creation Gate    (tasks auto-created or validated in Jira)
    ├── Jira Story Validation Gate  (each task maps to a Jira story)
    ├── Acceptance Criteria Gate    (every task has testable AC)
    └── Requirement Coverage Gate   (every REQ has at least one task)
    │
    ▼
TASKS.json (APPROVED — links to Jira stories)
    │
    ▼
/speckit.implement
    │
    ├── Dev Repo Code Gate        (code exists for every task)
    ├── QA Repo Test Gate         (tests exist for every AC)
    ├── Lint / SAST / Coverage    (quality and security scans pass)
    ├── Regression Gate           (new REQ? full cycle must re-run)
    ├── Jira Bug Gate             (no open blocking bugs for this scope)
    └── Human QA Approval Gate    (QA lead signs off)
    │
    ▼
IMPL.md (COMPLETE)
    │
    ▼
RELEASE
```

---

## 3. Governance Model — Global vs Local Constitution

```
┌──────────────────────────────┐
│   GLOBAL CONSTITUTION        │
│  (Security, Compliance, PII) │
│  Owned by Governance Board   │
└──────────────┬───────────────┘
               │
               │ Inherited by all teams — cannot be weakened
               ▼
┌──────────────────────────────┐
│   LOCAL PRODUCT RULES        │
│  Team-specific extensions    │
│  Cannot override global rules│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   PRODUCT SPEC-KIT REPO      │
│  Gates + Workflows + Specs   │
└──────────────────────────────┘
```

### What Global vs Local Can Define

| Rule Type | Global | Local |
|-----------|--------|-------|
| PII classification | ✅ Defines | ❌ Cannot weaken |
| Encryption standards | ✅ Defines | ❌ Cannot weaken |
| GDPR / HIPAA / CCPA | ✅ Defines | ❌ Cannot weaken |
| Deceptive UI forbidden | ✅ Defines | ❌ Cannot override |
| Product-specific gates | ❌ Not defined | ✅ Can add |
| Team workflows | ❌ Not defined | ✅ Can define |
| Tech stack choices | ❌ Not mandated | ✅ Human confirms |
| Local acceptance criteria | ❌ Not defined | ✅ Can extend |

---

## 4. How Jira Tasks and QA Bugs Flow Back Into Spec-Kit

```
Jira Story Created
        │
        ▼
TASKS.json updated
  (task maps to Jira story ID)
        │
        ▼
PLAN.json validated
  (component and dependency coverage confirmed)
        │
        ▼
IMPLEMENT phase
  (code written, tests written)
        │
        ▼
QA runs tests
        │
        ▼
QA files bug in Jira
        │
        ▼
┌─────────────────────────────────────────────┐
│  REGRESSION GATE (Spec-Kit)                 │
│                                             │
│  Bug must map to an existing requirement    │
│       → Fix implemented under that REQ      │
│       → Re-run IMPLEMENT gates              │
│                                             │
│  OR bug reveals a missing requirement       │
│       → Create new REQ-XXX in SPEC.json     │
│       → Re-run full SPECIFY gates           │
│       → PLAN must update                    │
│       → TASKS must update                   │
│       → IMPLEMENT must update               │
│       → Full cycle repeats                  │
└─────────────────────────────────────────────┘
        │
        ▼
Full cycle repeats until all gates pass
```

---

## 5. Gate Ownership Map

| Gate | Runs In | Owned By | Blocks |
|------|---------|----------|--------|
| SPECIFY soft gates | Agent (AI) | Spec-Kit AI | PLAN unlock |
| SPECIFY hard gates | Agent (AI) | Spec-Kit AI | PLAN unlock |
| Jira Epic gate | Agent (API call) | Product team | SPEC approval |
| PLAN architecture gate | Agent (AI) | Tech Lead | TASKS unlock |
| TASKS coverage gate | Agent (AI) | Spec-Kit AI | IMPLEMENT unlock |
| Jira story creation gate | Agent (API call) | Engineering | IMPLEMENT unlock |
| Dev code gate | CI pipeline | Engineering | PR merge |
| QA test gate | CI pipeline | QA team | PR merge |
| SAST / Lint gate | CI pipeline | Platform/DevOps | PR merge |
| Regression gate | CI pipeline | Spec-Kit CI | PR merge |
| Human QA approval | GitHub CODEOWNERS | QA Lead | PR merge |
| Human architect approval | GitHub CODEOWNERS | Architect | PLAN approval |
| Compliance gate | Agent + CI | Security/Compliance | All phases |

---

## 6. Regression Governance — New Requirement Trigger Map

When a new REQ-XXX is added at any point:

```
New requirement detected
        │
        ├─ Is it a new SPEC addition?
        │      → Re-run SPECIFY gates
        │      → Re-run PLAN gates
        │      → Generate new tasks
        │      → Implement and test
        │
        ├─ Is it triggered by a QA bug?
        │      → Map bug to existing REQ or create new REQ
        │      → Update TASKS.json
        │      → Update IMPL.md
        │      → Re-run CI gates
        │
        └─ Is it triggered by a change request?
               → Start at SPECIFY
               → Full cycle from SPEC to RELEASE
               → All prior passing tests must still pass
               → Regression gate enforces this
```

---

## 7. Integration Points Reference

| Tool | How Spec-Kit Integrates | Phase |
|------|------------------------|-------|
| Jira | Tasks map to Jira story IDs. Gates validate story status. | TASKS, IMPLEMENT |
| Aha! | Requirements link to Aha features/epics. Gates check readiness. | SPECIFY |
| GitHub Actions | CI pipeline runs Spec-Kit gates on every PR | CI |
| GitLab CI | Alternative CI runner for gate execution | CI |
| SonarQube | Code quality and coverage gate | CI |
| Snyk | Dependency vulnerability gate | IMPLEMENT, CI |
| Codecov | Coverage threshold gate | CI |
| AWS Security Hub | Cloud security posture gate | IMPLEMENT |
| PagerDuty | Deployment health check after release | DEPLOY |
| Confluence | Spec documentation synced from SPEC.json | SPECIFY |

---

## 8. Summary

```
┌─────────────────────────────────────────────────────────────┐
│                 SPEC-KIT ENTERPRISE FLOW                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Global Spec-Kit  ──►  Product Spec-Kit                     │
│  (Constitution)         (SPEC → PLAN → TASKS → IMPL)        │
│                                │                            │
│                    ┌───────────┴───────────┐                │
│                    ▼                       ▼                │
│               Dev Repo                 QA Repo              │
│            (Code + CI/CD)          (Tests + CI/CD)          │
│                    │                       │                │
│                    └───────────┬───────────┘                │
│                                ▼                            │
│                    Jira (Stories + Bugs)                    │
│                    Aha! (Features + Epics)                  │
│                                │                            │
│                                ▼                            │
│                   Regression Gate (Spec-Kit CI)             │
│                   Any new bug → full cycle check            │
│                                │                            │
│                                ▼                            │
│                            RELEASE                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

*Part of the Spec-Kit governance framework.*
*See CONSTITUTION.md for org-wide rules.*
*See DEPLOYMENT_MODELS.md for repo structure options.*
*See PSTABLE.md for phase definitions.*
# Spec-Kit Enterprise Architecture
> The definitive reference for leadership, architects, and engineering directors.

---

## 1. The Entire Model in One Sentence

> AI Pods do the work. Product repos hold the code and local governance. Global governance repos hold the laws. Spec-Kit enforces everything.

---

## 2. What Lives Where — Global, Product, Pod

### Global Governance Repo

Contains ONLY governance. No product code. No specs. No plans.

```
global-spec-kit/
  CONSTITUTION.md       <- org-wide law
  PSTABLE.md            <- phase definitions
  gates/
    global-hard-gates/  <- non-negotiable blockers
    global-soft-gates/  <- org-wide warnings
  compliance/           <- GDPR, HIPAA, PCI-DSS rules
  security/             <- PII, encryption, logging rules
```

| What it contains | What it does NOT contain |
|-----------------|--------------------------|
| Global Constitution | SPEC.json |
| Global Hard Gates | PLAN.json |
| Global Soft Gates | TASKS.json |
| Global PSTABLE | IMPL.md |
| Compliance rules | Product code |
| Security rules | Tests |

> Global repo = laws and enforcement logic only.

---

### Local Product Repo

Contains product-specific governance AND product artifacts.

```
product-a/
  spec-kit/
    CONSTITUTION.md     <- extends global, cannot weaken it
    gates/              <- product-specific gate extensions
    BRIEF.md
    SPEC.json
    PLAN.json
    TASKS.json
    IMPL.md
  src/                  <- application code
  tests/                <- test suites
  .github/workflows/    <- CI/CD pipelines
  jira-metadata/        <- Jira integration config
```

> Local Constitution extends global rules but cannot weaken them.

---

### AI Pod Workspace

Pods are execution units, not governance units.
Pods inherit governance. They do not define it. They have no gates of their own.

```
pod-feature-x/
  BRIEF.md              <- feature brief
  SPEC.json             <- feature spec
  PLAN.json             <- feature plan
  TASKS.json            <- Jira-mapped tasks
  IMPL.md               <- implementation log
  feature-branch/       <- code lives here
```

| Pod contains | Pod does NOT contain |
|-------------|---------------------|
| BRIEF.md | Gates |
| SPEC.json | Constitution |
| PLAN.json | Governance rules |
| TASKS.json (Jira mapped) | Global or local rules |
| IMPL.md | Any authority to change governance |
| Feature branches | |
| AI agents (Req, Dev, QA) | |
| Human leads (Req, Dev, QA) | |

---

## 3. When Gates Run — Global vs Local vs Pod

### Global Gates Run

- Every Spec-Kit phase
- Every merge request
- Every CI/CD pipeline
- Every release
- Every pod execution

They enforce:

| Rule | Cannot be overridden by |
|------|------------------------|
| Compliance (GDPR, HIPAA, PCI-DSS) | Anyone |
| Security (PII encryption, TLS) | Anyone |
| Forbidden UI patterns | Anyone |
| Constitution integrity | Anyone |
| Logging rules (no PII in logs) | Anyone |

> Global gates = non-negotiable.

---

### Local Gates Run

- SPEC → PLAN → TASKS → IMPLEMENT
- Product CI/CD pipeline
- Feature branch merges
- Regression testing

They enforce:

- Architecture rules specific to the product
- Domain rules
- Product performance constraints
- Local security extensions (stricter than global, never looser)

> Local gates = product-specific governance built on top of global rules.

---

### Pods Run

- Global gates (always)
- Local gates (always)
- Their own gates: none

---

## 4. Jira + QA + Regression Flow

### Tasks in Jira

TASKS.json becomes a mapping file, not a standalone task list.
Spec-Kit gates enforce:

| Check | What passes |
|-------|------------|
| Every REQ has a Jira story | Story ID present in TASKS.json |
| Every Jira story has AC | Acceptance criteria defined in Jira |
| Every Jira story is approved | Story status = APPROVED in Jira |
| Every Jira story links to an Epic | Epic link present |

---

### QA Bugs — Regression Loop

```
QA files bug in Jira
        │
        ▼
Spec-Kit Regression Gate fires
        │
        ├── Bug maps to existing REQ?
        │       → Fix scoped under that REQ
        │       → TASKS.json updated
        │       → IMPL.md updated
        │       → Re-run IMPLEMENT gates
        │       → Regression tests added
        │       → All gates must pass again
        │
        └── Bug reveals missing requirement?
                → Create new REQ-XXX in SPEC.json
                → Re-run SPECIFY gates
                → PLAN must update
                → TASKS must update
                → IMPLEMENT must update
                → Full cycle repeats
                → All prior passing tests must still pass
```

> This prevents bug drift and regression leaks.
> No bug can be closed without a traceable path back to the spec.

---

## 5. Constitution Governance

### Global Constitution

- Owned by the central governance board
- Cannot be changed by pods
- Cannot be changed by product teams
- Changes require formal governance board approval
- Version-controlled and audited

### Local Constitution

- Owned by product governance (product tech lead or architect)
- Can extend global rules (add stricter rules)
- Cannot weaken global rules (lower bar is forbidden)
- Changes require product governance approval
- Must reference the global Constitution version it extends

### Pods

- Cannot change any Constitution
- Can only request changes through the governance approval process
- All pod execution is governed by both global and local Constitutions

---

## 6. Multi-Pod Architecture

### Diagram 1 — Global → Product → Pod Governance

```
┌─────────────────────────────────┐
│     GLOBAL GOVERNANCE REPO      │
│  Global Constitution            │
│  Global Gates                   │
│  Global PSTABLE                 │
└─────────────────┬───────────────┘
                  │ Inherited by all
                  ▼
┌─────────────────────────────────┐
│        PRODUCT REPO             │
│  Local Constitution             │
│  Local Gates                    │
│  Product Spec-Kit               │
│  Code + Tests + CI/CD           │
└────┬─────────┬────────┬─────────┘
     │         │        │
     ▼         ▼        ▼
┌─────────┐ ┌───────┐ ┌───────┐
│  POD A  │ │ POD B │ │ POD C │
│Feature  │ │Feature│ │Feature│
│AI+Human │ │AI+Human│ │AI+Human│
└─────────┘ └───────┘ └───────┘
```

---

### Diagram 2 — Spec-Kit Flow Inside a Pod

```
BRIEF.md
    │
    ▼
SPECIFY
    ├── Global Gates (compliance, PII, security)
    └── Local Gates (product rules)
    │
    ▼
SPEC.json (APPROVED)
    │
    ▼
PLAN
    ├── Global Gates
    ├── Local Gates
    └── Human Architect Approval
    │
    ▼
PLAN.json (APPROVED)
    │
    ▼
TASKS
    ├── Jira Story Mapping
    ├── Global Gates
    └── Local Gates
    │
    ▼
TASKS.json (APPROVED — Jira linked)
    │
    ▼
IMPLEMENT
    ├── Dev Code Gates
    ├── QA Test Gates
    ├── Regression Gates
    ├── Global Gates
    └── Human QA Approval
    │
    ▼
IMPL.md (COMPLETE)
    │
    ▼
MERGE → Product Repo → RELEASE
```

---

### Diagram 3 — Jira + QA + Regression Loop

```
QA Bug filed in Jira
        │
        ▼
Spec-Kit Regression Gate
        │
        ├── Maps to existing REQ
        │       └── TASKS + IMPL updated
        │           Regression tests added
        │           All gates re-run
        │
        └── New REQ discovered
                └── SPEC updated
                    Full cycle repeats
                    All prior tests must still pass
        │
        ▼
Release only when all gates pass
```

---

## 7. Final Summary

| Layer | Role | Owns | Cannot |
|-------|------|------|--------|
| Global repo | Law | Constitution, global gates, compliance rules | Be changed by pods or product teams |
| Product repo | Product governance + code | Local Constitution, local gates, code, tests | Weaken global rules |
| Pod | Execution | BRIEF, SPEC, PLAN, TASKS, IMPL, feature branches | Define gates or change governance |
| Global gates | Non-negotiable enforcement | Compliance, security, PII, GDPR | Be bypassed by anyone |
| Local gates | Product enforcement | Architecture, domain, performance rules | Be weaker than global gates |
| Jira | Task tracking | Stories, bugs, epics | Replace Spec-Kit governance |
| QA bugs | Regression trigger | Bug reports | Be closed without spec traceability |

---

> Pods inherit governance — they do not define it.
> Global gates enforce compliance and security.
> Local gates enforce product rules.
> Pods run both.
> Jira tasks replace TASKS.json task lists.
> QA bugs feed back into Spec-Kit via regression gates.
> Constitution changes require governance board approval.
> Multi-pod teams integrate safely into one product repo.

---

*Part of the Spec-Kit governance framework.*
*See CONSTITUTION.md for org-wide rules.*
*See DEPLOYMENT_MODELS.md for repo structure options.*
*See PSTABLE.md for phase and state definitions.*
