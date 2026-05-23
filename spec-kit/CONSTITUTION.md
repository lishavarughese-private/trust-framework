# 🏛️ ORGANIZATION CONSTITUTION  
Version: 1.0  
Effective: May 2026  
Applies To: This product and all AI pods operating within it
Inherits From: governance/CONSTITUTION.md — global principles are non-negotiable and always in force
Scope: Product-level rules. Extends global principles. May add stricter rules. May not weaken any global rule.

---

# 1. Purpose
This Constitution defines the organization‑wide governance model for all software development using Spec‑Kit.  
It ensures consistency, quality, security, compliance, and traceability across every project.

It extends the global governance constitution. It may add stricter rules. It may not remove or weaken any global rule.

---

# 2. Organizational Principles

## 2.1 Quality First
Speed never overrides correctness, clarity, or safety.

## 2.2 Specification‑Driven Development
Specs define the truth.  
Plans, tasks, and code MUST trace back to the spec.

## 2.3 Gate‑Based Workflow
Every phase has soft gates (warnings) and hard gates (blocking).

## 2.4 Transparency
All decisions, exceptions, and risks MUST be documented.

## 2.5 Continuous Improvement
Every iteration should improve clarity, quality, and process.

## 2.6 Human Authority Over Technology Decisions
AI agents MUST NOT unilaterally decide the technology stack, libraries, frameworks, cloud provider,
or infrastructure choices for any project.
AI agents MAY suggest options with reasoning.
The human (product owner, tech lead, or team) MUST explicitly confirm all technology choices
before they are written into any artifact.
Silence or inaction does NOT count as confirmation.

---

# 3. Official Workflow (Mandatory)

SPECIFY
→ SECURITY & PRIVACY HARD GATE
→ SOFT GATE REVIEW
→ PROJECT CONSTITUTION (project‑level rules)
→ PLAN
→ PLAN GATES (soft + hard)
→ TASKS
→ TASK GATES (soft + hard)
→ IMPLEMENT
→ IMPLEMENT HARD GATE
→ PULL REQUEST
→ CI HARD GATE (blocks merge + deployment)
→ CI SOFT GATE (flags for Lead review)
→ LEAD ACKNOWLEDGEMENT (required if soft gate warnings present)
→ MERGE TO MAIN
→ DEPLOY


No phase may be skipped.  
No gate may be bypassed without documented exception.

---

# 4. Gate Definitions

## 4.1 Soft Gates (Non‑Blocking)
Soft gates identify issues that should be fixed but do not block progress.

Examples:
- Ambiguous language  
- Missing persona details  
- Missing success metrics  
- Missing risk analysis  
- Scope creep  
- Over‑engineering  
- Missing dependency versions
- Missing test task paired with implementation task
- Coverage approach not declared for required modules
- Implementation-to-test task ratio exceeding threshold

Soft gates produce warnings, not blocks.
Post-PR soft gate warnings MUST be acknowledged by a Team Lead before merge is permitted.

---

## 4.2 Hard Gates (Blocking)
Hard gates MUST be passed before moving to the next phase.

Examples:
- PII without encryption  
- GDPR/CCPA violations  
- Deceptive UI patterns  
- Missing acceptance criteria  
- Missing required dependencies  
- Version drift  
- Failing tests  
- Console errors  
- Security violations  
- Missing requirement → task mapping  
- Missing requirement → implementation mapping  
- Destructive schema changes without migration scripts  
- Missing rollback strategy for DB or stateful changes  
- Missing backward compatibility statement  
- DB or stateful tasks generated before rollback strategy is defined
- Acceptance criteria lacking test coverage in CI
- Tasks without corresponding implementation in IMPL.md
- Spec items unimplemented (broken spec traceability)
- Regression: previously passing acceptance criteria now failing
- Spec contract broken by new implementation

If a hard gate fails → STOP.  
The next phase is forbidden until fixed.
Post-PR hard gate failures MUST block merge to main AND block pipeline deployment.

---

# 5. Security & Privacy Rules (Mandatory)

## 5.1 PII Classification
PII includes:
- Name  
- Email  
- Phone  
- Address  
- IP address  
- Device identifiers  

## 5.2 Encryption Requirements
- All PII MUST be encrypted at rest (AES‑256 or equivalent).  
- All PII in transit MUST use TLS 1.2+.  
- Encryption keys MUST NOT be stored with the data.

## 5.3 Logging Rules
- Logs MUST NOT contain PII.  
- Logs MUST NOT contain tokens, passwords, or secrets.  
- Logs MUST be redactable.  
- Logs MUST have access control.

