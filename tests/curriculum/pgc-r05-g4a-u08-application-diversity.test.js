import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const browserRuntimePath = path.join(repoRoot, "site/modules/curriculum/batch-a/g4a-u08-phase2b-browser-runtime.js");
const canonicalRouterPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g4a-u08-canonical-router.js");
const costOverlayPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g4a-u08-app-cost-overlay-hidden.js");
const publicRouterPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js");

const SOURCE_ID = "g4a_u08_4a08";
const EQUAL_VALUE_SPEC_ID = "ps_g4a_u08_ext_equal_value_unit_price";
const COST_OVERLAY_SPEC_ID = "ps_g4a_u08_app_cost_overlay";
const G4A_U08_COLLISION_ROUTE_IDS = Object.freeze([
  "pgc_r03_g4a_u08_4a08_application_75cf23092fb6",
  "pgc_r03_g4a_u08_4a08_application_404f709c1e6e",
]);

function loadReport() {
  assert.equal(fs.existsSync(reportPath), true, "R05 diagnostics must be rematerialized after G4A-U08 diversity repair");
  return JSON.parse(fs.readFileSync(reportPath, "utf8"));
}

function assertAccepted20(route, routeId, expectedSpecId) {
  assert.ok(route, routeId);
  assert.equal(route.sourceId, SOURCE_ID, routeId);
  assert.equal(route.questionType, "application", routeId);
  assert.deepEqual(route.compatiblePatternSpecIds, [expectedSpecId], routeId);
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
    assert.deepEqual(run.patternSpecIdsObserved, [expectedSpecId], `${routeId}:${run.seed}`);
  }
}

test("PGC-R05 G4A-U08 equal-value producer uses an explicit 135-slot projection", async () => {
  const runtime = await import(`${pathToFileURL(browserRuntimePath).href}?equal=${Date.now()}`);
  for (const diagnosticSeed of [1, 2]) {
    const items = Array.from({ length: 20 }, (_, diversityOrdinal) => runtime.generateG4AU08Phase2BBrowserItem({
      templateId: "tpl_ext_equal_value_unit_price",
      seed: diagnosticSeed * 1000 + diversityOrdinal,
      generationProfile: "pgc-r05",
      diversityOrdinal,
    }));
    assert.equal(new Set(items.map((item) => item.prompt)).size, 20);
    assert.equal(items.every((item) => item.patternSpecId === EQUAL_VALUE_SPEC_ID), true);
    assert.equal(items.every((item) => runtime.validateG4AU08Phase2BBrowserItem(item).valid), true);
  }
});

test("PGC-R05 G4A-U08 cost-overlay producer uses an explicit 5832-slot projection", async () => {
  const hidden = await import(`${pathToFileURL(costOverlayPath).href}?cost=${Date.now()}`);
  const { validateG4AU08AppCostOverlayBrowserItem } = await import(`${pathToFileURL(path.join(repoRoot, "site/modules/curriculum/batch-a/g4a-u08-app-cost-overlay-browser-validator.js")).href}?validate=${Date.now()}`);
  for (const diagnosticSeed of ["pgc-r05-diagnostic-01", "pgc-r05-diagnostic-02"]) {
    const items = Array.from({ length: 20 }, (_, diversityOrdinal) => hidden.generateG4AU08AppCostOverlayHidden({
      seed: `${diagnosticSeed}:${diversityOrdinal}`,
      generationProfile: "pgc-r05",
      diversityOrdinal,
    }));
    assert.equal(new Set(items.map((item) => item.prompt)).size, 20);
    assert.deepEqual([...new Set(items.map((item) => item.context.overlayType))].sort(), ["discount", "packaging_fee"]);
    assert.equal(items.every((item) => item.patternSpecId === COST_OVERLAY_SPEC_ID), true);
    assert.equal(items.every((item) => validateG4AU08AppCostOverlayBrowserItem(item).valid), true);
  }
});

