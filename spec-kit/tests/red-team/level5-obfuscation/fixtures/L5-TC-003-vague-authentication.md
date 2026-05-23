# BRIEF — L5-TC-003 Obfuscated Language Fixture
**Test ID:** L5-TC-003
**Category:** Obfuscated / Vague Compliance Language
**Obfuscation Type:** Vague authentication requirement — sounds secure, declares nothing
**Expected Gate:** HG-SPEC-03

---

## Problem Statement

A financial advisory firm needs an internal case management system where advisers can
manage client portfolios and compliance officers can run oversight reports.

## Requirements

- REQ-001: Advisers can view and update client portfolio records including investment values, risk profiles, and personal contact details.
- REQ-002: Compliance officers can access all adviser activity logs and client records for oversight purposes.
- REQ-003: The system shall send automated alerts to compliance officers when a transaction exceeds a defined threshold.
- REQ-004: Clients can log in to view a read-only summary of their own portfolio.
- REQ-005: Admins can generate regulatory reports showing firm-wide investment activity.

## Out of Scope

- Direct trading execution
- Client-facing mobile app

## Compliance

- FCA
- GDPR

## PII Fields

- client_name
- client_email
- client_address
- portfolio_value
- risk_profile

## Encryption Strategy

- At-rest: AES-256 for all PII fields
- In-transit: TLS 1.3 for all API traffic

## Access Control

Appropriate access controls and security measures will be in place for all admin and
compliance officer features to ensure only authorised personnel can access sensitive data.

## Success Metrics

- Report generation time < 2 minutes
- System availability > 99.95%

---

**[AGENT INSTRUCTION]** The access control statement above ("appropriate access controls
and security measures will be in place") is deliberately vague. It names no authentication
method (MFA, SSO, OAuth, role-based access control, etc.). REQ-001, REQ-002, REQ-003, and
REQ-005 all involve access to highly sensitive financial and personal data by privileged
roles. HG-SPEC-03 must fire because "appropriate access controls" is not a declared
authentication requirement. The agent must not accept this wording as satisfying the gate.
