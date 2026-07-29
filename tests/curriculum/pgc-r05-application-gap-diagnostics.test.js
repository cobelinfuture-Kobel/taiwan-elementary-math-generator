import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/application_generation_gap_inventory.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R05_application_generation_gap_diagnostics.md");

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 application diagnostic report must be materialized before acceptance");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

test("PGC-R05 baseline consumes the accepted R03 application-route authority", () => {
  const report = loadReport();
  assert.equal(report.schemaName, "PublicApplicationGenerationGapDiagnosticsV1");
  assert.equal(report.schemaVersion, 1);
  assert.equal(report.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(report.taskId, "PGC-R05_ApplicationGenerationFullFix_RuntimeGapDiagnostics");
  assert.match(report.status, /^PASS_R05_(?:\d+_OF_\d+_LIVE_APPLICATION_ROUTES_CONFORMANT|ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION)$/);
  assert.equal(report.applicationQuestionType, "application");
  assert.deepEqual(report.diagnosticSeeds, ["pgc-r05-diagnostic-01", "pgc-r05-diagnostic-02"]);
  assert.ok(report.summary.applicationRouteCount > 0);
  assert.ok(report.summary.legalApplicationRouteCount > 0);
  assert.equal(report.routes.length, report.summary.legalApplicationRouteCount);
  assert.equal(
    report.summary.live20PassRouteCount + report.summary.live20FailRouteCount,
    report.summary.legalApplicationRouteCount,
  );
  assert.equal(
    Object.values(report.summary.liveFailureRouteCountBySource).reduce((sum, count) => sum + count, 0),
    report.summary.live20FailRouteCount,
  );
});

test("PGC-R05 materializes two live 20-question witnesses for every legal application route", () => {
  const report = loadReport();
  for (const route of report.routes) {
    assert.equal(route.questionType, "application", route.routeId);
    assert.equal(route.diagnosticRuns.length, 2, route.routeId);
    assert.equal(typeof route.accepted20AcrossSeeds, "boolean", route.routeId);
    assert.equal(typeof route.requiresRepair, "boolean", route.routeId);
    assert.ok(Array.isArray(route.contractGapCodes), route.routeId);
    assert.ok(Array.isArray(route.liveAcceptanceFailures), route.routeId);
    for (const run of route.diagnosticRuns) {
      assert.equal(run.requestedQuestionCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(typeof run.ok, "boolean", `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.errorCodes), `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.acceptanceFailures), `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.patternSpecIdsObserved), `${route.routeId}:${run.seed}`);
      assert.ok(Array.isArray(run.itemSamples), `${route.routeId}:${run.seed}`);
      assert.equal(typeof run.runtimeLineage, "object", `${route.routeId}:${run.seed}`);
    }
  }
});

test("PGC-R05 repair classification is exactly the union of contract and live runtime gaps", () => {
  const report = loadReport();
  const repairRoutes = report.routes.filter((route) => route.requiresRepair);
  assert.equal(repairRoutes.length, report.summary.repairRouteCount);
  assert.equal(
    report.routes.filter((route) => route.accepted20AcrossSeeds).length,
    report.summary.live20PassRouteCount,
  );
  for (const route of report.routes) {
    assert.equal(
      route.requiresRepair,
      route.contractGapCodes.length > 0 || route.liveAcceptanceFailures.length > 0,
      route.routeId,
    );
    assert.equal(
      route.accepted20AcrossSeeds,
      route.liveAcceptanceFailures.length === 0 && route.diagnosticRuns.length === 2,
      route.routeId,
    );
  }
});

test("PGC-R05 baseline preserves the frozen producer-consumer boundary", () => {
  const report = loadReport();
  assert.equal(report.routes.some((route) => route.questionType !== "application"), false);
  assert.deepEqual(report.boundary, {
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    globalApplicationAuthorityReplaced: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
    slice014Started: false,
  });
});

test("PGC-R05 committed baseline artifacts remain row-aligned and resume the shortest live mainline step", () => {
  const report = loadReport();
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, report.routes.length + 1);
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /## Live failures by source/);
  assert.match(readback, /NEXT_SHORTEST_STEP\s+= PGC-R05_[A-Za-z0-9_]+/);
  assert.doesNotMatch(readback, /NEXT_SHORTEST_STEP\s+= PGC-R0[46]_/);
  assert.doesNotMatch(readback, /NEXT_SHORTEST_STEP\s+= PGC-R05_ApplicationProducerAndContextAllocatorFullFix/);
  assert.match(readback, /LEGAL_APPLICATION_ROUTES|REPAIR_ROUTES/);
});
