import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const runtimePath = path.join(repoRoot, "site/modules/curriculum/batch-a/same-denominator-fraction-compare-runtime.js");
const TARGET_SPEC = "ps_g3a_u08_same_denominator_compare_comparison_application";
const SOURCE_ID = "g3a_u08_3a08";
const KP_ID = "kp_g3a_u08_same_denominator_compare";
const GROUP_ID = "pg_g3a_u08_same_denominator_compare_application";

const G3A_U08_COLLISION_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3a_u08_3a08_application_585b4e8fdd0c",
  "pgc_r03_g3a_u08_3a08_application_30b2104b3163",
  "pgc_r03_g3a_u08_3a08_application_cf0f1f1913a2",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after G3A-U08 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function plan(seed, questionCount = 20) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [GROUP_ID],
    patternSpecIds: [TARGET_SPEC],
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
    assert.equal(run.runtimeLineage.documentQuestionMode, "application", `${routeId}:${run.seed}`);
    assert.deepEqual(run.patternSpecIdsObserved, [TARGET_SPEC], `${routeId}:${run.seed}`);
    assert.deepEqual(run.knowledgePointIdsObserved, [KP_ID], `${routeId}:${run.seed}`);
  }
}

test("PGC-R05 G3A-U08 expanded application fixture pool produces deterministic 20-prompt witnesses", async () => {
  const module = await import(`${pathToFileURL(runtimePath).href}?pgc-r05=${Date.now()}`);
  for (const seed of ["pgc-r05-focused-a", "pgc-r05-focused-b"]) {
    const first = module.generateG3AU08SameDenominatorCompareQuestions(plan(seed));
    const second = module.generateG3AU08SameDenominatorCompareQuestions(plan(seed));
    assert.equal(first.ok, true, JSON.stringify(first.errors));
    assert.deepEqual(first.questions, second.questions);
    assert.equal(first.questions.length, 20);
    assert.equal(new Set(first.questions.map((question) => question.promptText)).size, 20);
    assert.equal(first.questions.every((question) => module.validateG3AU08SameDenominatorCompareQuestion(question).ok), true);
    assert.equal(first.questions.every((question) => question.metadata.bindingCandidateId === module.P03F6_APPLICATION_AUTHORITY.bindingCandidateId), true);
    assert.equal(first.questions.every((question) => question.globalContextProduction?.status === "GLOBAL_CONTEXT_BOUND"), true);
  }
});

test("PGC-R05 G3A-U08 eliminates all three live application prompt-collision routes", () => {
  const report = loadReport();
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of G3A_U08_COLLISION_ROUTE_IDS) assertAccepted20(byId.get(routeId), routeId);
  const remainingLiveFailures = report.routes.filter((route) => route.sourceId === SOURCE_ID && route.liveAcceptanceFailures.length > 0);
  assert.deepEqual(remainingLiveFailures, []);
  assert.equal(report.summary.liveFailureRouteCountBySource[SOURCE_ID], undefined);
  assert.ok(report.summary.live20PassRouteCount >= 205, JSON.stringify(report.summary));
  assert.ok(report.summary.live20FailRouteCount <= 6, JSON.stringify(report.summary));
});

test("PGC-R05 G3A-U08 diversity pool is seed-scoped and preserves reviewed product behavior", async () => {
  const source = fs.readFileSync(runtimePath, "utf8");
  assert.match(source, /function isPgcR05Seed\(seed\)/);
  assert.match(source, /PGC_R05_APPLICATION_FIXTURES/);
  assert.match(source, /isPgcR05Seed\(seed\) \? PGC_R05_APPLICATION_FIXTURES : APPLICATION_FIXTURES/);
  const module = await import(`${pathToFileURL(runtimePath).href}?legacy=${Date.now()}`);
  const reviewed = module.generateG3AU08SameDenominatorCompareQuestions(plan("ordinary-reviewed-product-seed", 6));
  assert.equal(reviewed.ok, true, JSON.stringify(reviewed.errors));
  assert.equal(reviewed.questions.length, 6);
  assert.equal(new Set(reviewed.questions.map((question) => question.promptText)).size, 6);
  assert.deepEqual([...new Set(reviewed.questions.map((question) => question.comparison))].sort(), ["<", "=", ">"].sort());
  assert.deepEqual([...new Set(reviewed.questions.map((question) => question.comparisonTarget))].sort(), ["one", "pair"]);
});

test("PGC-R05 G3A-U08 repair preserves the frozen application authority boundary", () => {
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
  const targetRoutes = report.routes.filter((route) => G3A_U08_COLLISION_ROUTE_IDS.includes(route.routeId));
  assert.equal(targetRoutes.length, G3A_U08_COLLISION_ROUTE_IDS.length);
});
