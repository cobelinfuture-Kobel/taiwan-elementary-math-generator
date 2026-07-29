import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const corePath = path.join(repoRoot, "site/modules/curriculum/batch-a/g5a-u08-application-generator-core.js");
const plannerPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g5a-u08-application-batch-planner.js");

const TARGET_SPEC = "ps_g5a_u08_app_near_round_unit_price";
const G5A_U08_COLLISION_ROUTE_IDS = Object.freeze([
  "pgc_r03_g5a_u08_5a08_application_8c256beb697c",
  "pgc_r03_g5a_u08_5a08_application_914ffeeae0aa",
  "pgc_r03_g5a_u08_5a08_application_c47cb28f3b46",
  "pgc_r03_g5a_u08_5a08_application_0bfd88403063",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after G5A-U08 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function assertAccepted20(route, routeId) {
  assert.ok(route, routeId);
  assert.equal(route.sourceId, "g5a_u08_5a08", routeId);
  assert.equal(route.questionType, "application", routeId);
  assert.deepEqual(route.compatiblePatternSpecIds, [TARGET_SPEC], routeId);
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
  }
}

test("PGC-R05 G5A-U08 explicit ordinal projection produces 20 unique prompts in all four cells", async () => {
  const { generateG5AU08ApplicationBatch } = await import(`${pathToFileURL(plannerPath).href}?pgc-r05=${Date.now()}`);
  for (const depthMode of ["N", "N_PLUS_1"]) {
    for (const contextMode of ["daily_life", "sdg"]) {
      const batch = generateG5AU08ApplicationBatch({
        questionCount: 20,
        seed: `pgc-r05-focused:${depthMode}:${contextMode}`,
        selectedPatternSpecIds: [TARGET_SPEC],
        depthMode,
        contextMode,
        ordering: "grouped",
      });
      const prompts = batch.questions.map((question) => question.promptText);
      assert.equal(prompts.length, 20, `${depthMode}:${contextMode}`);
      assert.equal(new Set(prompts).size, 20, `${depthMode}:${contextMode}`);
      assert.equal(batch.questions.every((question) => question.patternSpecId === TARGET_SPEC), true);
    }
  }
});

test("PGC-R05 G5A-U08 injective near-round sampler eliminates all four live prompt collisions", () => {
  const report = loadReport();
  assert.equal(report.status, "PASS_R05_202_OF_211_LIVE_APPLICATION_ROUTES_CONFORMANT");
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of G5A_U08_COLLISION_ROUTE_IDS) assertAccepted20(byId.get(routeId), routeId);
  const remainingLiveFailures = report.routes.filter((route) => route.sourceId === "g5a_u08_5a08" && route.liveAcceptanceFailures.length > 0);
  assert.deepEqual(remainingLiveFailures, []);
  assert.equal(report.summary.liveFailureRouteCountBySource.g5a_u08_5a08, undefined);
  assert.equal(report.summary.live20PassRouteCount, 202, JSON.stringify(report.summary));
  assert.equal(report.summary.live20FailRouteCount, 9, JSON.stringify(report.summary));
});

test("PGC-R05 G5A-U08 projection is seed-scoped and explicit rather than parsed from retry suffix", async () => {
  const coreSource = fs.readFileSync(corePath, "utf8");
  const plannerSource = fs.readFileSync(plannerPath, "utf8");
  assert.match(coreSource, /includes\("pgc-r05"\)/);
  assert.match(coreSource, /diversityOrdinal = null/);
  assert.match(coreSource, /PGC_R05_NEAR_ROUND_PARAMETER_SPACE/);
  assert.doesNotMatch(coreSource, /match\(\/.*\\d.*\$\//);
  assert.match(plannerSource, /desiredSdgGoalId = null, diversityOrdinal = null/);
  assert.match(plannerSource, /desiredSdgGoalId,\s+sequence,/);

  const { generateG5AU08ApplicationQuestion } = await import(`${pathToFileURL(corePath).href}?legacy=${Date.now()}`);
  const first = generateG5AU08ApplicationQuestion(TARGET_SPEC, {
    seed: "ordinary-product-seed",
    depth: "N",
    contextType: "daily_life",
    diversityOrdinal: 0,
  });
  const second = generateG5AU08ApplicationQuestion(TARGET_SPEC, {
    seed: "ordinary-product-seed",
    depth: "N",
    contextType: "daily_life",
    diversityOrdinal: 19,
  });
  assert.equal(first.promptText, second.promptText);
  assert.equal(first.answerText, second.answerText);
});

test("PGC-R05 G5A-U08 repair preserves the frozen application authority boundary", () => {
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
  const targetRoutes = report.routes.filter((route) => G5A_U08_COLLISION_ROUTE_IDS.includes(route.routeId));
  assert.equal(targetRoutes.length, G5A_U08_COLLISION_ROUTE_IDS.length);
  assert.equal(targetRoutes.every((route) => route.selectedKnowledgePointIds.includes("kp_g5a_u08_near_round_multiply_compensation")), true);
});
