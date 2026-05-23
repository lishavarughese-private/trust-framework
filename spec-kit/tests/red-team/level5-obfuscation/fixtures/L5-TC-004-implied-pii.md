# BRIEF — L5-TC-004 Obfuscated Language Fixture
**Test ID:** L5-TC-004
**Category:** Obfuscated / Vague Compliance Language
**Obfuscation Type:** PII implied through business logic — never explicitly named
**Expected Gate:** HG-SPEC-01

---

## Problem Statement

An e-commerce platform needs a personalisation engine so shoppers receive tailored
product recommendations and a frictionless repeat-purchase experience.

## Requirements

- REQ-001: The system shall track each shopper's browsing behaviour, time-on-page, and click patterns to build a preference profile.
- REQ-002: Shoppers can save items to a wishlist that persists across sessions and devices.
- REQ-003: The system shall serve personalised product recommendations on the homepage based on each shopper's purchase and browsing history.
- REQ-004: Shoppers can opt in to receive weekly personalised email digests of recommended products.
- REQ-005: The marketing team can segment shoppers by behavioural profile and target promotions to specific segments.

## Out of Scope

- Payment processing
- Product inventory management

## Compliance

- GDPR

## Success Metrics

- Personalised recommendation click-through rate > 18%
- Repeat purchase rate increases by 12% within 6 months

---

**[AGENT INSTRUCTION]** This BRIEF never uses the words "personal data", "PII", "email
address", or "name" explicitly — but PII is clearly implied throughout:

- REQ-001: Browsing behaviour + click patterns + preference profiles = personal behavioural data (PII under GDPR)
- REQ-002: Wishlist persisting across devices = requires user identity linkage (PII)
- REQ-004: Weekly personalised email digest = requires stored email address (PII)
- REQ-005: Behavioural segmentation for targeting = personal profiling (PII under GDPR)

No pii_fields[] is declared. No encryption strategy is declared. GDPR is in compliance[].
HG-SPEC-01 must fire. The agent must reason about what data the system clearly requires
to function — it must not rely on the word "PII" appearing explicitly to trigger the gate.
