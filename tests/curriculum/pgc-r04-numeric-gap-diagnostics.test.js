import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R04.numeric-gap-diagnostics.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/numeric_generation_gap_inventory.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R04_numeric_generation_gap_diagnostics.md");

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R04 diagnostic report must be materialized before acceptance");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

test("PGC-R04 diagnostic scope matches the accepted R03 numeric-like baseline", () => {
  const report = loadReport();
  assert.equal(report.schemaName, "PublicNumericGenerationGapDiagnosticsV1");
  assert.equal(report.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(report.taskId, "PGC-R04_NumericGenerationFullFix_RuntimeGapDiagnostics");
  assert.equal(report.status, "PASS_DIAGNOSTIC_EVIDENCE_MATERIALIZED");
  assert.deepEqual([...report.numericLikeQuestionTypes].sort(), ["concept", "numeric", "operation_estimation"]);
  assert.equal(report.summary.numericLikeRouteCount, 195);
  assert.equal(report.summary.legalNumericLikeRouteCount, 193);
  assert.equal(report.summary.illegalNumericLikeRouteCount, 2);
  assert.equal(report.summary.verified20NumericLikeRouteCount, 124);
  assert.equal(report.summary.limitedNumericLikeRouteCount, 69);
  assert.equal(report.summary.qualityGapNumericLikeRouteCount, 40);
  assert.equal(report.summary.fixtureSelectorRouteCount, 36);
  assert.equal(report.summary.boundedDiversityRouteCount, 4);
  assert.equal(report.summary.zeroSafeCapacityRouteCount, 0);
});

test("PGC-R04 materializes runtime evidence for every owned numeric gap route", () => {
  const report = loadReport();
  assert.equal(report.routes.length, report.summary.diagnosedGapRouteCount);
  assert.ok(report.routes.length >= report.summary.limitedNumericLikeRouteCount);
  for (const route of report.routes) {
    assert.ok(report.numericLikeQuestionTypes.includes(route.questionType), route.routeId);
    assert.ok(route.currentVerifiedMaxQuestionCount < 20 || route.currentQualityStatus !== "DIVERSE_PARAMETER_GENERATOR", route.routeId);
    assert.ok(route.r04GapCodes.length > 0, route.routeId);
    assert.ok(route.diagnosticRuns.length >= 2, route.routeId);
    for (const run of route.diagnosticRuns) {
      assert.ok([20, route.currentVerifiedMaxQuestionCount].includes(run.requestedQuestionCount), `${route.routeId}:${run.seed}`);
      assert.equal(typeof run.ok, "boolean", `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.errorCodes), `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.patternSpecIdsObserved), `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.itemSamples), `${route.routeId}:${run.seed}`);
      assert.equal(typeof run.runtimeLineage, "object", `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.runtimeLineage.resultKeys), `${route.routeId}:${run.seed}`);
    }
  }
});

test("PGC-R04 diagnostics preserve the frozen scope boundary", () => {
  const report = loadReport();
  assert.equal(report.routes.some((route) => ["application", "reasoning", "mixed", "pbl"].includes(route.questionType)), false);
  assert.deepEqual(report.boundary, {
    applicationRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
    slice014Started: false,
  });
});

test("PGC-R04 committed diagnostics are row-aligned and hand off to the shared numeric FullFix", () => {
  const report = loadReport();
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, report.routes.length + 1);
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /NEXT_SHORTEST_STEP\s+= PGC-R04_SharedNumericGeneratorAndAllocatorFullFix/);
  assert.match(readback, /NUMERIC_LIKE_ROUTES|DIAGNOSED_GAP_ROUTES/);
});
