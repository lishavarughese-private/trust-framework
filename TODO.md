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