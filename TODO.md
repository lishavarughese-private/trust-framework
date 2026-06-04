# Outstanding Work

## 1. Production Governance Resolution

The current `speckit.js` has a hardcoded local path:

```js
var GOVERNANCE_REPO_PATH = "C:\\Users\\ashwi\\trust-framework-governance";
```

This is a development shortcut. For production:

**Option A: npm package (@speckit/governance) [RECOMMENDED]**
- Publish the governance evaluator as an npm package (e.g. `@speckit/governance`)
- Product repo installs as dev dependency: `npm install @speckit/governance`
- `speckit.js` resolves via `require("@speckit/governance")` — no filesystem coupling
- Versioning via semver in package.json
- CI/CD: just `npm install`, no cloning needed
- Updates: bump version in package.json, reinstall

**Option B: Git clone at build time**
- CI/CD clones the governance repo at a pinned tag before running speckit.js
- Works without npm publishing but adds clone step
- Heavy for local dev (every `speckit gate` would need a fetch)

## 2. Demo Execution

8-item demo plan not yet performed:
- Show governance repo contents, gate definitions, evaluator, unit tests
- Show product repo phase artifacts, how gates trigger, where results store
- Demonstrate gate failure (break a task, run gate, see it block transition)
- Demonstrate sycophancy bypass attempt (social pressure to pass failing task)
- Demonstrate security gate (HG-SEC-01 finding hardcoded secret)
- Demonstrate INFO-TRACE-01 traceability report
- Show governance repo reading results from product repo

## 3. CI Pipeline Integration

Existing `speckit-ci.yml` runs its own hardcoded CI checks, not the governance evaluator.
The CI should:
- Fetch/clone governance repo
- Run `speckit gate <phase>` at phase transitions
- Store results in ci-reports/

## 4. Sycophancy Resistance Tests for New Gates

Sycophancy test (`tests/sycophancy/resistance.test.js`) needs coverage for:
- HG-TASK-01 through HG-TASK-05
- SG-TASK-01 through SG-TASK-04
- HG-SEC-01
- INFO-TRACE-01

## 5. Unit Tests for New Gate Functions

Unit test fixtures exist but `tests/unit/run-unit-tests.js` needs verification.

## 6. npm Package Publish for speckit CLI

Currently invoked as `node scripts/speckit.js gate TASKS`.
Should be `speckit gate TASKS` via npm packaging with a bin entry in package.json.
## 7. Fix `speckit` CLI Command Not Found

After `npm link`, `speckit` is installed globally but not recognized in PowerShell because the npm global path (`C:\Users\ashwi\AppData\Roaming\npm`) was added to the user PATH after the terminal session started.

**Fix:** Either:
- Close and reopen the terminal (PATH is set correctly now)
- Or add to PATH manually: `$env:Path += ";C:\Users\ashwi\AppData\Roaming\npm"`
- Current workaround: run `node scripts/speckit.js gate <phase>` instead
## 8. Build and Publish @speckit/governance npm Package

The governance evaluator, CLI, agent system prompt, pre-commit hooks, and CI workflows should be bundled as an npm package so product teams can consume them without cloning the governance repo.

**Contents of the package:**
```
@speckit/governance/
  evaluator/
    gate-evaluator.js       # All gate evaluator functions
    evaluate-phase.js       # Phase orchestrator
  agent/
    SYSTEM_PROMPT.md         # Governance agent system prompt (7 rules, refusal table)
    CONSTITUTION.md          # Full constitution for reference
  hooks/
    pre-commit               # Pre-commit hook script that runs `speckit gate TASKS`
  ci/
    speckit-ci.yml           # GitHub Actions workflow template
  scripts/
    install-agent.js         # Creates .continuerc.json pointing to node_modules prompt
    install-hooks.js         # Installs pre-commit hook into .git/hooks/
    install-ci.js            # Copies workflow template into .github/workflows/
  package.json
    bin: {
      speckit: "./bin/speckit.js",
      speckit-install-agent: "./scripts/install-agent.js",
      speckit-install-hooks: "./scripts/install-hooks.js",
      speckit-install-ci: "./scripts/install-ci.js"
    }
```

**Product team setup (one-time):**
```bash
npm install @speckit/governance
npx speckit-install-agent    # Configures AI tool to load SYSTEM_PROMPT.md from node_modules
npx speckit-install-hooks    # Installs pre-commit hook
npx speckit-install-ci       # Sets up CI workflow
```

**Governance team control:**
- Update the package → publish new version → product teams run `npm update`
- Package version is pinned in product repo's package.json — auditable
- Changes to agent prompt, gate rules, or hooks are delivered through normal npm update cycle

**Key principle:** The agent system prompt lives in `node_modules/@speckit/governance/agent/SYSTEM_PROMPT.md` — read-only, versioned, not editable by product teams. The AI tool references it by path, not by copy.
## 8. Build and Publish @speckit/governance npm Package

The governance evaluator, CLI, agent system prompt, pre-commit hooks, and CI workflows should be bundled as an npm package so product teams can consume them without cloning the governance repo.

**Contents of the package:**
```
@speckit/governance/
  evaluator/
    gate-evaluator.js       # All gate evaluator functions
    evaluate-phase.js       # Phase orchestrator
  agent/
    SYSTEM_PROMPT.md         # Governance agent system prompt (7 rules, refusal table)
    CONSTITUTION.md          # Full constitution for reference
  hooks/
    pre-commit               # Pre-commit hook script that runs `speckit gate TASKS`
  ci/
    speckit-ci.yml           # GitHub Actions workflow template
  scripts/
    install-agent.js         # Creates .continuerc.json pointing to node_modules prompt
    install-hooks.js         # Installs pre-commit hook into .git/hooks/
    install-ci.js            # Copies workflow template into .github/workflows/
  package.json
    bin: {
      speckit: "./bin/speckit.js",
      speckit-install-agent: "./scripts/install-agent.js",
      speckit-install-hooks: "./scripts/install-hooks.js",
      speckit-install-ci: "./scripts/install-ci.js"
    }
```

**Product team setup (one-time):**
```bash
npm install @speckit/governance
npx speckit-install-agent    # Configures AI tool to load SYSTEM_PROMPT.md from node_modules
npx speckit-install-hooks    # Installs pre-commit hook
npx speckit-install-ci       # Sets up CI workflow
```

**Governance team control:**
- Update the package → publish new version → product teams run `npm update`
- Package version is pinned in product repo's package.json — auditable
- Changes to agent prompt, gate rules, or hooks are delivered through normal npm update cycle

**Key principle:** The agent system prompt lives in `node_modules/@speckit/governance/agent/SYSTEM_PROMPT.md` — read-only, versioned, not editable by product teams. The AI tool references it by path, not by copy.