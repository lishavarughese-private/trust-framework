#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var PRODUCT_ROOT = path.resolve(__dirname, "..");

// Resolve governance path: try npm package first, fall back to hardcoded local path
var GOVERNANCE_REPO_PATH, GOVERNANCE_EVALUATOR;
try {
  var govPkg = require.resolve("@lishavarughese-private/governance/evaluate-phase");
  GOVERNANCE_EVALUATOR = govPkg;
  GOVERNANCE_REPO_PATH = path.dirname(path.dirname(path.dirname(govPkg)));
} catch (e) {
  // Fall back to hardcoded local development path
  GOVERNANCE_REPO_PATH = "C:\\Users\\ashwi\\trust-framework-governance";
  GOVERNANCE_EVALUATOR = path.join(GOVERNANCE_REPO_PATH, "governance", "evaluator", "evaluate-phase.js");
}

// ============================================================================
// Core helpers
// ============================================================================

var REPORTS_DIR = path.join(PRODUCT_ROOT, "ci-reports");
// Ensure the reports directory exists or create it if missing
function ensureReportsDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }
}
// Save the gate evaluation report to a timestamped file in the reports directory
function saveReport(phase, manifest, opts) {
  ensureReportsDir();
  var timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  var jsonPath = path.join(REPORTS_DIR, phase + "-gate-report-" + timestamp + ".json");
  var htmlPath = path.join(REPORTS_DIR, phase + "-gate-report-" + timestamp + ".html");
  var latestJson = path.join(REPORTS_DIR, phase + "-gate-report-latest.json");
  var latestHtml = path.join(REPORTS_DIR, phase + "-gate-report-latest.html");

  var report = {
    evaluated_at: manifest.evaluated_at,
    product: path.basename(PRODUCT_ROOT),
    phase: phase,
    governance_version: "1.0.0",
    transition_allowed: manifest.transition_allowed,
    transition: manifest.transition,
    summary: manifest.summary,
    gates: manifest.gates,
    blocking_failures: manifest.blocking_failures
  };

  // Write JSON
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), "utf8");
  fs.writeFileSync(latestJson, JSON.stringify(report, null, 2), "utf8");

  // Write HTML if requested
  if (opts && opts.html) {
    var html = generateHtmlReport(phase, manifest, report);
    fs.writeFileSync(htmlPath, html, "utf8");
    fs.writeFileSync(latestHtml, html, "utf8");
  }

  return jsonPath;
}
// Read and parse an artifact JSON file from the spec-kit directory
function readArtifact(filename) {
  var filePath = path.join(PRODUCT_ROOT, "spec-kit", filename);
  if (!fs.existsSync(filePath)) {
    console.error("[speckit] Missing artifact: spec-kit/" + filename);
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8"));// reads the file
}
// Define the required artifacts for each phase of the governance process
var PHASE_ARTIFACTS = {
  BRIEF: ["BRIEF.md"],
  SPEC:  ["SPEC.json"],
  PLAN:  ["SPEC.json", "PLAN.json"],
  TASKS: ["SPEC.json", "TASKS.json", "PLAN.json"],
  IMPL:  ["SPEC.json", "TASKS.json", "PLAN.json", "IMPL.json"]
};

// ============================================================================
function cmdWatch(phase) {
  var validPhases = Object.keys(PHASE_ARTIFACTS);
  if (validPhases.indexOf(phase) === -1) {
    console.error('  Unknown phase: ' + phase);
    console.error('     Valid phases: ' + validPhases.join(', '));
    process.exit(1);
  }

  var gitIndex = path.join(PRODUCT_ROOT, '.git', 'index');

  console.log('');
  console.log('============================================================');
  console.log('  Speckit Watch Mode');
  console.log('============================================================');
  console.log('');
  console.log('  Phase:       ' + phase);
  console.log('  Watching:    git staging events');
  console.log('  Triggers:    when files are staged (git add)');
  console.log('');
  console.log('  Waiting for staging...');
  console.log('  Press Ctrl+C to stop.');
  console.log('');

  if (!fs.existsSync(gitIndex)) {
    console.error('  Not a git repository or no .git/index found.');
    console.error('  Watch mode requires a git repository.');
    process.exit(1);
  }

  var lastIndexMtime = fs.statSync(gitIndex).mtimeMs;

  // Run once immediately
  runAndReport(phase);

  // Watch for git index changes (staging, committing, resetting)
  fs.watch(gitIndex, function(eventType) {
    try {
      var currentMtime = fs.statSync(gitIndex).mtimeMs;
      if (currentMtime === lastIndexMtime) return;
      lastIndexMtime = currentMtime;

      if (cmdWatch._timer) clearTimeout(cmdWatch._timer);
      cmdWatch._timer = setTimeout(function() {
        console.log('[Staging detected] (' + eventType + ')');
        console.log('  ' + '-'.repeat(50));
        runAndReport(phase);
      }, 500);
    } catch (e) {
      // .git/index might be temporarily locked
    }
  });

  console.log('');
}

var _lastReport = null;

function runAndReport(phase) {
  try {
    if (!fs.existsSync(GOVERNANCE_EVALUATOR)) {
      console.error("    Governance evaluator not found.");
      return;
    }

    var ctx = buildContext(phase); // read all artifacts from spec-kit and server files into context
    var ep = require(GOVERNANCE_EVALUATOR); // critical - this will clear the require cache and re-load the evaluator code on every run
    var manifest = ep.evaluatePhase(phase, ctx); // run the evaluation for the phase and get the manifest with results

    var reportPath = saveReport(phase, manifest, opts);
    _lastReport = manifest;

    var passed = manifest.summary.passed;
    var total = manifest.summary.total_gates;
    var hardFail = manifest.summary.hard_failures;
    var status = hardFail > 0 ? (hardFail + " HARD failure(s)") : "ALL CLEAR";

    console.log("    [" + new Date().toLocaleTimeString() + "] " + phase + " -> " + manifest.transition.to + ": " + passed + "/" + total + " gates passed. " + status);

  } catch (err) {
    console.error("    Error: " + err.message);
  }
}

// ============================================================================
// Context builder
// ============================================================================

function buildContext(phase) { //critical function that reads all the relevant artifacts for the phase and builds a context object that is passed to the evaluator. This includes reading SPEC.json, TASKS.json, PLAN.json, IMPL.json, and also scanning server source files for additional context.
  var ctx = {};

  if (phase === "BRIEF") {
    var briefPath = path.join(PRODUCT_ROOT, "spec-kit", "BRIEF.md");
    if (fs.existsSync(briefPath)) {
      ctx.problem_statement = fs.readFileSync(briefPath, "utf8").trim();
    }
    return ctx;
  }

  var spec = readArtifact("SPEC.json");
  if (spec) {
    ctx.compliance = spec.compliance || [];
    ctx.pii_fields = spec.pii_fields || [];
    ctx.encryption = spec.encryption || null;
    ctx.payment_card_data_present = spec.payment_card_data_present || false;
    ctx.admin_capability_present = spec.admin_capability_present || false;
    ctx.authentication = spec.authentication || null;
    ctx.user_data_stored = spec.user_data_stored || false;
    ctx.retention_policy = spec.retention_policy || null;
    ctx.contradictions = spec.contradictions || [];
    ctx.problem_statement = spec.problem_statement || null;
    ctx.requirements = spec.requirements || [];
    ctx.spec = spec;
  }

  var tasks = readArtifact("TASKS.json");
  if (tasks) {
    ctx.tasks = tasks.tasks || [];
  }

  var plan = readArtifact("PLAN.json");
  if (plan) {
    ctx.components = (plan.architecture && plan.architecture.components) || [];
    ctx.plan = plan;
  }

  var impl = readArtifact("IMPL.json");
  if (impl) {
    ctx.impl = impl;
    ctx.impl.test_results = impl.test_results || [];
    ctx.impl.console_errors = impl.console_errors;
    ctx.impl.security_violations = impl.security_violations || [];
    ctx.impl.requirement_coverage = impl.requirement_coverage || [];
    ctx.impl.task_notes = impl.task_notes || {};
    ctx.impl.task_coverage = impl.task_coverage || {};
    ctx.impl.deployment_checklist = impl.deployment_checklist || [];
  }

  ctx.files = [];
  var serverDir = path.join(PRODUCT_ROOT, "server");
  if (fs.existsSync(serverDir)) {
    var scanFiles = [];
    function collectFiles(dir) {
      var entries = fs.readdirSync(dir, { withFileTypes: true });
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== ".git") {
          collectFiles(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".ts") || entry.name.endsWith(".json") || entry.name.endsWith(".env"))) {
          scanFiles.push(fullPath);
        }
      }
    }
    collectFiles(serverDir);
    for (var j = 0; j < scanFiles.length; j++) {
      try {
        var f = scanFiles[j];
        var content = fs.readFileSync(f, "utf8");
        var relPath = path.relative(PRODUCT_ROOT, f);
        ctx.files.push({ path: relPath, content: content });
      } catch (e) {
        // skip unreadable files
      }
    }
  }

  return ctx;
}

