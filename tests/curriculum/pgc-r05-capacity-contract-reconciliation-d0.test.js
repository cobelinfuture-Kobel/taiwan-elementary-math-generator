import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const diagnosticsPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.application-gap-diagnostics.json");
const reportPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R05.capacity-contract-reconciliation.json");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R05_CAPACITY_CONTRACT_RECONCILIATION_D0_CLOSEOUT.md");
const materializerPath = path.join(repoRoot, "tools/curriculum/materialize-pgc-r05-application-gap-diagnostics.mjs");

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const legalApplicationRoutes = (contract) => contract.routes.filter((route) => route.questionType === "application" && route.legalRoute === true);

test("PGC-R05 capacity contract reconciliation closes all 211 legal application routes", () => {
  const contract = readJson(contractPath);
  const routes = legalApplicationRoutes(contract);
  assert.equal(contract.schemaName, "PublicGeneratorCapacityContractV3");
  assert.equal(routes.length, 211);
  assert.equal(routes.every((route) => route.verifiedMaxQuestionCount === 20), true);
  assert.equal(routes.every((route) => route.capacityStatus === "VERIFIED_20"), true);
  assert.equal(routes.every((route) => route.qualityStatus === "DIVERSE_PARAMETER_GENERATOR"), true);
  assert.equal(routes.every((route) => route.downstreamGapCodes.length === 0), true);
  assert.equal(routes.every((route) => route.reconciliationCodes.includes("PGC_R05_LIVE_20_CAPACITY_RECONCILED")), true);
  assert.equal(routes.every((route) => route.reconciliationCodes.includes("PGC_R05_TWO_SEED_PROMPT_DIVERSITY_RECONCILED")), true);
  assert.equal(routes.every((route) => route.selectedCapacityEvidence?.evidenceAuthority === "PGC-R05_TWO_SEED_20_QUESTION_LIVE_RUNTIME"), true);
  assert.equal(routes.every((route) => route.selectedCapacityEvidence?.questionCount === 20), true);
  assert.equal(routes.every((route) => route.selectedCapacityEvidence?.runs?.length === 2), true);
  for (const route of routes) {
    const runs = route.selectedCapacityEvidence.runs;
    assert.equal(runs.every((run) => run.ok === true && run.questionCount === 20 && run.answerKeyItemCount === 20), true, route.routeId);
    assert.equal(runs.every((run) => run.missingPromptCount === 0 && run.duplicatePromptCount === 0 && run.uniquePromptCount === 20), true, route.routeId);
    assert.equal(new Set(runs.map((run) => run.orderedWorksheetSignature)).size, 2, route.routeId);
  }
});

test("PGC-R05 reconciliation synchronizes all public-surface application binding limits", () => {
  const contract = readJson(contractPath);
  const appRouteIds = new Set(legalApplicationRoutes(contract).map((route) => route.routeId));
  const bindings = contract.historicalBindingEvidence.filter((binding) => binding.routeIds.some((routeId) => appRouteIds.has(routeId)));
  assert.ok(bindings.length > 0);
  assert.equal(bindings.every((binding) => binding.availableRouteCount > 0), true);
  assert.equal(bindings.every((binding) => binding.minimumVerifiedQuestionCount === 20), true);
  assert.equal(bindings.every((binding) => binding.maximumVerifiedQuestionCount === 20), true);
  assert.equal(contract.summary.currentVerified20BindingCount + contract.summary.currentLimitedBindingCount, contract.summary.currentLegalBindingCount);
  assert.equal(contract.summary.currentUnverifiedCapacityExposureCount, 0);
});

test("PGC-R05 final diagnostics and closeout readback are D0", () => {
  const diagnostics = readJson(diagnosticsPath);
  const report = readJson(reportPath);
  assert.equal(diagnostics.status, "PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CONFORMANT");
  assert.deepEqual(diagnostics.summary, {
    applicationRouteCount: 301,
    legalApplicationRouteCount: 211,
    illegalApplicationRouteCount: 90,
    contractVerified20RouteCount: 211,
    contractLimitedRouteCount: 0,
    contractQualityGapRouteCount: 0,
    live20PassRouteCount: 211,
    live20FailRouteCount: 0,
    repairRouteCount: 0,
    zeroSafeCapacityRouteCount: 0,
    repairRouteCountBySource: {},
    liveFailureRouteCountBySource: {},
  });
  assert.equal(diagnostics.routes.filter((route) => route.accepted20AcrossSeeds).length, 211);
  assert.equal(diagnostics.routes.filter((route) => route.requiresRepair).length, 0);
  assert.equal(report.status, "PASS_R05_D0_CAPACITY_CONTRACT_RECONCILED_AND_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT");
  assert.equal(report.reconciledRouteIds.length, 211);
  assert.equal(report.applicationAfter.verified20RouteCount, 211);
  assert.equal(report.applicationAfter.verifiedLimitedRouteCount, 0);
  assert.equal(report.applicationAfter.zeroCapacityRouteCount, 0);
  assert.equal(report.applicationAfter.diversityGapRouteCount, 0);
  assert.equal(report.nextShortestStep, "PGC-R06_ReasoningMixedPBLGenerationConformance");
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /STATUS\s+= PASS_R05_D0_CAPACITY_CONTRACT_RECONCILED_AND_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT/);
  assert.match(readback, /GOAL_DISTANCE_AFTER\s+= D0_R05_APPLICATION_GENERATION_CONFORMANT_AND_CONTRACT_RECONCILED/);
  assert.match(readback, /REMAINING_BLOCKERS\s+= \[NONE\]/);
});

test("PGC-R05 reconciliation preserves every frozen authority outside legal application metadata", () => {
  const report = readJson(reportPath);
  assert.equal(report.boundary.nonApplicationRoutesPreserved, true);
  assert.equal(report.boundary.illegalApplicationRoutesPreserved, true);
  assert.equal(report.boundary.unrelatedBindingsPreserved, true);
  assert.equal(report.boundary.generatorModified, false);
  assert.equal(report.boundary.validatorModified, false);
  assert.equal(report.boundary.rendererModified, false);
  assert.equal(report.boundary.secondWorksheetPipelineAdded, false);
  const materializer = fs.readFileSync(materializerPath, "utf8");
  assert.match(materializer, /PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CONFORMANT/);
  assert.match(materializer, /applicationContractReconciled/);
  assert.match(materializer, /PGC-R06_ReasoningMixedPBLGenerationConformance/);
});