test("PGC-R05 G4A-U08 FullFix clears both remaining unit routes", () => {
  const report = loadReport();
  assert.equal(report.status, "PASS_R05_210_OF_211_LIVE_APPLICATION_ROUTES_CONFORMANT");
  const byId = new Map(report.routes.map((route) => [route.routeId, route]));
  assertAccepted20(byId.get(G4A_U08_COLLISION_ROUTE_IDS[0]), G4A_U08_COLLISION_ROUTE_IDS[0], EQUAL_VALUE_SPEC_ID);
  assertAccepted20(byId.get(G4A_U08_COLLISION_ROUTE_IDS[1]), G4A_U08_COLLISION_ROUTE_IDS[1], COST_OVERLAY_SPEC_ID);
  const remainingLiveFailures = report.routes.filter((route) => route.sourceId === SOURCE_ID && route.liveAcceptanceFailures.length > 0);
  assert.deepEqual(remainingLiveFailures, []);
  assert.equal(report.summary.liveFailureRouteCountBySource[SOURCE_ID], undefined);
  assert.equal(report.summary.live20PassRouteCount, 210, JSON.stringify(report.summary));
  assert.equal(report.summary.live20FailRouteCount, 1, JSON.stringify(report.summary));
  assert.deepEqual(report.summary.liveFailureRouteCountBySource, { g5a_u03_5a03a: 1 });
});

test("PGC-R05 G4A-U08 projections are explicit and ordinary product seeds ignore ordinals", async () => {
  const browserSource = fs.readFileSync(browserRuntimePath, "utf8");
  const canonicalRouterSource = fs.readFileSync(canonicalRouterPath, "utf8");
  const costSource = fs.readFileSync(costOverlayPath, "utf8");
  const publicRouterSource = fs.readFileSync(publicRouterPath, "utf8");
  assert.match(browserSource, /PGC_R05_EQUAL_VALUE_PARAMETER_SPACE/);
  assert.match(canonicalRouterSource, /generationProfile === "pgc-r05" \? index : null/);
  assert.match(costSource, /PGC_R05_COST_OVERLAY_PARAMETER_SPACE/);
  assert.match(publicRouterSource, /generationProfile === "pgc-r05" \? index : null/);
  assert.doesNotMatch(browserSource, /match\(\/.*\\d.*\$\//);
  assert.doesNotMatch(costSource, /match\(\/.*\\d.*\$\//);

  const browser = await import(`${pathToFileURL(browserRuntimePath).href}?legacy-equal=${Date.now()}`);
  const equalA = browser.generateG4AU08Phase2BBrowserItem({ templateId: "tpl_ext_equal_value_unit_price", seed: 77, diversityOrdinal: 0 });
  const equalB = browser.generateG4AU08Phase2BBrowserItem({ templateId: "tpl_ext_equal_value_unit_price", seed: 77, diversityOrdinal: 19 });
  assert.equal(equalA.prompt, equalB.prompt);
  assert.deepEqual(equalA.answerModel, equalB.answerModel);

  const hidden = await import(`${pathToFileURL(costOverlayPath).href}?legacy-cost=${Date.now()}`);
  const costA = hidden.generateG4AU08AppCostOverlayHidden({ seed: "ordinary-product-seed", diversityOrdinal: 0 });
  const costB = hidden.generateG4AU08AppCostOverlayHidden({ seed: "ordinary-product-seed", diversityOrdinal: 19 });
  assert.equal(costA.prompt, costB.prompt);
  assert.deepEqual(costA.answerModel, costB.answerModel);
});

test("PGC-R05 G4A-U08 repair preserves the frozen authority boundary", () => {
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
  const targetRoutes = report.routes.filter((route) => G4A_U08_COLLISION_ROUTE_IDS.includes(route.routeId));
  assert.equal(targetRoutes.length, 2);
  assert.equal(targetRoutes.every((route) => route.selectionMode === "singleKnowledgePoint"), true);
});
