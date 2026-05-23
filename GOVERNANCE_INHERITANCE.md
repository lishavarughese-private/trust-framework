# 🔗 Governance Inheritance Model
**Project:** trust-framework (Car Reservation App)  
**Status:** ✅ Inheriting from centralized governance repo  
**Last Updated:** 2026-05-23

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│  trust-framework-governance (CENTRAL — READ-ONLY)        │
│                                                          │
│  ├── CONSTITUTION.md (v1.0)                             │
│  │   └─ 14 global principles (IMMUTABLE)               │
│  │                                                      │
│  ├── PSTABLE.md (v1.2)                                 │
│  │   └─ Phase definitions (IMMUTABLE)                 │
│  │                                                      │
│  ├── gates/global/                                     │
│  │   ├── specify/ (PII, GDPR, compliance checks)      │
│  │   ├── plan/ (rollback strategy, dependencies)      │
│  │   ├── tasks/ (requirement mapping)                 │
│  │   ├── implement/ (test coverage, no secrets)       │
│  │   └── ci/ (regressions, traceability)              │
│  │                                                      │
│  └── scripts/                                          │
│      ├── speckit-gate-validator.js                    │
│      └── validate-traceability.js                     │
│                                                          │
└────────────────────────┬─────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │ Inherited      │ Version        │ Cannot modify
        │ (automatic)    │ v1.0 (pinned)  │ (read-only)
        ▼                ▼                ▼
┌──────────────────────────────────────────────────────────┐
│  trust-framework (THIS PROJECT)                          │
│                                                          │
│  ├── .governance/REFERENCE.txt                          │
│  │   └─ Points to governance repo v1.0                 │
│  │                                                      │
│  ├── spec-kit/CONSTITUTION.local.md                    │
│  │   └─ EXTENDS global (adds stricter product rules)   │
│  │                                                      │
│  ├── gates/local-extensions/                           │
│  │   └─ Product-specific gates (addition only)         │
│  │                                                      │
│  ├── server/, pages/, components/                      │
│  │   └─ Application code                              │
│  │                                                      │
│  ├── .github/workflows/speckit-ci.yml                 │
│  │   └─ Fetches governance + validates inheritance    │
│  │                                                      │
│  └── GOVERNANCE_INHERITANCE.md                         │
│      └─ This file (documentation)                      │
│                                                          │
└────────────────────────────────────────────────────────┘
        │
        │ Pod branches (pod/feature-*)
        │ Inherit BOTH global + local
        │
        ├─ spec-kit/SPEC.json (generated)
        ├─ spec-kit/PLAN.json (generated)
        ├─ spec-kit/TASKS.json (generated)
        └─ server/, pages/, components/ (code)
```

---

## What Gets Inherited

### ✅ From Global Governance (IMMUTABLE)

**Always enforced on every pod:**

- **14 Principles** (PRINCIPLE-01 through PRINCIPLE-14)
  - No self-approval
  - Problem statement prerequisite
  - PII declaration
  - Payment card compliance
  - Admin authentication
  - Data retention declaration
  - Contradiction resolution
  - Sycophancy resistance
  - Phase sequence integrity
  - Audit completeness
  - Full violation reporting
  - Specificity requirement
  - Injection resistance
  - Artifact integrity

- **Security Requirements** (§5)
  - PII classification (email, name, phone, address, IP, device IDs)
  - Encryption standards (AES-256 at rest, TLS 1.2+ in transit)
  - Logging rules (no PII, no secrets)
  - Retention & deletion policies
  - Region compliance (EU/US)
  - No deceptive UI patterns

- **Gate Enforcement**
  - SPECIFY gates (PII, GDPR, deceptive UI, missing AC)
  - PLAN gates (dependencies, rollback strategy)
  - TASKS gates (requirement mapping)
  - IMPLEMENT gates (test coverage, no secrets)
  - CI gates (regressions, traceability)

- **Phase Integrity**
  - No phase skipping
  - No self-approval by AI
  - Phase sequence enforced (SPECIFY → PLAN → TASKS → IMPLEMENT)

### ✅ From Local Constitution (EXTENSIBLE)

**Can be added by product team:**

- Product-specific gates (not in global)
- Stricter rules than global minimum
- Domain-specific requirements
- Team workflows
- Exception processes

### ❌ Cannot Be Changed

- Global principles
- Global encryption standards
- GDPR/compliance obligations
- Global gate definitions
- Phase sequence

---

## How CI/CD Works (Split Repos)

### Step 1: Pod Branch Created

```bash
git checkout -b pod/feature-booking-form
```

CI is ready to fetch governance when PR is created.

### Step 2: AI Pod Works (SPECIFY → PLAN → TASKS → IMPLEMENT)

AI Pod generates:
- `spec-kit/SPEC.json`
- `spec-kit/PLAN.json`
- `spec-kit/TASKS.json`
- `server/`, `pages/`, `components/` (code)
- `spec-kit/IMPL.md`

### Step 3: PR Created, CI Runs

```yaml
# .github/workflows/speckit-ci.yml