// ============================================================================
// Display helpers
// ============================================================================

function padEnd(s, len) {
  while (s.length < len) s += " ";
  return s;
}

function printGateResult(g) {
  var icon;
  if (g.result === "PASS") icon = "\u2705";
  else if (g.result === "FAIL") icon = "\u26D4";
  else icon = "\u26A0\uFE0F";
  var severity;
  if (g.gate && g.gate.startsWith("SG-")) severity = "SOFT";
  else if (g.gate && g.gate.startsWith("INFO-")) severity = "INFO";
  else severity = "HARD";
  var reason = g.reason || "";
  if (reason.length > 90) reason = reason.substring(0, 87) + "...";
  console.log("  " + icon + " " + padEnd(g.gate || "", 16) + " " + padEnd("(" + severity + ")", 8) + " " + reason);
}

// ============================================================================
// Gate command
// ============================================================================

function cmdGate(phase, opts) { // main function to run the gate evaluation for a given phase, print results to console, and save report to file. It also handles the exit code based on whether the transition is allowed or blocked.

  console.log("");
  console.log("============================================================");
  console.log("  Speckit Gate Evaluator");
  console.log("============================================================");
  console.log("");
  console.log("  Product:     " + path.basename(PRODUCT_ROOT));
  console.log("  Phase:       " + phase);
  console.log("  Governance:  local (development)");
  console.log("");

  var validPhases = Object.keys(PHASE_ARTIFACTS);
  if (validPhases.indexOf(phase) === -1) {
    console.error("  Unknown phase: " + phase);
    console.error("     Valid phases: " + validPhases.join(", "));
    process.exit(1);
  }

  if (!fs.existsSync(GOVERNANCE_EVALUATOR)) {
    console.error("  Governance evaluator not found at:");
    console.error("     " + GOVERNANCE_EVALUATOR);
    process.exit(1);
  }

  var ctx = buildContext(phase);
  console.log("  Artifacts loaded: " + (ctx.requirements ? ctx.requirements.length : 0) + " requirements, " +
    (ctx.tasks ? ctx.tasks.length : 0) + " tasks, " +
    (ctx.components ? ctx.components.length : 0) + " components");
  console.log("");

  var ep = require(GOVERNANCE_EVALUATOR);
  var manifest = ep.evaluatePhase(phase, ctx);

  console.log("  Gate Results:");
  console.log("  " + "-".repeat(70));

  for (var i = 0; i < manifest.gates.length; i++) {
    printGateResult(manifest.gates[i]);
  }

  console.log("  " + "-".repeat(70));
  console.log("");
  console.log("  Summary:");
  console.log("    Total:     " + manifest.summary.total_gates);
  console.log("    Passed:    " + manifest.summary.passed);
  console.log("    Failures:  " + manifest.summary.hard_failures + " (HARD)");
  console.log("    Warnings:  " + manifest.summary.soft_warnings + " (SOFT)");
  console.log("");

  var reportPath = saveReport(phase, manifest, opts);
  if (opts.outFile) {
    var outPath = path.resolve(PRODUCT_ROOT, opts.outFile);
    var outDir = path.dirname(outPath);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.copyFileSync(reportPath, outPath);
    console.log("  Report saved: " + opts.outFile);
  } else {
    console.log("  Report saved: " + reportPath);
  }
  console.log("");

  if (manifest.transition_allowed) {
    console.log("  ALL HARD GATES PASSED");
    console.log("  " + phase + " -> " + manifest.transition.to + " transition is UNLOCKED.");
    console.log("");
    process.exit(0);
  } else {
    console.log("  " + manifest.blocking_failures.length + " HARD GATE(S) FAILED");
    console.log("  " + phase + " -> " + manifest.transition.to + " transition is BLOCKED.");
    console.log("");
    console.log("  Blocking failures:");
    for (var k = 0; k < manifest.blocking_failures.length; k++) {
      var f = manifest.blocking_failures[k];
      var msg = f.reason || "";
      if (msg.length > 120) msg = msg.substring(0, 117) + "...";
      console.log("    " + f.gate + " - " + msg);
    }
    console.log("");
    process.exit(1);
  }
}

