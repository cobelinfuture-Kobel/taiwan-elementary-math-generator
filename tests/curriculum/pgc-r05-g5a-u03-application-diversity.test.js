import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const runtimePath = path.join(repoRoot, "site/modules/curriculum/batch-a/factor-multiple-runtime.js");
const routerPath = path.join(repoRoot, "site/modules/curriculum/batch-a/batch-a-browser-question-router.js");

const SOURCE_ID = "g5a_u03_5a03a";
const KP_ID = "kp_g5a_u03a_multiple_identify_enumerate";
const GROUP_ID = "p01e_app_pg_g5a_u03_enumerate_multiples";
const SPEC_ID = "ps_g5a_u03a_enumerate_first_multiples";
const ROUTE_ID = "pgc_r03_g5a_u03_5a03a_application_dd8c2f7468ec";

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after final G5A-U03 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function applicationOptions(seed, questionCount = 20) {
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
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 10,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

function assertAccepted20(route) {
  assert.ok(route, ROUTE_ID);
  assert.equal(route.sourceId, SOURCE_ID);
  assert.equal(route.selectionMode, "singleKnowledgePoint");
  assert.equal(route.questionType, "application");
  assert.deepEqual(route.compatiblePatternSpecIds, [SPEC_ID]);
  assert.equal(route.accepted20AcrossSeeds, true);
  assert.deepEqual(route.liveAcceptanceFailures, []);
  assert.equal(route.diagnosticRuns.length, 2);
  for (const run of route.diagnosticRuns) {
    assert.equal(run.ok, true, `${ROUTE_ID}:${run.seed}`);
    assert.equal(run.questionCount, 20, `${ROUTE_ID}:${run.seed}`);
    assert.equal(run.answerKeyItemCount, 20, `${ROUTE_ID}:${run.seed}`);
    assert.equal(run.emptyPromptCount, 0, `${ROUTE_ID}:${run.seed}`);
    assert.equal(run.duplicatePromptCount, 0, `${ROUTE_ID}:${run.seed}`);
    assert.equal(run.uniquePromptCount, 20, `${ROUTE_ID}:${run.seed}`);
    assert.deepEqual(run.errorCodes, [], `${ROUTE_ID}:${run.seed}`);
    assert.deepEqual(run.patternSpecIdsObserved, [SPEC_ID], `${ROUTE_ID}:${run.seed}`);
    assert.deepEqual(run.knowledgePointIdsObserved, [KP_ID], `${ROUTE_ID}:${run.seed}`);
  }
}

test("PGC-R05 G5A-U03 final producer traverses 20 unique base/count pairs for both diagnostic seeds", async () => {
  const { generateBatchABrowserQuestions } = await import(`${pathToFileURL(routerPath).href}?r05=${Date.now()}`);
  for (const seed of ["pgc-r05-diagnostic-01", "pgc-r05-diagnostic-02"]) {
    const result = generateBatchABrowserQuestions(applicationOptions(seed));
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, 20, seed);
    assert.equal(new Set(result.questions.map((question) => question.promptText)).size, 20, seed);
    assert.equal(result.questions.every((question) => question.patternSpecId === SPEC_ID), true, seed);
    assert.equal(result.questions.every((question) => question.metadata?.knowledgePointId === KP_ID), true, seed);
    assert.equal(new Set(result.questions.map((question) => `${question.base}:${question.count}`)).size, 20, seed);
  }
});

test("PGC-R05 G5A-U03 FullFix closes all 211 legal live application routes", () => {
  const report = loadReport();
  assert.equal(report.status, "PASS_R05_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_PENDING_CONTRACT_RECONCILIATION");
  assertAccepted20(report.routes.find((route) => route.routeId === ROUTE_ID));
  assert.equal(report.summary.legalApplicationRouteCount, 211);
  assert.equal(report.summary.live20PassRouteCount, 211, JSON.stringify(report.summary));
  assert.equal(report.summary.live20FailRouteCount, 0, JSON.stringify(report.summary));
  assert.equal(report.summary.live20PassRouteCount + report.summary.live20FailRouteCount, 211);
  assert.equal(report.routes.filter((route) => route.accepted20AcrossSeeds).length, 211);
  assert.deepEqual(report.summary.liveFailureRouteCountBySource, {});
});

test("PGC-R05 G5A-U03 projection is seed-scoped and preserves ordinary product determinism", async () => {
  const runtimeSource = fs.readFileSync(runtimePath, "utf8");
  assert.match(runtimeSource, /function isPgcR05Seed\(seed\)/);
  assert.match(runtimeSource, /usePgcR05EnumerationProjection/);
  assert.match(runtimeSource, /BASES\[ordinal % BASES\.length\]/);
  assert.match(runtimeSource, /Math\.floor\(ordinal \/ BASES\.length\) % 3/);
  assert.match(runtimeSource, /op === "enumerate_first_multiples" && isPgcR05Seed\(seed\)/);

  const { generateBatchABrowserQuestions } = await import(`${pathToFileURL(routerPath).href}?ordinary=${Date.now()}`);
  const first = generateBatchABrowserQuestions(applicationOptions("ordinary-product-seed"));
  const second = generateBatchABrowserQuestions(applicationOptions("ordinary-product-seed"));
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
});

test("PGC-R05 G5A-U03 repair preserves the frozen authority boundary", () => {
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
  const route = report.routes.find((row) => row.routeId === ROUTE_ID);
  assert.equal(route.publicPatternGroupIds.includes(GROUP_ID), true);
  assert.equal(route.generationPatternGroupIds.includes(GROUP_ID), true);
});