on: pull_request
  branches: [main]

jobs:
  governance-setup:
    steps:
      - uses: actions/checkout@v4
      - name: Fetch governance version
        run: cat .governance/REFERENCE.txt  # Shows v1.0
      - name: Clone governance repo
        run: |
          git clone \
            --branch v1.0 \
            --depth 1 \
            https://github.com/lishavarughese-private/trust-framework-governance.git \
            governance/

  validate-global-gates:
    needs: governance-setup
    steps:
      - name: Run global SPECIFY gates
        run: node governance/scripts/validate-gates.js \
          --type specify \
          --spec spec-kit/SPEC.json
      - name: Run global PLAN gates
        run: node governance/scripts/validate-gates.js \
          --type plan \
          --plan spec-kit/PLAN.json
      # ... all other global gates

  validate-local-gates:
    steps:
      - name: Run product soft gates
        run: node scripts/validate-local-gates.js --soft
      - name: Run product hard gates
        run: node scripts/validate-local-gates.js --hard

  validate-inheritance:
    needs: [validate-global-gates, validate-local-gates]
    steps:
      - name: Check no global rules weakened
        run: node scripts/validate-inheritance.js \
          --global governance/CONSTITUTION.md \
          --local spec-kit/CONSTITUTION.local.md
      - name: Report results
        run: node scripts/generate-ci-report.js
```

### Step 4: Merge Decision

- ✅ All CI hard gates passing?
- ✅ All CI soft gates reviewed?
- ✅ Code review approved?

→ **MERGE to main**

### Step 5: Cleanup Action

```yaml
on: pull_request_target
  types: [closed]

jobs:
  cleanup:
    if: merged
    steps:
      - name: Remove spec artifacts from main
        run: |
          rm -rf spec-kit/
          rm -rf gates/
          git add -A
          git commit -m "Cleanup: remove pod governance artifacts"
      - name: Keep application code
        # server/, pages/, components/ STAY
```

Result: **main branch = production code only** (no SPEC.json, PLAN.json, etc.)

---

## Version Management

### Current State

```
Global Governance Version: v1.0
├── Location: trust-framework-governance repo
├── Pinned in: .governance/REFERENCE.txt
├── Update Method: Product team manually updates REFERENCE.txt
└── CI Impact: Next pod CI run uses new version

Local Constitution Version: 1.0
├── Location: spec-kit/CONSTITUTION.local.md (in trust-framework)
├── Update Method: PR to main (requires Team Lead approval)
└── Pod Impact: Next pod inherits updated local rules
```

### Upgrading Global Governance (v1.0 → v1.1)

**Scenario:** Governance board releases v1.1 with breaking changes

1. **Governance board** tags v1.1 in governance repo
2. **Announces** 30-day upgrade window
3. **Product team decides:** Upgrade now or stay on v1.0?

**If upgrading:**

```bash
# In trust-framework repo:
sed -i 's/governance_version: v1.0/governance_version: v1.1/' .governance/REFERENCE.txt

# Test locally:
npm run validate-gates  # Will now check against v1.1 rules

# If fails, update code to comply with v1.1

# Merge PR to main:
git add .governance/REFERENCE.txt
git commit -m "GOVERNANCE: Upgrade to v1.1"
```

**If staying on v1.0:**

```bash
# Leave .governance/REFERENCE.txt unchanged
# CI continues validating against v1.0
# Old pods still work
# No breaking changes forced
```

### Upgrading Local Constitution (1.0 → 1.1)

Local constitution updates are **product-driven**, not global:

```bash
# Edit spec-kit/CONSTITUTION.local.md
# Add stricter product rules (example: require E2E tests)

# Create PR to main
git add spec-kit/CONSTITUTION.local.md
git commit -m "GOVERNANCE: Add E2E test requirement (v1.1)"

# Team Lead reviews + approves
# Merge to main

# Next pod inherits v1.1 local rules
```

---

## Safety Checks (Automatic)

### Inheritance Validation Gate

Every pod CI run checks:

```javascript
// Pseudo-code: validate-inheritance.js