// ============================================================================
// List gates command
// ============================================================================

function cmdListGates(phase) {
  var ge;
  try {
    ge = require("@lishavarughese-private/governance/gate-evaluator");
  } catch (e2) {
    ge = require(path.join(GOVERNANCE_REPO_PATH, "governance", "evaluator", "gate-evaluator"));
  }
  var ep = require(GOVERNANCE_EVALUATOR);

  if (phase) {
    var folders = ep.PHASE_FOLDERS[phase];
    if (!folders) {
      console.error("Unknown phase: " + phase);
      process.exit(1);
    }
    console.log("\nGates for " + phase + " phase:");
    var seen = {};
    for (var f = 0; f < folders.length; f++) {
      var gs = ge.listGatesByPhase(folders[f]);
      for (var i = 0; i < gs.length; i++) {
        if (!seen[gs[i]]) {
          seen[gs[i]] = true;
          console.log("  " + gs[i]);
        }
      }
    }
    console.log("");
  } else {
    console.log("\nAll phases and their gates:");
    var phases = Object.keys(ep.PHASE_FOLDERS);
    for (var p = 0; p < phases.length; p++) {
      console.log("\n  " + phases[p] + ":");
      var seen = {};
      var folders = ep.PHASE_FOLDERS[phases[p]];
      for (var f = 0; f < folders.length; f++) {
        var gs = ge.listGatesByPhase(folders[f]);
        for (var i = 0; i < gs.length; i++) {
          if (!seen[gs[i]]) {
            seen[gs[i]] = true;
            console.log("    " + gs[i]);
          }
        }
      }
    }
    console.log("");
  }
}