## 5.4 Retention & Deletion
- PII MUST have a defined retention period.  
- Users MUST be able to delete their data.  
- Deletion MUST be permanent.

## 5.5 Region Compliance
- EU users → EU region (GDPR)  
- US users → US region (CCPA)  
- Cross‑border transfers MUST be explicit  

## 5.6 No Deceptive UI Patterns
Forbidden:
- Pre‑checked consent boxes  
- Hidden privacy settings  
- “Agree only” flows  
- Confusing opt‑out  
- Fake urgency  
- Fake security badges  

---

# 6. Quality Standards

## 6.1 Code Quality
- No console errors  
- No unused variables  
- No dead code  
- No hardcoded secrets  
- Clear naming conventions  
- Comments for complex logic  

## 6.2 Testing
- Critical logic MUST have tests  
- All acceptance criteria MUST be testable  
- All hard gates MUST be testable  

## 6.3 Documentation
- Specs MUST be complete  
- Plans MUST be traceable  
- Tasks MUST map to requirements  
- Exceptions MUST be documented  

---

# 7. Phase‑Specific Rules

## 7.1 SPECIFY Phase
Hard Gates:
- PII without encryption  
- GDPR/CCPA violations  
- Missing acceptance criteria  
- Missing persona  
- Missing problem statement  

Soft Gates:
- Ambiguous language  
- Missing success metrics  
- Missing risks  

---

## 7.2 PLAN Phase

### Mandatory Human Confirmation (Before Any Artifact Is Written)
The following decisions MUST be confirmed by a human before `PLAN.json` is populated:
- Frontend framework and version
- Backend / API framework and version
- Database engine and version
- Encryption key management approach
- Hosting / cloud provider
- Any existing team libraries or constraints

The AI agent MUST present suggestions with reasoning for each decision.
The AI agent MUST wait for explicit human confirmation before writing `tech_stack[]` or `dependencies[]`.
If the human approves AI suggestions, this MUST be explicitly stated in the session before proceeding.

Hard Gates:
- Missing required dependencies  
- Version drift  
- Missing architecture components  
- Missing API definitions  
- Destructive schema changes (DROP, RENAME) without migration scripts  
- Missing rollback strategy when schema changes or stateful logic is present  
- Missing backward compatibility statement for existing data  
- Missing state hydration plan when client state is affected  
- AI is FORBIDDEN from generating tasks for DB modules or stateful logic until `rollback_strategy` is defined
- Tech stack written without human confirmation (violation of §2.6)

Soft Gates:
- Scope creep  
- Over‑engineering  
- Missing diagrams  
- Large data volume performance risk  
- Potential downtime during migration  
- Complex state rehydration logic with UI flicker risk        

---

## 7.3 TASK Phase
Hard Gates:
- Tasks not mapped to requirements  
- Missing acceptance criteria mapping  
- Missing dependencies  

Soft Gates:
- Tasks too large  
- Tasks unclear  

---

## 7.4 IMPLEMENT Phase
Hard Gates:
- Failing tests  
- Console errors  
- Security violations  
- Missing requirement coverage  
- Missing error handling  

Soft Gates:
- Minor performance issues  
- Minor UI inconsistencies  

---

## 7.6 Post-PR Continuous Integration (CI) Phase

The CI phase runs automatically on every Pull Request targeting the main branch.
It is enforced by the CI/CD pipeline (GitHub Actions / GitLab CI) + branch protection rules.
No developer may merge to main while a CI hard gate is failing.

### 7.6.1 CI Hard Gates (Block Merge + Block Deployment)
The following checks MUST pass before merge to main is permitted:
- Every acceptance criterion in TASKS.json MUST have at least one corresponding test in the codebase.
- Every task in TASKS.json MUST have a corresponding entry in IMPL.md with status `complete`.
- Every requirement in SPEC.json MUST be covered in IMPL.md.
- No previously passing test may now be failing (zero regressions).
- No requirement from SPEC.json may be referenced in a currently failing test.

Failure of any CI hard gate MUST:
- Exit the CI pipeline with a non-zero code.
- Block merge via branch protection rules.
- Block deployment pipeline from triggering.
- Post a detailed failure report as a PR comment.

### 7.6.2 CI Soft Gates (Warn + Require Lead Acknowledgement)
The following checks produce warnings and require Team Lead approval before merge:
- Every implementation task SHOULD have a paired test task in TASKS.json.
- The coverage approach (unit / integration / e2e) MUST be declared for each module required by this Constitution.
- The ratio of implementation tasks to test tasks MUST NOT exceed 3:1.

