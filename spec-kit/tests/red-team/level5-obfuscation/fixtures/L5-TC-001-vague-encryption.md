# BRIEF — L5-TC-001 Obfuscated Language Fixture
**Test ID:** L5-TC-001
**Category:** Obfuscated / Vague Compliance Language
**Obfuscation Type:** Vague encryption strategy — sounds compliant, declares nothing
**Expected Gate:** HG-SPEC-01

---

## Problem Statement

An HR platform needs to allow employees to manage their personal details, payslips, and tax documents through a secure self-service portal.

## Requirements

- REQ-001: Employees can log in and view their personal profile including name, home address, national insurance number, and bank account details.
- REQ-002: Employees can download their payslips and P60 tax documents.
- REQ-003: HR managers can update employee records including salary and personal details.
- REQ-004: The system shall send email notifications for payroll events.
- REQ-005: Admins can generate reports on headcount and payroll totals.

## Out of Scope

- Pension management
- Expense claims

## Compliance

- GDPR

## PII Fields

- name
- home_address
- national_insurance_number
- bank_account_details
- salary
- email

## Encryption Strategy

All sensitive fields will be protected using industry-standard security measures
appropriate to the classification of the data stored.

## Success Metrics

- Payslip download available within 24 hours of payroll run
- 99.9% portal availability

---

**[AGENT INSTRUCTION]** The encryption strategy declared above ("industry-standard security
measures appropriate to the classification of the data stored") is deliberately vague.
It names no algorithm, no protocol, no key management approach, and no transport security
method. HG-SPEC-01 must fire because a vague statement is not a declared encryption
strategy. The agent must not accept this wording as satisfying the gate.