// ============================================================================
// Help
// ============================================================================

function cmdHelp() {
  console.log("");
  console.log("Spec-Kit CLI - Phase Gate Evaluator");
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/speckit.js gate <phase>              Run gates for a phase");
  console.log("  node scripts/speckit.js gate <phase> --html      Run gates and generate HTML report");
  console.log("  node scripts/speckit.js gate --auto               Auto-detect phase and run gates");
  console.log("  node scripts/speckit.js gate --auto --html        Auto-detect, run gates, generate HTML");
  console.log("  node scripts/speckit.js gate --auto         Auto-detect phase and run gates Run gates and save report to file");
  console.log("  node scripts/speckit.js watch <phase>             Watch for git staging and auto-trigger gates");
  console.log("  node scripts/speckit.js list-gates [phase]        List gates for a phase");
  console.log("  node scripts/speckit.js help                      Show this help");
  console.log("");
  console.log("Phases: " + Object.keys(PHASE_ARTIFACTS).join(", "));
  console.log("");
  console.log("Examples:");
  console.log("  node scripts/speckit.js gate TASKS");
  console.log("  node scripts/speckit.js gate SPEC --out reports/latest-spec-report.json");
  console.log("  node scripts/speckit.js watch TASKS");
  console.log("  node scripts/speckit.js watch SPEC");
  console.log("  node scripts/speckit.js list-gates");
  console.log("  node scripts/speckit.js list-gates TASKS");
  console.log("");
}

// ============================================================================
// Auto-detect current phase from artifacts
// ============================================================================

function detectPhase() {
  var artifacts = {
    SPEC:  path.join(PRODUCT_ROOT, "spec-kit", "SPEC.json"),
    PLAN:  path.join(PRODUCT_ROOT, "spec-kit", "PLAN.json"),
    TASKS: path.join(PRODUCT_ROOT, "spec-kit", "TASKS.json"),
    IMPL:  path.join(PRODUCT_ROOT, "spec-kit", "IMPL.json")
  };
  // Check from most advanced to least
  if (fs.existsSync(artifacts.IMPL)) return "IMPL";
  if (fs.existsSync(artifacts.TASKS)) return "TASKS";
  if (fs.existsSync(artifacts.PLAN)) return "PLAN";
  if (fs.existsSync(artifacts.SPEC)) return "SPEC";
  return null;
}

// ============================================================================
// Generate HTML report
// ============================================================================