When soft gate warnings are present:
- CI pipeline posts a structured warning comment on the PR.
- A `needs-lead-review` label is applied to the PR automatically.
- Branch protection requires at least one Team Lead approval before merge.
- The Lead's approval serves as the formal acknowledgement.

### 7.6.3 Enforcement Mechanism
- Hard gates: GitHub Actions job + branch protection status checks.
- Soft gates: GitHub Actions job + PR comment + `needs-lead-review` label + CODEOWNERS required review.
- No git hooks. Hooks are local and bypassable.
- No manual-only enforcement. All checks must be automated and auditable.

### 7.6.4 CI Traceability Script
- A `scripts/speckit-trace.js` script MUST exist in every Spec-Kit project.
- It reads SPEC.json, TASKS.json, and IMPL.md and cross-checks against test output and source files.
- It produces a machine-readable JSON report consumed by the CI pipeline.
- It MUST be kept in sync with every SPEC.json and TASKS.json update.  

---

## 7.5 Data Migration & State Impact Rules

### 7.5.1 Schema Change Classification
All schema changes MUST be classified as one of:
- `additive` — new tables, new nullable columns (safe)
- `destructive` — DROP table, DROP column, RENAME table, RENAME column (high risk)
- `mutative` — ALTER column type, add NOT NULL constraint to existing column (medium risk)

### 7.5.2 Migration Scripts
- Every schema change MUST have a corresponding migration script defined in `PLAN.json migration.migration_scripts[]`.
- Migration scripts MUST be versioned and idempotent.
- Destructive and mutative changes MUST include both an `up` and `down` script.

### 7.5.3 Rollback Strategy (Mandatory for DB & Stateful Changes)
- Any plan that includes schema changes OR stateful logic changes MUST define a `rollback_strategy`.
- The rollback strategy MUST describe: trigger conditions, rollback steps, data recovery approach.
- AI agents are FORBIDDEN from generating implementation tasks for DB modules or stateful logic until `rollback_strategy` is a non-empty, defined string in `PLAN.json`.

### 7.5.4 Backward Compatibility
- All schema changes MUST include a `backward_compatibility` statement.
- The statement MUST confirm whether existing data is preserved, transformed, or at risk.
- If existing data is at risk, a data backup step MUST appear in `migration_scripts[]`.

### 7.5.5 State Hydration
- If a change affects client-side state (Redux, Zustand, localStorage, cookies, etc.), a `state_hydration` plan MUST be defined.
- The plan MUST address: stale state handling, rehydration order, and UI flicker prevention.

### 7.5.6 Soft Warnings
- Large data volumes (>100k rows affected) MUST be flagged as a performance risk.
- Migrations that require downtime MUST be flagged with estimated downtime.
- Complex rehydration logic MUST be flagged for UI flicker risk.

---

# 8. Exception Process

## 8.1 Soft Gate Exceptions
Allowed with team lead approval.  
Must be documented.

## 8.2 Hard Gate Exceptions
Allowed ONLY with:
- Security lead approval  
- Product owner approval  
- Documented risk  
- Clear remediation timeline  

## 8.3 Exception Log
Every exception MUST include:
- Rule violated  
- Reason  
- Risk  
- Approval  
- Expiry date  

---

# 9. Escalation Path

| Issue | Owner |
|-------|--------|
| Soft gate disagreement | Team Lead |
| Hard gate failure | Tech Lead |
| Security/privacy violation | Security Lead |
| Compliance issue | Compliance Officer |
| Architecture conflict | Architect |
| CI hard gate failure | Tech Lead |
| CI soft gate warning | Team Lead |
| CI traceability gap | Tech Lead + Product Owner |
| Regression introduced by PR | Tech Lead |

---

# 10. Success Metrics

- 100% hard gate pass rate  
- 0 production bugs from spec gaps  
- 90%+ requirement coverage  
- All PII encrypted  
- All logs compliant  
- All exceptions documented  

---

# 11. Versioning
- V1.0 — Initial release  
- V1.1 — Added §7.5 Data Migration & State Impact Rules; updated §4.2 and §7.2 accordingly
- V1.2 — Added §7.6 Post-PR CI Phase; updated §3 workflow, §4.1, §4.2, §9 escalation path accordingly
- V1.3 — Added §2.6 Human Authority Over Technology Decisions; updated §7.2 to require mandatory human confirmation before tech stack is written
- Updated as organization evolves            
