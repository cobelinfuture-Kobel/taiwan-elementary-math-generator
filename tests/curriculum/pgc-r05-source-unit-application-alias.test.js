import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");

const SOURCE_UNIT_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3a_u02_3a02_application_b99330741f7a",
  "pgc_r03_g3a_u03_3a03_application_ba1d3773b32f",
  "pgc_r03_g3a_u06_3a06_application_4da5b561b50f",
  "pgc_r03_g3b_u01_3b01_application_807998db5d0e",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after alias projection repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

test("PGC-R05 source-unit application routes retain application aliases and produce complete 20-question worksheets", () => {
  const report = loadReport();
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of SOURCE_UNIT_ROUTE_IDS) {
    const route = byId.get(routeId);
    assert.ok(route, routeId);
    assert.equal(route.selectionMode, "sourceUnit", routeId);
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
      assert.equal(run.runtimeLineage.authoritativeCutoverApplied, true, `${routeId}:${run.seed}`);
      assert.equal(run.runtimeLineage.documentQuestionMode, "application", `${routeId}:${run.seed}`);
      assert.equal(run.runtimeLineage.documentAuthorityMode, "GLOBAL_PRIMARY", `${routeId}:${run.seed}`);
      assert.ok(run.patternSpecIdsObserved.length > 0, `${routeId}:${run.seed}`);
    }
  }
  assert.ok(report.summary.live20FailRouteCount <= 35, JSON.stringify(report.summary));
});

test("PGC-R05 source-unit alias repair remains a shared projection fix within the frozen scope", () => {
  const report = loadReport();
  assert.deepEqual(report.boundary, {
    numericRoutesModified: false,
    reasoningMixedOrPblRoutesModified: false,
    globalApplicationAuthorityReplaced: false,
    secondGeneratorAdded: false,
    secondValidatorAdded: false,
    secondWorksheetPipelineAdded: false,
    slice014Started: false,
  });
  const repaired = report.routes.filter((route) => SOURCE_UNIT_ROUTE_IDS.includes(route.routeId));
  assert.equal(repaired.length, SOURCE_UNIT_ROUTE_IDS.length);
  assert.equal(repaired.every((route) => route.questionType === "application"), true);
  assert.equal(repaired.every((route) => route.diagnosticRuns.every((run) => run.runtimeLineage.authoritativeCutoverApplied === true)), true);
});
