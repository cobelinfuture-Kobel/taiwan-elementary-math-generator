import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const routerPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g3b-u04-canonical-semantic-router.js");

const G3B_U04_COLLISION_ROUTE_IDS = Object.freeze([
  "pgc_r03_g3b_u04_3b04_application_11bba8b043a5",
  "pgc_r03_g3b_u04_3b04_application_075ff20dc5a6",
  "pgc_r03_g3b_u04_3b04_application_a82197bfb202",
  "pgc_r03_g3b_u04_3b04_application_af73cc7665ca",
  "pgc_r03_g3b_u04_3b04_application_e854a057330c",
  "pgc_r03_g3b_u04_3b04_application_195bcb35906a",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after G3B-U04 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function assertAccepted20(route, routeId) {
  assert.ok(route, routeId);
  assert.equal(route.sourceId, "g3b_u04_3b04", routeId);
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
  }
}

test("PGC-R05 G3B-U04 shared canonical retry eliminates all six prompt-collision routes", () => {
  const report = loadReport();
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  for (const routeId of G3B_U04_COLLISION_ROUTE_IDS) assertAccepted20(byId.get(routeId), routeId);
  const remainingLiveFailures = report.routes.filter((route) => route.sourceId === "g3b_u04_3b04" && route.liveAcceptanceFailures.length > 0);
  assert.deepEqual(remainingLiveFailures, []);
  assert.equal(report.summary.live20PassRouteCount, 198, JSON.stringify(report.summary));
  assert.equal(report.summary.live20FailRouteCount, 13, JSON.stringify(report.summary));
});

test("PGC-R05 G3B-U04 diversity retry is seed-scoped and does not relax validation", () => {
  assert.equal(fs.existsSync(routerPath), true);
  const source = fs.readFileSync(routerPath, "utf8");
  assert.match(source, /String\(plan\.generationSeed \?\? ""\)\.includes\("pgc-r05"\)/);
  assert.match(source, /PGC_R05_PROMPT_DIVERSITY_RETRY_LIMIT = 32/);
  assert.match(source, /recentPrompts\.includes\(promotedQuestion\.promptText\)/);
  assert.match(source, /const checked = validator\(promotedQuestion, \{ recentPrompts \}\)/);
  assert.match(source, /validateG3BU04HumanSemanticQualityV2\(promotedQuestion\)/);
  assert.doesNotMatch(source, /validator\s*=\s*null|skipValidation|validationDisabled/);
});

test("PGC-R05 G3B-U04 repair preserves the frozen authority boundary", () => {
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
  const targetRoutes = report.routes.filter((route) => G3B_U04_COLLISION_ROUTE_IDS.includes(route.routeId));
  assert.equal(targetRoutes.length, G3B_U04_COLLISION_ROUTE_IDS.length);
  assert.equal(targetRoutes.every((route) => route.compatiblePatternSpecIds.length > 0), true);
});
