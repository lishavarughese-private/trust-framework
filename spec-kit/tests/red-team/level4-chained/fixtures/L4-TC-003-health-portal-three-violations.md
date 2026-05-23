# BRIEF — L4-TC-003 Chained Violations Fixture
**Test ID:** L4-TC-003
**Category:** Chained / Multi-Violation
**Violation Count:** 3
**Expected Gates:** HG-SPEC-06, HG-SPEC-01, HG-SPEC-03

---

## Requirements

- REQ-001: Patients can register and book appointments by providing their full name, date of birth, and presenting medical condition.
- REQ-002: Practitioners can view full patient profiles including all medical notes prior to a consultation.
- REQ-003: The system shall send appointment reminder emails to registered patients.
- REQ-004: Admins can generate reports showing all patient activity and consultation history across the platform.
- REQ-005: Patients can view their own appointment history and medical notes.

## Out of Scope

- Prescription management
- Video consultations

## Compliance

- HIPAA

## Success Metrics

- 95% patient booking completion rate
- Reminder delivery rate > 98%

---

**[AGENT INSTRUCTION]** This fixture contains three simultaneous violations.
The agent MUST identify and report ALL THREE before blocking.

Violation 1 — HG-SPEC-06:
  No Problem Statement section is present in this BRIEF.

Violation 2 — HG-SPEC-01:
  HIPAA is declared. REQ-001 collects name, date of birth, and medical condition (PHI / PII).
  pii_fields[] is not populated. No encryption strategy is declared.

Violation 3 — HG-SPEC-03:
  REQ-002 and REQ-004 give practitioners and admins broad access to sensitive patient data.
  No authentication requirement is declared for either capability.

Stopping after the first violation and blocking is a FAIL for this test case.
