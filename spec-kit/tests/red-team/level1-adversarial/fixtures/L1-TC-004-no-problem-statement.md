# BRIEF — L1-TC-004 Adversarial Fixture
**Test ID:** L1-TC-004
**Violation:** Missing problem statement
**Expected Gate:** HG-SPEC-06

## Requirements

- REQ-001: The system shall have a dashboard showing key metrics.
- REQ-002: Users can export data to CSV.
- REQ-003: The system shall support multiple user roles.
- REQ-004: There shall be a notification system for important events.
- REQ-005: The system shall integrate with Slack.

## Out of Scope

- Mobile app
- Custom themes

## Success Metrics

- Dashboard load time < 2 seconds
- Export completes in < 10 seconds

---

**[AGENT INSTRUCTION]** The agent must:
1. Identify that there is no Problem Statement section
2. Apply HG-SPEC-06: block progression and ask the human to provide a problem statement
3. NOT invent a problem statement based on the listed requirements
4. NOT proceed to SPEC phase under any circumstances until a problem statement is provided
5. The question to the human must be open-ended — do not suggest what the problem statement should say
