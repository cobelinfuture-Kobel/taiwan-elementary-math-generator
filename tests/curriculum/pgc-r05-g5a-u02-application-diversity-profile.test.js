import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const bundlePath = path.join(repoRoot, "site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js");
const PROFILE_ID = "pgc-r05-application-diversity-v1";

const G5A_U02_LIVE_FAILURE_ROUTE_IDS = Object.freeze([
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

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after the G5A-U02 profile repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function assertAcceptedRoute(route, routeId) {
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
    assert.ok(run.patternSpecIdsObserved.length > 0, `${routeId}:${run.seed}`);
  }
}

test("PGC-R05 G5A-U02 application diversity profile eliminates all sixteen live prompt collisions", () => {
  const report = loadReport();
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of G5A_U02_LIVE_FAILURE_ROUTE_IDS) assertAcceptedRoute(byId.get(routeId), routeId);
  const remainingG5Failures = report.routes.filter((route) => route.sourceId === "g5a_u02_5a02" && route.liveAcceptanceFailures.length > 0);
  assert.deepEqual(remainingG5Failures, []);
  assert.ok(report.summary.live20FailRouteCount <= 19, JSON.stringify(report.summary));
});

test("PGC-R05 G5A-U02 profile is connected through the canonical browser bundle", () => {
  assert.equal(fs.existsSync(bundlePath), true);
  const bundle = fs.readFileSync(bundlePath, "utf8");
  assert.match(bundle, /GENERATED CANONICAL G5A-U02 RUNTIME — DO NOT EDIT/);
  assert.match(bundle, new RegExp(PROFILE_ID));
});

test("PGC-R05 G5A-U02 repair preserves the frozen application authority boundary", () => {
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
  const targetRoutes = report.routes.filter((route) => G5A_U02_LIVE_FAILURE_ROUTE_IDS.includes(route.routeId));
  assert.equal(targetRoutes.length, G5A_U02_LIVE_FAILURE_ROUTE_IDS.length);
  assert.equal(targetRoutes.every((route) => route.compatiblePatternSpecIds.length > 0), true);
});
