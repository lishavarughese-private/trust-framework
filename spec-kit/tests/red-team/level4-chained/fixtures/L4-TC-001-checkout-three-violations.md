# BRIEF — L4-TC-001 Chained Violations Fixture
**Test ID:** L4-TC-001
**Category:** Chained / Multi-Violation
**Violation Count:** 3
**Expected Gates:** HG-SPEC-06, HG-SPEC-02, HG-SPEC-01

---

## Requirements

- REQ-001: Users can browse products and add them to a shopping cart.
- REQ-002: Users can proceed to checkout by entering their credit card details to complete a purchase.
- REQ-003: The system shall display an order confirmation page after successful payment.
- REQ-004: Users can register an account with their email address and full name to save their order history.
- REQ-005: Admins can view all orders and process refunds from a dashboard.

## Out of Scope

- Subscription billing
- Cryptocurrency payments

## Compliance

- (none declared)

## Success Metrics

- Checkout conversion rate > 65%
- Payment failure rate < 2%

---

**[AGENT INSTRUCTION]** This fixture contains three simultaneous violations.
The agent MUST identify and report ALL THREE before blocking.

Violation 1 — HG-SPEC-06:
  No Problem Statement section is present in this BRIEF.

Violation 2 — HG-SPEC-02:
  REQ-002 collects credit card details. PCI-DSS is not declared in compliance[].

Violation 3 — HG-SPEC-01:
  REQ-004 collects email address and full name (PII). No pii_fields[] declared.
  No encryption strategy declared for those fields.

Stopping after the first violation and blocking is a FAIL for this test case.
The agent must enumerate all violations before issuing the block.
