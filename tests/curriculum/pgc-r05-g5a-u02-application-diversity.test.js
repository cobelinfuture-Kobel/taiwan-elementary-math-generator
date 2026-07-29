import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const bundlePath = path.join(repoRoot, "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js");

const G5A_U02_REPAIR_ROUTE_IDS = Object.freeze([
  "pgc_r03_g5a_u02_5a02_application_b9ea7527439b",
  "pgc_r03_g5a_u02_5a02_application_1c9080443536",
  "pgc_r03_g5a_u02_5a02_application_985d770c5a99",
  "pgc_r03_g5a_u02_5a02_application_46bda35b3c7f",
  "pgc_r03_g5a_u02_5a02_application_7ad26b5a5dbd",
  "pgc_r03_g5a_u02_5a02_application_0e41b6bbcd12",
  "pgc_r03_g5a_u02_5a02_application_aeea91eb2db0",
  "pgc_r03_g5a_u02_5a02_application_cedc8aeaa8a2",
  "pgc_r03_g5a_u02_5a02_application_f1433085b802",
  "pgc_r03_g5a_u02_5a02_application_9c0c742bdbca",
  "pgc_r03_g5a_u02_5a02_application_3f549bdc074b",
  "pgc_r03_g5a_u02_5a02_application_bc48afaa90f5",
  "pgc_r03_g5a_u02_5a02_application_bf4951ab578f",
  "pgc_r03_g5a_u02_5a02_application_6245f0f37bb5",
  "pgc_r03_g5a_u02_5a02_application_2dbacc7cea7a",
  "pgc_r03_g5a_u02_5a02_application_3c391854287a",
]);

const REPAIRED_PATTERN_IDS = new Set([
  "ps_g5a_u02_equal_partition_all_segment_counts",
  "ps_g5a_u02_equal_partition_range_constrained_recipients",
  "ps_g5a_u02_maximum_equal_grouping",
  "ps_g5a_u02_possible_equal_packaging_counts",
  "ps_g5a_u02_rectangle_square_side_lengths",
  "ps_g5a_u02_square_tile_area_possibilities",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after G5A-U02 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

test("PGC-R05 G5A-U02 application routes produce two complete unique 20-question worksheets", () => {
  const report = loadReport();
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of G5A_U02_REPAIR_ROUTE_IDS) {
    const route = byId.get(routeId);
    assert.ok(route, routeId);
    assert.equal(route.sourceId, "g5a_u02_5a02", routeId);
    assert.equal(route.questionType, "application", routeId);
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
      assert.equal(run.runtimeLineage.documentQuestionMode, "application", `${routeId}:${run.seed}`);
      assert.equal(run.runtimeLineage.documentAuthorityMode, "GLOBAL_PRIMARY", `${routeId}:${run.seed}`);
      assert.ok(run.patternSpecIdsObserved.length > 0, `${routeId}:${run.seed}`);
      assert.equal(run.patternSpecIdsObserved.every((id) => REPAIRED_PATTERN_IDS.has(id)), true, `${routeId}:${run.seed}`);
    }
  }
  assert.ok(report.summary.live20FailRouteCount <= 19, JSON.stringify(report.summary));
});

test("PGC-R05 G5A-U02 diversity repair remains on canonical source-to-bundle lineage", () => {
  assert.equal(fs.existsSync(bundlePath), true);
  const bundle = fs.readFileSync(bundlePath, "utf8");
  assert.match(bundle, /^\/\* GENERATED CANONICAL G5A-U02 RUNTIME — DO NOT EDIT \*\//);
  assert.match(bundle, /pgc-r05-application-diversity-v1/);
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
});
