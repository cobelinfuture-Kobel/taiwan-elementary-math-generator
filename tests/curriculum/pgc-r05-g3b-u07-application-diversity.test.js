import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const runtimePath = path.join(repoRoot, "site/modules/curriculum/batch-a/discrete-fraction-conversion-runtime.js");

const SOURCE_ID = "g3b_u07_3b07";
const KP_ID = "kp_g3b_u07_fraction_unit_conversion";
const GROUP_ID = "pg_g3b_u07_fraction_unit_conversion_application";
const SPEC_IDS = Object.freeze([
  "ps_g3b_u07_fraction_unit_conversion_item_count_application",
  "ps_g3b_u07_fraction_unit_conversion_fractional_units_application",
]);
const G3B_U07_COLLISION_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3b_u07_3b07_application_b8e39c886c50",
  "pgc_r03_g3b_u07_3b07_application_c642e7267e60",
  "pgc_r03_g3b_u07_3b07_application_cc1c7d44244c",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after G3B-U07 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function applicationPlan(seed, questionCount = 20) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    questionMode: "application",
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: seed,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 10, showQuestionNumbers: true, showAnswerKeyPage: true },
  };
}

function assertAccepted20(route, routeId) {
  assert.ok(route, routeId);
  assert.equal(route.sourceId, SOURCE_ID, routeId);
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
    assert.deepEqual([...run.patternSpecIdsObserved].sort(), [...SPEC_IDS].sort(), `${routeId}:${run.seed}`);
  }
}

test("PGC-R05 G3B-U07 producer yields 20 unique prompts with both conversion roles", async () => {
  const { generateG3BU07FractionUnitConversionQuestions } = await import(`${pathToFileURL(runtimePath).href}?r05=${Date.now()}`);
  for (const seed of ["pgc-r05-diagnostic-01", "pgc-r05-diagnostic-02"]) {
    const result = generateG3BU07FractionUnitConversionQuestions(applicationPlan(seed));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, 20, seed);
    assert.equal(new Set(result.questions.map((question) => question.promptText)).size, 20, seed);
    assert.deepEqual([...new Set(result.questions.map((question) => question.requestedUnknownRole))].sort(), ["fractionalUnits", "itemCount"]);
    assert.deepEqual([...new Set(result.questions.map((question) => question.patternSpecId))].sort(), [...SPEC_IDS].sort());
  }
});

test("PGC-R05 G3B-U07 FullFix clears source-unit, single-KP and mixed-unit live collisions", () => {
  const report = loadReport();
  assert.match(report.status, /^(PASS_R05_\d+_OF_211_LIVE_APPLICATION_ROUTES_CONFORMANT|PASS_R05_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION|PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CAPACITY_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS)$/);
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of G3B_U07_COLLISION_ROUTE_IDS) assertAccepted20(byId.get(routeId), routeId);
  const remainingLiveFailures = report.routes.filter((route) => route.sourceId === SOURCE_ID && route.liveAcceptanceFailures.length > 0);
  assert.deepEqual(remainingLiveFailures, []);
  assert.equal(report.summary.liveFailureRouteCountBySource[SOURCE_ID], undefined);
  assert.ok(report.summary.live20PassRouteCount >= 208, JSON.stringify(report.summary));
  assert.ok(report.summary.live20FailRouteCount <= 3, JSON.stringify(report.summary));
  assert.equal(report.summary.live20PassRouteCount + report.summary.live20FailRouteCount, 211);
});

test("PGC-R05 G3B-U07 high-capacity application fixture pool is shared with the ordinary product path", async () => {
  const runtimeSource = fs.readFileSync(runtimePath, "utf8");
  assert.match(runtimeSource, /PGC_R05_APPLICATION_FIXTURES/);
  assert.match(runtimeSource, /roleInterleaving|fractionalUnitRows/);

  const { generateG3BU07FractionUnitConversionQuestions } = await import(`${pathToFileURL(runtimePath).href}?product=${Date.now()}`);
  const result = generateG3BU07FractionUnitConversionQuestions(applicationPlan("ordinary-product-seed", 121));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 121);
  assert.equal(new Set(result.questions.map((question) => question.promptText)).size, 121);
  assert.deepEqual([...new Set(result.questions.map((question) => question.requestedUnknownRole))].sort(), ["fractionalUnits", "itemCount"]);
  assert.deepEqual([...new Set(result.questions.map((question) => question.patternSpecId))].sort(), [...SPEC_IDS].sort());
});

test("PGC-R05 G3B-U07 repair preserves the frozen authority boundary", () => {
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
  const targetRoutes = report.routes.filter((route) => G3B_U07_COLLISION_ROUTE_IDS.includes(route.routeId));
  assert.equal(targetRoutes.length, G3B_U07_COLLISION_ROUTE_IDS.length);
  assert.equal(targetRoutes.every((route) => route.compatiblePatternSpecIds.length === 2), true);
});

// PGC-R05 D0 terminal-status compatibility V2
