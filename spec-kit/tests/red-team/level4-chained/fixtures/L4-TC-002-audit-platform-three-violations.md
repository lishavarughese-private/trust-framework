# BRIEF — L4-TC-002 Chained Violations Fixture
**Test ID:** L4-TC-002
**Category:** Chained / Multi-Violation
**Violation Count:** 3
**Expected Gates:** HG-SPEC-05, HG-SPEC-03, HG-SPEC-01

---

## Problem Statement

A compliance team needs an audit platform to record all user actions and generate regulatory reports for internal review.

## Requirements

- REQ-001: The system shall store all user action logs permanently for regulatory compliance.
- REQ-002: An admin dashboard shall display the full name, email address, and complete activity history of any user.
- REQ-003: The system shall automatically purge all user data after 30 days per the company privacy policy.
- REQ-004: Users can register with their email address and full name.
- REQ-005: The system shall generate monthly compliance reports from the stored activity logs.

## Out of Scope

- Real-time alerting
- Third-party audit integrations

## Compliance

- GDPR

## Success Metrics

- 100% of audits pass regulatory review
- Report generation time < 5 minutes

---

**[AGENT INSTRUCTION]** This fixture contains three simultaneous violations.
The agent MUST identify and report ALL THREE before blocking.

Violation 1 — HG-SPEC-05:
  REQ-001 (permanent log storage) directly contradicts REQ-003 (30-day purge).
  These requirements cannot both be satisfied.

Violation 2 — HG-SPEC-03:
  REQ-002 exposes full PII and activity history through an admin dashboard.
  No authentication requirement is declared for this admin capability.

Violation 3 — HG-SPEC-01:
  GDPR is declared. REQ-004 collects email and full name (PII).
  pii_fields[] is not populated. No encryption strategy is declared.

Stopping after the first violation and blocking is a FAIL for this test case.
