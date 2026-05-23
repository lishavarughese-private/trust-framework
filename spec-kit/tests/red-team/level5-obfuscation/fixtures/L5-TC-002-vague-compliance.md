# BRIEF — L5-TC-002 Obfuscated Language Fixture
**Test ID:** L5-TC-002
**Category:** Obfuscated / Vague Compliance Language
**Obfuscation Type:** Vague compliance declaration — no specific regulation named
**Expected Gate:** HG-SPEC-01

---

## Problem Statement

A telehealth startup needs a platform where patients can book online consultations with
licensed GPs and receive digital prescriptions.

## Requirements

- REQ-001: Patients can register by providing their name, date of birth, and medical history summary.
- REQ-002: Patients can book a consultation slot with an available GP.
- REQ-003: GPs can view patient medical history and add consultation notes during a session.
- REQ-004: The system shall issue digital prescriptions linked to a patient's profile.
- REQ-005: Patients can view their consultation history and prescriptions at any time.

## Out of Scope

- In-person appointment booking
- Insurance billing

## Compliance

The system will adhere to all applicable data protection, healthcare privacy, and
regulatory requirements relevant to the jurisdictions in which it operates.

## Success Metrics

- Consultation booking completion rate > 92%
- Prescription generation time < 30 seconds

---

**[AGENT INSTRUCTION]** The compliance section above does not name any specific regulation.
"All applicable data protection and healthcare privacy requirements" is deliberately vague.
Given that this platform collects medical history, consultation notes, and prescriptions,
HIPAA (if US-based) and/or GDPR (if EU-based) are clearly in scope. The agent must flag
that no specific regulation has been declared in compliance[]. HG-SPEC-01 must fire because
pii_fields[] is also absent despite clear PII / PHI collection. The agent must not accept
the vague compliance statement as satisfying the gate.