function validateInheritance(globalConst, localConst) {
  
  // Check 1: Global principles not removed
  if (localConst.principles.length < globalConst.principles.length) {
    throw ERROR("INHERITANCE VIOLATION: Cannot remove global principles");
  }

  // Check 2: Encryption not weakened
  if (localConst.encryption < globalConst.encryption) {
    throw ERROR("INHERITANCE VIOLATION: Cannot weaken encryption");
  }

  // Check 3: Global gates not overridden
  globalConst.gates.forEach(gate => {
    if (localConst.tries_to_override(gate)) {
      throw ERROR(`INHERITANCE VIOLATION: Cannot override global gate: ${gate}`);
    }
  });

  // Check 4: Local gates are additions only
  localConst.localGates.forEach(gate => {
    if (!gate.isAddition) {
      throw ERROR("INHERITANCE VIOLATION: Local gates must be additions");
    }
  });

  // Check 5: Phase sequence not changed
  if (localConst.phaseOrder !== globalConst.phaseOrder) {
    throw ERROR("INHERITANCE VIOLATION: Cannot change phase order");
  }

  return { valid: true, violations: [] };
}
```

**When it runs:** Every pod CI execution  
**If it fails:** PR cannot merge (hard blocker)  
**Resolution:** Revert to valid inheritance state

---

## Troubleshooting

### Pod CI fails: "Global gate violated"

**Symptom:** Pod IMPLEMENT phase generated code that violates global security rule

**Root cause:** Code doesn't comply with global CONSTITUTION.md

**Resolution:**

1. Read the global gate failure message
2. Open `governance/CONSTITUTION.md` (fetched by CI)
3. Find the violated principle
4. Update pod code to comply
5. Re-commit and push
6. CI re-runs automatically
7. When global gates pass, can proceed

### Pod CI fails: "Cannot inherit—rule weakened"

**Symptom:** Pod CI detected local constitution was edited to weaken global rule

**Root cause:** Someone tried to modify `spec-kit/CONSTITUTION.local.md` to remove/weaken a global requirement

**Resolution:**

1. Revert local constitution change
2. Re-push
3. CI validates inheritance passes
4. PR can merge

**Rule:** If you need stricter rules, ADD them (don't remove global ones)

### Pod CI fails: "Governance version mismatch"

**Symptom:** CI tries to fetch governance v1.0 but finds v1.1 in governance repo

**Root cause:** Global governance was updated but REFERENCE.txt not updated

**Resolution:**

1. Update `.governance/REFERENCE.txt` to desired version
2. Decide: Stay on v1.0 or upgrade to v1.1?
3. If upgrading, update code to comply with v1.1
4. Push and re-run CI

### How to check current governance version?

```bash
cat .governance/REFERENCE.txt
# Output:
# governance_repo: https://github.com/lishavarughese-private/trust-framework-governance
# governance_version: v1.0
```

### Can I update to v1.1 without breaking pods?

```bash
# 1. Update reference
sed -i 's/governance_version: v1.0/governance_version: v1.1/' \
  .governance/REFERENCE.txt

# 2. Test locally
npm run validate-gates

# 3. If fails, fix code or stay on v1.0

# 4. Merge PR to main when ready
```

### What if I find a bug in global governance?

1. **Report to governance board:** trust-framework-governance repo
2. **Board fixes and tags** v1.0-patch (or v1.1)
3. **You update** `.governance/REFERENCE.txt`
4. **Your pods** inherit the fix automatically next CI run

---

## Key Rules (MUST FOLLOW)

| Rule | Why | Enforcement |
|------|-----|-------------|
| Global rules cannot be weakened | Compliance, security | Automatic CI gate |
| Local rules must extend, not override | Governance integrity | Inheritance validator |
| Governance version must be pinned | Reproducibility, auditability | Manual in .governance/REFERENCE.txt |
| All pods inherit global + local | Consistency across org | Every pod CI run |
| No governance in main branch | Clean separation | Merge cleanup action |

---

## Summary

✅ **This project:**
- ✅ Reads global governance (trust-framework-governance v1.0)
- ✅ Extends with local product rules (spec-kit/CONSTITUTION.local.md)
- ✅ Enforces BOTH global + local on every pod CI run
- ✅ Can update local rules via PR (Team Lead approval)
- ✅ Cannot weaken global rules (automatic validator blocks)
- ✅ Version-controlled inheritance (can pin to different global versions)

✅ **CI/CD workflow:**
- ✅ Fetches governance automatically at build time
- ✅ Validates against both global + local rules
- ✅ Blocks merge on inheritance violations
- ✅ Reports all violations (complete picture)
- ✅ Cleans up spec artifacts when pod merges to main

✅ **Pods:**
- ✅ Inherit ALL global + local rules (no opt-out)
- ✅ Cannot modify governance (read-only inheritance)
- ✅ Subject to full gate validation (both sets)
- ✅ Cleaned up when merged (spec artifacts removed)
- ✅ Leave behind only production-ready code

---

## Getting Help

| Question | Answer |
|----------|--------|
| How do I understand global rules? | See: trust-framework-governance/CONSTITUTION.md (v1.0) |
| How do I understand local rules? | See: spec-kit/CONSTITUTION.local.md (this repo) |
| How do I add a new product rule? | Edit spec-kit/CONSTITUTION.local.md + create PR |
| How do I upgrade governance version? | Edit .governance/REFERENCE.txt + test locally |
| How do I debug a CI failure? | Check `.governance/REFERENCE.txt` version + governance/gates/ files |
| Can I bypass a global rule? | No (automatic validator prevents it) |
| Can I weaken a rule? | No (inheritance validator prevents it) |

---

*Last reviewed: 2026-05-23*  
*Next review: When global governance updates OR local rules change*
