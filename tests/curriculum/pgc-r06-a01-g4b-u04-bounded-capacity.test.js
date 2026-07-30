import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  G4B_U04_INVERSE_DIGIT_SET_CASES,
  G4B_U04_INVERSE_ORIGINAL_VALUE_CASES,
  validateG4BU04InverseUniqueCasePools,
} from "../../site/modules/curriculum/batch-b/g4b-u04-inverse-unique-case-pool.js";
import {
  G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R06-A01_G4B_U04_bounded_capacity_diagnostics.md");

const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

test("PGC-R06 A01 materializes exactly 15 G4B-U04 bounded mixed/reasoning routes", () => {
  assert.equal(report.schemaName, "PublicG4BU04BoundedReasoningMixedCapacityDiagnosticsV1");
  assert.equal(report.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(report.taskId, "PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix");
  assert.equal(report.status, "PASS_R06_A01_G4BU04_ALL_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION");
  assert.deepEqual(report.summary, {
    targetRouteCount: 15,
    live20PassRouteCount: 15,
    live20FailRouteCount: 0,
    routeCountByQuestionType: { mixed: 9, reasoning: 6 },
    distinctKnowledgePointCount: 3,
  });
  assert.equal(report.routes.length, 15);
  assert.equal(new Set(report.routes.map((route) => route.routeId)).size, 15);
  assert.equal(report.routes.every((route) => route.sourceId === "g4b_u04_4b04"), true);
  assert.equal(report.routes.every((route) => ["mixed", "reasoning"].includes(route.questionType)), true);
  assert.equal(report.routes.some((route) => route.questionType === "pbl"), false);
});

test("PGC-R06 A01 provides two complete 20-question live witnesses for every target route", () => {
  for (const route of report.routes) {
    assert.equal(route.liveAccepted20AcrossSeeds, true, route.routeId);
    assert.deepEqual(route.liveFailureCodes, [], route.routeId);
    assert.equal(route.diagnosticRuns.length, 2, route.routeId);
    for (const run of route.diagnosticRuns) {
      assert.equal(run.ok, true, `${route.routeId}:${run.seed}`);
      assert.equal(run.questionCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.answerKeyItemCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.uniquePromptCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.duplicatePromptCount, 0, `${route.routeId}:${run.seed}`);
      assert.equal(run.emptyPromptCount, 0, `${route.routeId}:${run.seed}`);
      assert.deepEqual(run.errorCodes, [], `${route.routeId}:${run.seed}`);
      assert.deepEqual(run.acceptanceFailures, [], `${route.routeId}:${run.seed}`);
      assert.equal(typeof run.worksheetSignature, "string", `${route.routeId}:${run.seed}`);
      assert.equal(typeof run.itemSetSignature, "string", `${route.routeId}:${run.seed}`);
    }
  }
});

test("PGC-R06 A01 expands the existing canonical pools without adding a second producer", () => {
  const audit = validateG4BU04InverseUniqueCasePools();
  assert.equal(audit.ok, true, audit.errors.join(","));
  assert.equal(G4B_U04_INVERSE_DIGIT_SET_CASES.length, 24);
  assert.equal(G4B_U04_INVERSE_ORIGINAL_VALUE_CASES.length, 28);
  assert.equal(G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_approx_symbol_reading, 24);
  assert.equal(G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_inverse_digit_set, 24);
  assert.equal(G4B_U04_UNIQUE_PROMPT_CAPACITY_BY_PATTERN_SPEC.ps_g4b_u04_inverse_original_values, 28);
  assert.equal(report.boundary.secondGeneratorAdded, false);
  assert.equal(report.boundary.secondValidatorAdded, false);
  assert.equal(report.boundary.secondWorksheetPipelineAdded, false);
});

test("PGC-R06 A01 preserves PBL and the closed R04/R05 route families", () => {
  assert.deepEqual(report.boundary, {
    pblRoutesModified: false,
    numericRoutesModified: false,
    applicationRoutesModified: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
    slice014Started: false,
  });
});

test("PGC-R06 A01 artifacts stay row-aligned and point to contract reconciliation", () => {
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, 16);
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /STATUS\s+= PASS_R06_A01_G4BU04_ALL_15_BOUNDED_ROUTES_LIVE_20_CONFORMANT_PENDING_CONTRACT_RECONCILIATION/);
  assert.match(readback, /LIVE_20_PASS_ROUTES\s+= 15/);
  assert.match(readback, /LIVE_20_FAIL_ROUTES\s+= 0/);
  assert.match(readback, /NEXT_SHORTEST_STEP\s+= PGC-R06-A01_CapacityContractReconciliationAndCloseout/);
});
