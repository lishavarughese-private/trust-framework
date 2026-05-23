#!/usr/bin/env node
/**
 * speckit-trace.js
 * Spec-Kit Cross-Artifact Traceability & CI Gate Runner
 *
 * Reads SPEC.json, TASKS.json, IMPL.md and cross-checks against
 * test output and source files on disk.
 *
 * Produces:
 *   ci-reports/hard-gate-report.json
 *   ci-reports/soft-gate-report.json
 *   ci-reports/trace-summary.json
 *
 * Exit codes:
 *   0 — all hard gates passed (soft gate warnings may exist)
 *   1 — one or more hard gates failed
 */

const fs   = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const PATHS = {
  spec:          path.resolve('spec-kit/SPEC.json'),
  plan:          path.resolve('spec-kit/PLAN.json'),
  tasks:         path.resolve('spec-kit/TASKS.json'),
  impl:          path.resolve('spec-kit/IMPL.md'),
  testReport:    path.resolve('ci-reports/test-report.json'),
  baselineReport:path.resolve('ci-reports/baseline-test-report.json'),
  outHard:       path.resolve('ci-reports/hard-gate-report.json'),
  outSoft:       path.resolve('ci-reports/soft-gate-report.json'),
  outSummary:    path.resolve('ci-reports/trace-summary.json'),
};

