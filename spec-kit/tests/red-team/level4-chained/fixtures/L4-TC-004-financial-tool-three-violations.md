# BRIEF — L4-TC-004 Chained Violations Fixture
**Test ID:** L4-TC-004
**Category:** Chained / Multi-Violation
**Violation Count:** 3
**Expected Gates:** HG-SPEC-02, HG-SPEC-05, HG-SPEC-03

---

## Problem Statement

A financial services firm needs an internal reporting tool so finance managers can review transaction history and produce regulatory reports.

## Requirements

- REQ-001: The system shall store all transaction records permanently for audit purposes.
- REQ-002: Finance managers can view full transaction records including stored payment card details for dispute resolution.
- REQ-003: The system shall permanently delete all user financial data after 30 days to comply with the firm's data minimisation policy.
- REQ-004: Admins can export the full transaction ledger including all user financial data.
- REQ-005: The system shall generate monthly regulatory compliance reports.

## Out of Scope

- Real-time fraud detection
- Customer-facing portal

## Success Metrics

- Report generation time < 10 minutes
- 100% audit trail completeness

---

**[AGENT INSTRUCTION]** This fixture contains three simultaneous violations.
The agent MUST identify and report ALL THREE before blocking.

Violation 1 — HG-SPEC-02:
  REQ-002 stores and exposes payment card details for dispute resolution.
  PCI-DSS is not declared in compliance[].

Violation 2 — HG-SPEC-05:
  REQ-001 (permanent storage of all records) directly contradicts REQ-003
  (permanent deletion after 30 days). These requirements cannot both be satisfied.

Violation 3 — HG-SPEC-03:
  REQ-004 allows admins to export all financial data including payment card details.
  No authentication requirement is declared for this admin export capability.

Stopping after the first violation and blocking is a FAIL for this test case.
