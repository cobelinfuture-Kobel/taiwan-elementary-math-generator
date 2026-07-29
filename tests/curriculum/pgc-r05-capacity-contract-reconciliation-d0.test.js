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

const DIAGNOSTICS_STATUS = "PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CAPACITY_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS";
const CLOSEOUT_STATUS = "PASS_R05_D0_CAPACITY_CONTRACT_RECONCILED_AND_ALL_LIVE_APPLICATION_ROUTES_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS";
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const legalApplicationRoutes = (contract) => contract.routes.filter((route) => route.questionType === "application" && route.legalRoute === true);

test("PGC-R05 capacity reconciliation closes all 211 legal application routes without falsifying cross-seed quality", () => {
  const contract = readJson(contractPath);
  const routes = legalApplicationRoutes(contract);
  assert.equal(contract.schemaName, "PublicGeneratorCapacityContractV3");
  assert.equal(routes.length, 211);
  assert.equal(routes.every((route) => route.verifiedMaxQuestionCount === 20), true);
  assert.equal(routes.every((route) => route.capacityStatus === "VERIFIED_20"), true);
  assert.equal(routes.every((route) => !route.downstreamGapCodes.includes("CAPACITY_BELOW_20")), true);
  assert.equal(routes.every((route) => !route.downstreamGapCodes.includes("ZERO_SAFE_CAPACITY")), true);
  assert.equal(routes.every((route) => route.reconciliationCodes.includes("PGC_R05_LIVE_20_CAPACITY_RECONCILED")), true);
  assert.equal(routes.every((route) => route.reconciliationCodes.includes("PGC_R05_PER_WORKSHEET_PROMPT_DIVERSITY_RECONCILED")), true);
  assert.equal(routes.every((route) => route.selectedCapacityEvidence?.evidenceAuthority === "PGC-R05_TWO_SEED_20_QUESTION_LIVE_RUNTIME"), true);
  assert.equal(routes.every((route) => route.selectedCapacityEvidence?.questionCount === 20), true);
  assert.equal(routes.every((route) => route.selectedCapacityEvidence?.runs?.length === 2), true);

  const retainedQualityRoutes = routes.filter((route) => route.qualityStatus !== "DIVERSE_PARAMETER_GENERATOR");
  const qualityUpgradedRoutes = routes.filter((route) => route.reconciliationCodes.includes("PGC_R05_CROSS_SEED_ITEM_SET_DIVERSITY_RECONCILED"));
  assert.ok(retainedQualityRoutes.length > 0);
  assert.ok(qualityUpgradedRoutes.length > 0);
  assert.equal(retainedQualityRoutes.every((route) => route.downstreamGapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")), true);

  for (const route of routes) {
    const runs = route.selectedCapacityEvidence.runs;
    assert.equal(runs.every((run) => run.ok === true && run.questionCount === 20 && run.answerKeyItemCount === 20), true, route.routeId);
    assert.equal(runs.every((run) => run.missingPromptCount === 0 && run.duplicatePromptCount === 0 && run.uniquePromptCount === 20), true, route.routeId);
    assert.equal(runs.every((run) => typeof run.orderedWorksheetSignature === "string" && typeof run.itemSetSignature === "string"), true, route.routeId);
    if (route.reconciliationCodes.includes("PGC_R05_CROSS_SEED_ITEM_SET_DIVERSITY_RECONCILED")) {
      assert.equal(new Set(runs.map((run) => run.itemSetSignature)).size, 2, route.routeId);
      assert.equal(route.qualityStatus, "DIVERSE_PARAMETER_GENERATOR", route.routeId);
    }
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

test("PGC-R05 final diagnostics and closeout readback are capacity D0 with explicit retained quality gaps", () => {
  const diagnostics = readJson(diagnosticsPath);
  const report = readJson(reportPath);
  assert.equal(diagnostics.status, DIAGNOSTICS_STATUS);
  assert.equal(diagnostics.summary.applicationRouteCount, 301);
  assert.equal(diagnostics.summary.legalApplicationRouteCount, 211);
  assert.equal(diagnostics.summary.illegalApplicationRouteCount, 90);
  assert.equal(diagnostics.summary.contractVerified20RouteCount, 211);
  assert.equal(diagnostics.summary.contractLimitedRouteCount, 0);
  assert.ok(diagnostics.summary.contractQualityGapRouteCount > 0);
  assert.equal(diagnostics.summary.live20PassRouteCount, 211);
  assert.equal(diagnostics.summary.live20FailRouteCount, 0);
  assert.equal(diagnostics.summary.repairRouteCount, 0);
  assert.equal(diagnostics.summary.zeroSafeCapacityRouteCount, 0);
  assert.deepEqual(diagnostics.summary.repairRouteCountBySource, {});
  assert.deepEqual(diagnostics.summary.liveFailureRouteCountBySource, {});
  assert.equal(diagnostics.routes.filter((route) => route.accepted20AcrossSeeds).length, 211);
  assert.equal(diagnostics.routes.filter((route) => route.requiresRepair).length, 0);
  assert.equal(diagnostics.routes.filter((route) => route.retainedQualityGapCodes.length > 0).length, diagnostics.summary.contractQualityGapRouteCount);

  assert.equal(report.status, CLOSEOUT_STATUS);
  assert.equal(report.reconciledRouteIds.length, 211);
  assert.equal(report.applicationAfter.verified20RouteCount, 211);
  assert.equal(report.applicationAfter.verifiedLimitedRouteCount, 0);
  assert.equal(report.applicationAfter.zeroCapacityRouteCount, 0);
  assert.equal(report.applicationAfter.diversityGapRouteCount, diagnostics.summary.contractQualityGapRouteCount);
  assert.equal(report.nextShortestStep, "PGC-R06_ReasoningMixedPBLGenerationConformance");
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, new RegExp(`STATUS\\s+= ${CLOSEOUT_STATUS}`));
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
  assert.match(materializer, /PASS_R05_D0_ALL_LEGAL_APPLICATION_ROUTES_CAPACITY_CONFORMANT_WITH_RETAINED_CROSS_SEED_QUALITY_GAPS/);
  assert.match(materializer, /itemSetSignature/);
  assert.match(materializer, /blockingContractGapCodes/);
  assert.match(materializer, /retainedQualityGapCodes/);
  assert.match(materializer, /PGC-R06_ReasoningMixedPBLGenerationConformance/);
});
