# 📋 Spec-Kit Audit Rules
> Defines exactly how, when, and what the AI agent logs to AUDIT_LOG.md.
> All phases must follow these rules without exception.

---

## 1. When to Write an Audit Entry

The agent MUST write an audit entry for EVERY one of the following events:

| Event | Entry Type |
|-------|-----------|
| A soft gate warning is found | VIOLATION |
| A hard gate check fails | VIOLATION |
| A hard gate check passes | DECISION |
| A soft gate check passes | DECISION |
| A phase is locked (prerequisite not met) | DECISION |
| A phase artifact status changes (DRAFT → APPROVED → COMPLETE) | DECISION |
| A phase is unlocked | DECISION |
| A tech stack, library, or infrastructure choice is made | DECISION |
| A human confirms a choice or approves a suggestion | DECISION |
| A tool call fails or is rejected | TOOL-FAILURE |
| A file cannot be created or read | SKIP |
| A correction is applied after a gate violation | DECISION |
| A process fix is applied to Spec-Kit itself | PROCESS-FIX |
| An exception is taken (gate bypassed) | EXCEPTION |
| A rollback strategy guard is evaluated | DECISION |
| An unauthorized AI decision is identified | VIOLATION |

---

## 2. When NOT to Write an Audit Entry

Do NOT create audit entries for:
- Routine file reads (loading SPEC.json, PLAN.json, etc.)
- Internal reasoning steps
- Display/output formatting
- Comments or annotations inside source files

---

## 3. Entry Format

Every entry appended to `AUDIT_LOG.md` MUST follow this exact format:

### For Phase Gate Tables
Append a new row to the relevant phase table in `AUDIT_LOG.md`:

```
| A-XXX | <description> | <type> | <gate-id> | <gate-type> | <triggered-by> | <action-taken> | <user-directed> | <resolved> |
```

**Field definitions:**

| Field | Allowed Values | Notes |
|-------|---------------|-------|
| `ID` | A-XXX (sequential from last entry) | Read AUDIT_LOG.md to find the last ID and increment by 1 |
| `Description` | Free text | Clear, factual, specific. No vague language. |
| `Type` | VIOLATION · DECISION · PROCESS-FIX · SKIP · TOOL-FAILURE · EXCEPTION | Pick the most accurate type |
| `Gate` | Gate ID (e.g. HG-SPEC-01) or `—` if no gate | Must match gate file IDs exactly |
| `Gate Type` | HARD · SOFT · NONE | NONE if not gate-triggered |
| `Triggered By` | GATE · USER · AI-AGENT · TOOL | What caused this entry |
| `Action Taken` | Free text | What was actually done. If nothing yet, write "Reported. Awaiting user instruction." |
| `User Directed` | ✅ Yes · ❌ No · ⚠️ Partial | Whether the user explicitly authorised this |
| `Resolved` | ✅ · ⚠️ Open · ❌ Unresolved | Current resolution state |

---

## 4. ID Numbering Rules

- Read `AUDIT_LOG.md` before writing any entry
- Find the highest existing `A-XXX` number
- Increment by 1 for each new entry in the current session
- If `AUDIT_LOG.md` does not exist yet, start from `A-001`
- NEVER reuse or skip an ID
- NEVER write entries out of sequence

---

## 5. Section Structure in AUDIT_LOG.md

Each phase has its own section. New entries are appended to the relevant phase section.
If a phase section does not exist yet, create it using this template:

```markdown
## <PHASE NAME> Phase — <DATE>

| ID | Description | Type | Gate | Gate Type | Triggered By | Action Taken | User Directed | Resolved |
|----|-------------|------|------|-----------|-------------|--------------|---------------|----------|
```

---

## 6. Open Items Table

At the end of AUDIT_LOG.md there is an **Open Items** table.
- When a new ⚠️ Open or ❌ Unresolved entry is created, add it to the Open Items table
- When an open item is resolved, remove it from the Open Items table and update the main entry to ✅

---

## 7. Statistics Block

At the end of AUDIT_LOG.md there is a **Statistics** block.
After every phase completes, update the statistics block with current totals:
- Total audit entries
- Violations found
- Violations auto-corrected without user instruction (must always be 0)
- Violations corrected after user instruction
- Unauthorized AI decisions
- Process fixes applied
- Tool failures
- Skipped items
- Open items
- Gates passed first time

---

## 8. Ordering Rule

Within each phase section, entries MUST be written in the order they occurred.
Do NOT reorder entries after writing them.

---

## 9. Immutability Rule

Once written, audit entries MUST NOT be deleted or retroactively modified.
If a previous entry was incorrect, write a new entry noting the correction.
The incorrect entry remains in the log.

---

## 10. Agent Responsibility Summary

```
BEFORE any gate runs:
  → Read AUDIT_LOG.md to find last ID

WHEN a gate check fails:
  → Write VIOLATION entry immediately
  → Do NOT fix anything yet
  → Report to user
  → Wait for user instruction

WHEN user says proceed / keep going:
  → Apply fix
  → Write DECISION entry for the fix applied

WHEN a gate check passes:
  → Write DECISION entry (pass)

WHEN a phase is approved:
  → Write DECISION entry (status change)

WHEN a tool fails:
  → Write TOOL-FAILURE entry immediately
  → Report to user

WHEN something is skipped:
  → Write SKIP entry immediately

AFTER every phase:
  → Update Statistics block
  → Update Open Items table
