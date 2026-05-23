# Spec-Kit Deployment Models
> How to structure Spec-Kit across one or many repositories in an enterprise.

---

## The Core Question

Should Spec-Kit live in one common repo, or can there be multiple Spec-Kit repos — one per team, per product, per domain?

The real answer — the one enterprises actually use — is:

> Spec-Kit can be centralized OR distributed. The right choice depends on what you want to govern.

---

## Option 1 — One Common Spec-Kit Repo

The most common enterprise pattern.

### Structure

```
spec-kit-governance/
  CONSTITUTION.md
  PSTABLE.md
  gates/
  templates/
  standards/
  workflows/
```

### Why enterprises choose this

- One Constitution for the whole company
- One set of gates
- One governance model
- One source of truth
- Every team inherits the same rules
- Easy to update governance centrally

### How teams use it

Each product team has its own repo but imports or references the central Spec-Kit governance.
This is the platform governance model.

### When to choose this

| Reason | Detail |
|--------|--------|
| Consistency | All teams follow the same rules |
| Compliance | Single audit trail across the org |
| Auditability | One place to check for violations |
| Scale | Easy to roll out to new teams |

---

## Option 2 — Multiple Spec-Kit Repos (Distributed Governance)

The federated model.

### Structure

```
product-a-spec-kit/
product-b-spec-kit/
product-c-spec-kit/
```

Each product or team owns its own Constitution, gates, PSTable, and workflows.

### Why enterprises choose this

- Teams have different compliance needs (HIPAA vs GDPR vs SOC2)
- Teams have different SDLCs
- Teams want autonomy and independent evolution
- Different engineering maturity levels across teams

### When to choose this

| Scenario | Detail |
|----------|--------|
| Large org with independent business units | Each BU has its own legal obligations |
| Different regulatory environments | Healthcare needs HIPAA. Payments needs PCI-DSS. |
| Different maturity levels | Some teams are gate-ready. Others are not yet. |

---

## Option 3 — Hybrid Model (Recommended for Most Companies)

The sweet spot.

### Structure

```
spec-kit-governance/        <- central org-wide rules
  CONSTITUTION.md
  PSTABLE.md
  gates/
  standards/

product-a/
  spec-kit/                 <- local overrides and extensions

product-b/
  spec-kit/

product-c/
  spec-kit/
```

### How it works

**Central repo defines:**
- Constitution (org-wide law — cannot be overridden)
- Core gates (security, PII, compliance)
- Required workflows

**Local repos define:**
- Product-specific requirements
- Product-specific gates and extensions
- Local overrides (must be documented with justification)

### Why this is powerful

| Benefit | How |
|---------|-----|
| Central governance stays consistent | Constitution lives in one place |
| Teams can extend locally | Add product-specific gates without touching the centre |
| Control and flexibility | Centre enforces minimums. Teams go beyond them. |
| Easy to audit | Central AUDIT_LOG per cycle + local AUDIT_LOG per product |

---

## How Multi-Repo Spec-Kit Works in Practice

### Example Setup

```
Repo A  Spec-Kit governance (central)
Repo B  Dev code (product)
Repo C  QA tests
Repo D  Product spec-kit (local)
```

### How gates read across repos

Spec-Kit gates can reference external repos via:
- `git fetch` for cross-repo file reads
- API calls (Jira, Aha, GitHub)
- CI pipeline triggers
- Agent commands that read external paths

| Gate | What It Checks | Repo |
|------|---------------|------|
| PLAN gates | Dev repo structure and component definitions | Repo B |
| TASK gates | Jira stories mapped to tasks | Jira API |
| IMPLEMENT gates | QA repo test coverage | Repo C |
| Regression gates | Coverage across all repos | Repos B + C |

> Spec-Kit does not care where the repos live.
> It only cares that the gates can read what they need.

---

## Regression Governance — What Happens When Requirements Are Added

When a new REQ-XXX is added to SPEC.json:

```
1. SPEC gates fire
      Check compliance (GDPR, HIPAA, etc.)
      Check clarity (no vague language)
      Check PII classification
      Check Jira / Aha links

2. PLAN gates fire
      New component or API must be defined
      New tasks must be created
      Dependencies must be updated

3. TASK gates fire
      New tasks must map to the new requirement
      Acceptance criteria must exist

4. IMPLEMENT gates fire
      New code must exist
      New tests must exist
      All regression tests must pass
      Coverage must not drop

5. External gates fire
      Jira story must be in APPROVED state
      Aha feature must be READY
      SAST scan must pass
      Lint must pass
```

This is full regression governance. A new requirement cannot be added without
the entire chain being traceable, tested, and passing.

---

## External Tool Integration Points

| Tool | Integration Point | Gate Phase |
|------|-----------------|-----------|
| Jira | Task mapping validation | TASKS |
| Aha | Feature readiness check | SPECIFY |
| GitHub / GitLab | PR status checks | CI |
| SonarQube | Code quality and coverage | CI |
| Snyk / SAST | Security scanning | IMPLEMENT + CI |
| Codecov | Coverage reporting | CI |
| Confluence | Spec documentation sync | SPECIFY |
| PagerDuty | Deployment health checks | DEPLOY |
| AWS Security Hub | Cloud security posture | IMPLEMENT |

---

## Decision Guide

| If you want... | Choose |
|---------------|--------|
| Enterprise-wide consistency | Option 1 — Common repo |
| Team autonomy and independent evolution | Option 2 — Multiple repos |
| Both governance and team flexibility | Option 3 — Hybrid |
| Compliance across multiple regulatory regimes | Option 3 — Hybrid |
| Fast single-team setup | Option 1 — Common repo |
| Multi-BU org with different risk profiles | Option 3 — Hybrid |

---

## Rollout Pattern (Recommended)

```
Phase 1  Establish central governance
         Create spec-kit-governance/ repo
         Write CONSTITUTION.md
         Define core gates
         Define required workflows

Phase 2  Pilot with one product team
         Create product-a/spec-kit/
         Reference central governance
         Run full SPECIFY to IMPLEMENT cycle
         Collect feedback and violations

Phase 3  Refine central governance
         Apply lessons from pilot
         Update Constitution
         Harden gates based on real violations

Phase 4  Roll out to all teams
         Each team creates their local spec-kit/
         All reference central governance
         Local overrides require documented justification
         Central AUDIT_LOG updated per cycle

Phase 5  Integrate external tools
         Connect Jira / Aha to TASK gates
         Connect SAST / DAST to IMPLEMENT gates
         Connect CI/CD to CI gates
         Connect compliance tools to SPECIFY gates
```

---

*Part of the Spec-Kit governance framework.*
*See CONSTITUTION.md for org-wide rules.*
*See PSTABLE.md for phase definitions.*