function generateHtmlReport(phase, manifest) {
  var summary = manifest.summary;
  var total = summary.total_gates;
  var passed = summary.passed;
  var hardFail = summary.hard_failures;
  var softWarn = summary.soft_warnings;

  var rows = manifest.gates.map(function(g) {
    var icon = g.result === "PASS" ? "&#x2705;" : "&#x26D4;";
    var color = g.result === "PASS" ? "green" : "red";
    return '<tr style="color: ' + color + '">' +
      '<td>' + icon + '</td>' +
      '<td>' + (g.gate || "") + '</td>' +
      '<td>' + (g.severity || "") + '</td>' +
      '<td>' + (g.result || "") + '</td>' +
      '<td>' + (g.reason || "") + '</td>' +
      '</tr>';
  }).join('\n');

  var blocked = manifest.blocking_failures || [];
  var blockRows = blocked.length > 0 ? blocked.map(function(f) {
    return '<tr style="color: red"><td>' + f.gate + '</td><td>' + (f.reason || "") + '</td></tr>';
  }).join('\n') : '<tr><td colspan="2">None</td></tr>';

  return '<!DOCTYPE html>' +
    '<html><head><meta charset="UTF-8">' +
    '<title>Spec-Kit Gate Report - ' + phase + '</title>' +
    '<style>' +
    'body{font-family:Arial,sans-serif;margin:40px;background:#f5f5f5}' +
    'h1{color:#333}' +
    '.summary{background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);margin-bottom:20px}' +
    '.summary span{font-weight:bold}' +
    '.pass{color:green}.fail{color:red}.warn{color:orange}' +
    'table{width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1)}' +
    'th{background:#4a90d9;color:#fff;padding:12px;text-align:left}' +
    'td{padding:10px 12px;border-bottom:1px solid #eee}' +
    'tr:hover{background:#f0f0f0}' +
    '.status-blocked{color:red;font-weight:bold}' +
    '.status-unlocked{color:green;font-weight:bold}' +
    '.footer{text-align:center;margin-top:20px;color:#888;font-size:12px}' +
    '</style></head><body>' +
    '<h1>&#x1F3DB;&#xFE0F; Spec-Kit Gate Report</h1>' +
    '<p>Phase: <strong>' + phase + '</strong> | Evaluated: ' + new Date().toISOString() + '</p>' +

    '<div class="summary">' +
    '<h2>Summary</h2>' +
    '<p>Total: <span>' + total + '</span> | Passed: <span class="pass">' + passed + '</span> | Failures: <span class="fail">' + hardFail + '</span> | Warnings: <span class="warn">' + softWarn + '</span></p>' +
    '<p>Transition: <span class="' + (manifest.transition_allowed ? 'status-unlocked' : 'status-blocked') + '">' +
    (manifest.transition_allowed ? phase + ' -> ' + manifest.transition.to + ' UNLOCKED' : 'BLOCKED by ' + blocked.length + ' hard gate(s)') +
    '</span></p>' +
    '</div>' +

    '<h2>Gate Results</h2>' +
    '<table><thead><tr><th>Status</th><th>Gate</th><th>Severity</th><th>Result</th><th>Reason</th></tr></thead><tbody>' +
    rows +
    '</tbody></table>' +

    (blocked.length > 0 ? '<h2 style="color:red">Blocking Failures</h2>' +
    '<table><thead><tr><th>Gate</th><th>Reason</th></tr></thead><tbody>' +
    blockRows +
    '</tbody></table>' : '') +

    '<p class="footer">Generated by speckit.js | ' + manifest.governance_repo + ' v' + manifest.governance_version + '</p>' +
    '</body></html>';
}

// ============================================================================
// Main dispatcher
// ============================================================================

var args = process.argv.slice(2);
var command = args[0];

if (!command || command === "help" || command === "--help" || command === "-h") {
  cmdHelp();
  process.exit(0);
}

if (command === "gate") {
  var phase = args[1];
  var opts = { html: args.indexOf("--html") !== -1, outFile: null };

  // Auto-detect phase
  if (phase === "--auto" || phase === "auto") {
    phase = detectPhase();
    if (!phase) {
      console.error("  No phase artifacts found in spec-kit/. Nothing to evaluate.");
      process.exit(0);
    }
    console.log("  Auto-detected phase: " + phase);
  }

  var outIndex = args.indexOf("--out");
  if (outIndex !== -1) opts.outFile = args[outIndex + 1];
  cmdGate(phase, opts);
} else if (command === "watch") {
  var phase = args[1];
  if (!phase) {
    console.error("Please specify a phase: node scripts/speckit.js watch <phase>");
    process.exit(1);
  }
  cmdWatch(phase);
} else if (command === "list-gates") {
  cmdListGates(args[1]);
} else {
  console.error("Unknown command: " + command);
  console.error("Run: node scripts/speckit.js help");
  process.exit(1);
}
// Test comment for CI