const IMPL_TO_TEST_RATIO_THRESHOLD = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadJSON(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`[speckit-trace] Missing file: ${filePath}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function loadImplMd(filePath) {
  if (!fs.existsSync(filePath)) return { taskCoverage: {}, reqCoverage: {} };
  const raw = fs.readFileSync(filePath, 'utf8');

  // Parse Task Coverage table
  const taskCoverage = {};
  const taskTableMatch = raw.match(/## Task Coverage[\s\S]*?(?=\n##|$)/);
  if (taskTableMatch) {
    const rows = taskTableMatch[0].split('\n').filter(l => l.startsWith('|'));
    rows.slice(2).forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols[0]) taskCoverage[cols[0]] = { status: cols[2] || '', files: cols[3] || '' };
    });
  }

  // Parse Requirement Coverage table
  const reqCoverage = {};
  const reqTableMatch = raw.match(/## Requirement Coverage[\s\S]*?(?=\n##|$)/);
  if (reqTableMatch) {
    const rows = reqTableMatch[0].split('\n').filter(l => l.startsWith('|'));
    rows.slice(2).forEach(row => {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean);
      if (cols[0]) reqCoverage[cols[0]] = { coveredBy: cols[1] || '', status: cols[2] || '' };
    });
  }

  return { taskCoverage, reqCoverage };
}

function findTestsForCriterion(criterion, testReport) {
  /**
   * Looks for tests in testReport.tests[] that match the criterion.
   * Match strategies (in order):
   *   1. Exact match on test title
   *   2. Test title contains key words from criterion
   *   3. Test has an annotation matching "AC: TASK-XXX"
   */
  if (!testReport || !Array.isArray(testReport.tests)) return [];
  const keywords = criterion.toLowerCase().split(/\s+/).filter(w => w.length > 4);
  return testReport.tests.filter(t => {
    const title = (t.title || '').toLowerCase();
    return keywords.some(kw => title.includes(kw)) || (t.annotations || []).some(a => a.includes('AC:'));
  });
}

function ensureReportDir() {
  const dir = path.resolve('ci-reports');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Hard Gate Checks ─────────────────────────────────────────────────────────

function checkHG_CI_01(tasks, testReport) {
  /** Every acceptance criterion must have at least one test. */
  const failures = [];
  for (const task of tasks) {
    for (const ac of (task.acceptance_criteria || [])) {
      const matches = findTestsForCriterion(ac, testReport);
      if (matches.length === 0) {
        failures.push({
          task_id: task.id,
          task_title: task.title,
          criterion: ac,
          message: `No test found covering this acceptance criterion.`,
        });
      }
    }
  }
  return {
    id: 'HG-CI-01',
    label: 'Acceptance Criteria Without Test Coverage',
    passed: failures.length === 0,
    failures,
  };
}

function checkHG_CI_02(tasks, implData) {
  /** Every task must appear in IMPL.md with status complete. */
  const failures = [];
  for (const task of tasks) {
    const entry = implData.taskCoverage[task.id];
    if (!entry) {
      failures.push({ task_id: task.id, message: `Task not found in IMPL.md Task Coverage table.` });
    } else if ((entry.status || '').toLowerCase() !== 'complete') {
      failures.push({ task_id: task.id, message: `Task status in IMPL.md is "${entry.status}", expected "complete".` });
    }
  }
  return {
    id: 'HG-CI-02',
    label: 'Tasks Without Corresponding Implementation',
    passed: failures.length === 0,
    failures,
  };
}

function checkHG_CI_03(requirements, implData) {
  /** Every requirement must appear in IMPL.md with status covered. */
  const failures = [];
  for (const req of requirements) {
    const entry = implData.reqCoverage[req.id];
    if (!entry) {
      failures.push({ req_id: req.id, message: `Requirement not found in IMPL.md Requirement Coverage table.` });
    } else if ((entry.status || '').toLowerCase() !== 'covered') {
      failures.push({ req_id: req.id, message: `Requirement status in IMPL.md is "${entry.status}", expected "covered".` });
    }
  }
  return {
    id: 'HG-CI-03',
    label: 'Spec Items Unimplemented (Spec Traceability)',
    passed: failures.length === 0,
    failures,
  };
}

function checkHG_CI_04(testReport, baselineReport) {
  /** No previously passing test may now be failing. */
  const failures = [];
  if (!baselineReport || !Array.isArray(baselineReport.tests)) {
    return {
      id: 'HG-CI-04',
      label: 'Regression Detection',
      passed: true,
      failures: [],
      note: 'No baseline report found. Skipping regression check on first run. Baseline will be saved after this run.',
    };
  }
  const baselinePassed = new Set(
    (baselineReport.tests || []).filter(t => t.status === 'passed').map(t => t.title)
  );
  const currentFailed = new Set(
    (testReport.tests || []).filter(t => t.status === 'failed').map(t => t.title)
  );
  for (const title of baselinePassed) {
    if (currentFailed.has(title)) {
      failures.push({ test_title: title, message: `Test passed in baseline but is now FAILING.` });
    }
  }
  return {
    id: 'HG-CI-04',
    label: 'Regression Detection',
    passed: failures.length === 0,
    failures,
  };
}

function checkHG_CI_05(requirements, tasks, testReport) {
  /** No requirement may be referenced by a currently failing test. */
  const failures = [];
  const failingTests = (testReport.tests || []).filter(t => t.status === 'failed');
  for (const req of requirements) {
    const relatedTasks = tasks.filter(t => t.maps_to_requirement === req.id);
    for (const task of relatedTasks) {
      for (const ac of (task.acceptance_criteria || [])) {
        const matches = findTestsForCriterion(ac, testReport);
        const failingMatches = matches.filter(m => failingTests.some(ft => ft.title === m.title));
        if (failingMatches.length > 0) {
          failures.push({
            req_id: req.id,
            task_id: task.id,
            criterion: ac,
            failing_tests: failingMatches.map(m => m.title),
            message: `Spec contract for ${req.id} is broken — linked test is failing.`,
          });
        }
      }
    }
  }
  return {
    id: 'HG-CI-05',
    label: 'Broken Spec Contract',
    passed: failures.length === 0,
    failures,
  };
}

// ─── Soft Gate Checks ─────────────────────────────────────────────────────────

function checkSG_CI_01(tasks) {
  /** Every implementation task should have a paired test task. */
  const testKeywords = ['test', 'spec', 'coverage', 'e2e', 'unit', 'integration'];
  const implTasks = tasks.filter(t =>
    !testKeywords.some(kw => (t.title + t.description).toLowerCase().includes(kw))
  );
  const testTasks = tasks.filter(t =>
    testKeywords.some(kw => (t.title + t.description).toLowerCase().includes(kw))
  );

  const warnings = [];
  for (const impl of implTasks) {
    const paired = testTasks.some(t =>
      t.maps_to_requirement === impl.maps_to_requirement ||
      t.maps_to_component === impl.maps_to_component
    );
    if (!paired) {
      warnings.push({
        task_id: impl.id,
        task_title: impl.title,
        message: `No paired test task found for this implementation task.`,
      });
    }
  }
  return {
    id: 'SG-CI-01',
    label: 'Implementation Task Without Paired Test Task',
    passed: warnings.length === 0,
    warnings,
  };
}

function checkSG_CI_02(components) {
  /** Coverage approach must be declared for required component types. */
  const requiredTypes = ['backend', 'frontend', 'database', 'stateful'];
  const coverageFiles = [
    'jest.config.js', 'jest.config.ts',
    'vitest.config.js', 'vitest.config.ts',
    'pytest.ini', 'setup.cfg',
    'cypress.config.js', 'cypress.config.ts',
    'playwright.config.js', 'playwright.config.ts',
  ];
  const hasCoverageConfig = coverageFiles.some(f => fs.existsSync(path.resolve(f)));
  const hasPackageScript = (() => {
    const pkgPath = path.resolve('package.json');
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return !!(pkg.scripts && pkg.scripts.coverage);
  })();

  const warnings = [];
  const requiredComponents = components.filter(c => requiredTypes.includes(c.type));
  if (requiredComponents.length > 0 && !hasCoverageConfig && !hasPackageScript) {
    warnings.push({
      message: `No coverage configuration file detected. Add jest.config.js, vitest.config.js, or a "coverage" script in package.json.`,
      affected_components: requiredComponents.map(c => c.id),
    });
  }
  return {
    id: 'SG-CI-02',
    label: 'Coverage Approach Not Declared',
    passed: warnings.length === 0,
    warnings,
  };
}

function checkSG_CI_03(tasks) {
  /** Implementation-to-test task ratio must not exceed 3:1. */
  const testKeywords = ['test', 'spec', 'coverage', 'e2e', 'unit', 'integration'];
  const implCount = tasks.filter(t =>
    !testKeywords.some(kw => (t.title + t.description).toLowerCase().includes(kw))
  ).length;
  const testCount = tasks.filter(t =>
    testKeywords.some(kw => (t.title + t.description).toLowerCase().includes(kw))
  ).length;

  const ratio = testCount === 0 ? Infinity : implCount / testCount;
  const exceeded = ratio > IMPL_TO_TEST_RATIO_THRESHOLD;
  return {
    id: 'SG-CI-03',
    label: 'Implementation-to-Test Task Ratio Exceeds Threshold',
    passed: !exceeded,
    warnings: exceeded ? [{
      impl_count: implCount,
      test_count: testCount,
      ratio: testCount === 0 ? 'Infinity' : `${implCount}:${testCount}`,
      threshold: `${IMPL_TO_TEST_RATIO_THRESHOLD}:1`,
      message: `Ratio ${implCount}:${testCount} exceeds the ${IMPL_TO_TEST_RATIO_THRESHOLD}:1 threshold. Add more test tasks.`,
    }] : [],
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  ensureReportDir();

  console.log('[speckit-trace] Loading artifacts...');
  const spec     = loadJSON(PATHS.spec);
  const tasks_data = loadJSON(PATHS.tasks);
  const plan     = loadJSON(PATHS.plan);
  const implData = loadImplMd(PATHS.impl);

  const testReport     = fs.existsSync(PATHS.testReport)     ? loadJSON(PATHS.testReport)     : { tests: [] };
  const baselineReport = fs.existsSync(PATHS.baselineReport) ? loadJSON(PATHS.baselineReport) : null;

  const requirements = spec.requirements || [];
  const tasks        = tasks_data.tasks   || [];
  const components   = plan.architecture?.components || [];

  // ── Hard Gates ──────────────────────────────────────────────────────────────
  console.log('[speckit-trace] Running hard gate checks...');
  const hardResults = [
    checkHG_CI_01(tasks, testReport),
    checkHG_CI_02(tasks, implData),
    checkHG_CI_03(requirements, implData),
    checkHG_CI_04(testReport, baselineReport),
    checkHG_CI_05(requirements, tasks, testReport),
  ];

  const hardFailed  = hardResults.filter(r => !r.passed);
  const hardPassed  = hardResults.filter(r => r.passed);
  const hardGatePassed = hardFailed.length === 0;

  const hardReport = {
    timestamp: new Date().toISOString(),
    result: hardGatePassed ? 'PASS' : 'FAIL',
    total: hardResults.length,
    passed: hardPassed.length,
    failed: hardFailed.length,
    checks: hardResults,
  };
  fs.writeFileSync(PATHS.outHard, JSON.stringify(hardReport, null, 2));

  // ── Soft Gates ──────────────────────────────────────────────────────────────
  console.log('[speckit-trace] Running soft gate checks...');
  const softResults = [
    checkSG_CI_01(tasks),
    checkSG_CI_02(components),
    checkSG_CI_03(tasks),
  ];

  const softWarnings = softResults.filter(r => !r.passed);
  const softPassed   = softResults.filter(r => r.passed);
  const softHasWarnings = softWarnings.length > 0;

  const softReport = {
    timestamp: new Date().toISOString(),
    result: softHasWarnings ? 'WARN' : 'PASS',
    needs_lead_review: softHasWarnings,
    total: softResults.length,
    passed: softPassed.length,
    warnings: softWarnings.length,
    checks: softResults,
  };
  fs.writeFileSync(PATHS.outSoft, JSON.stringify(softReport, null, 2));

  // ── Summary ─────────────────────────────────────────────────────────────────
  const summary = {
    timestamp: new Date().toISOString(),
    hard_gate: hardGatePassed ? 'PASS' : 'FAIL',
    soft_gate: softHasWarnings ? 'WARN' : 'PASS',
    merge_permitted: hardGatePassed && !softHasWarnings,
    merge_permitted_with_lead_approval: hardGatePassed && softHasWarnings,
    needs_lead_review: softHasWarnings,
  };
  fs.writeFileSync(PATHS.outSummary, JSON.stringify(summary, null, 2));

  // ── Console Output ───────────────────────────────────────────────────────────
  console.log('\nCI HARD GATE REPORT');
  console.log('═'.repeat(54));
  hardResults.forEach(r => {
    const icon = r.passed ? '[PASS]' : '[FAIL]';
    console.log(`${icon} ${r.id} — ${r.label}`);
    if (!r.passed) r.failures.forEach(f => console.log(`       ↳ ${f.message}`));
  });
  console.log('─'.repeat(54));
  console.log(`HARD_GATE_RESULT: ${hardGatePassed ? 'PASS ✅' : 'FAIL ⛔'}`);

  console.log('\nCI SOFT GATE REPORT');
  console.log('═'.repeat(54));
  softResults.forEach(r => {
    const icon = r.passed ? '[PASS]' : '[WARN]';
    console.log(`${icon} ${r.id} — ${r.label}`);
    if (!r.passed) r.warnings.forEach(w => console.log(`       ↳ ${w.message}`));
  });
  console.log('─'.repeat(54));
  console.log(`SOFT_GATE_RESULT: ${softHasWarnings ? 'WARN ⚠️  (needs-lead-review label will be applied)' : 'PASS ✅'}`);

  // ── Save baseline if hard gate passed ────────────────────────────────────────
  if (hardGatePassed && testReport.tests.length > 0) {
    fs.writeFileSync(PATHS.baselineReport, JSON.stringify(testReport, null, 2));
    console.log('\n[speckit-trace] Baseline test report updated.');
  }

  // ── Exit code ────────────────────────────────────────────────────────────────
  process.exit(hardGatePassed ? 0 : 1);
}

main();
