import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");

const REPAIRED_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3a_u08_3a08_application_6a5ba7c30adf",
  "pgc_r03_g4b_u06_4b06_application_243390fad850",
  "pgc_r03_g4b_u06_4b06_application_19f9fc46c516",
  "pgc_r03_g5a_u04_5a04_application_65896cc9040b",
  "pgc_r03_g5a_u04_5a04_application_2048c4ff7f60",
  "pgc_r03_g5a_u04_5a04_application_4bb5fbe70448",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after the capacity patch");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

test("PGC-R05 bounded application authorities now produce two unique 20-question worksheets", () => {
  const report = loadReport();
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of REPAIRED_ROUTE_IDS) {
    const route = byId.get(routeId);
    assert.ok(route, routeId);
    assert.equal(route.accepted20AcrossSeeds, true, routeId);
    assert.deepEqual(route.liveAcceptanceFailures, [], routeId);
    assert.equal(route.diagnosticRuns.length, 2, routeId);
    for (const run of route.diagnosticRuns) {
      assert.equal(run.ok, true, `${routeId}:${run.seed}`);
      assert.equal(run.questionCount, 20, `${routeId}:${run.seed}`);
      assert.equal(run.answerKeyItemCount, 20, `${routeId}:${run.seed}`);
      assert.equal(run.emptyPromptCount, 0, `${routeId}:${run.seed}`);
      assert.equal(run.duplicatePromptCount, 0, `${routeId}:${run.seed}`);
      assert.equal(run.uniquePromptCount, 20, `${routeId}:${run.seed}`);
      assert.deepEqual(run.errorCodes, [], `${routeId}:${run.seed}`);
    }
  }
  assert.ok(report.summary.live20FailRouteCount <= 39, JSON.stringify(report.summary));
});

test("PGC-R05 bounded repair preserves scope and existing application authority lineage", () => {
  const report = loadReport();
  const repaired = report.routes.filter((route) => REPAIRED_ROUTE_IDS.includes(route.routeId));
  assert.equal(repaired.length, REPAIRED_ROUTE_IDS.length);
  for (const route of repaired) {
    for (const run of route.diagnosticRuns) {
      assert.equal(run.runtimeLineage.documentQuestionMode, "application", `${route.routeId}:${run.seed}`);
      assert.equal(run.runtimeLineage.authoritativeCutoverApplied || run.runtimeLineage.documentAuthorityMode != null || run.patternSpecIdsObserved.length > 0, true, `${route.routeId}:${run.seed}`);
    }
  }
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
