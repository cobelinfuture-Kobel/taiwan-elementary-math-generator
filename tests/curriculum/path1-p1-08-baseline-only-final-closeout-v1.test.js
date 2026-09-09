import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_08_BASELINE_ONLY_FINAL_CLOSEOUT_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_08_BASELINE_ONLY_FINAL_CLOSEOUT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_08_BASELINE_ONLY_FINAL_CLOSEOUT_V1.validation.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

const P108_KPS = [
  "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
  "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
];

const P108_PATTERNS = [
  "ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
  "ps_g4a_u04_3digit_by_2digit_tens_sufficient",
  "ps_g4a_u04_3digit_by_2digit_tens_insufficient",
];

test("P1-08 final closeout preserves exact source, KP, PatternSpec, and generic arithmetic authority", () => {
  assert.equal(contract.taskId, "PATH1_P1_08_BASELINE_ONLY_FINAL_CLOSEOUT_V1");
  assert.equal(contract.scope.blockId, "P1-08");
  assert.equal(contract.canonicalAuthority.sourceId, "g4a_u04_4a04");
  assert.equal(contract.canonicalAuthority.sourceFile, "batchA_02-題型總覽-4a04-整數的除法.pdf");
  assert.equal(contract.canonicalAuthority.route, "arithmetic");
  assert.deepEqual(contract.canonicalAuthority.primaryKnowledgePointIds, P108_KPS);
  assert.deepEqual(contract.canonicalAuthority.patternSpecIds, P108_PATTERNS);
  assert.match(contract.canonicalAuthority.arithmeticInvariant, /dividend = divisor \* quotient \+ remainder/);
});

test("P1-08 closeout anchors the exact implementation, repair, and Pages deployment identities", () => {
  const byPr = new Map(contract.implementationChain.map((entry) => [entry.pr, entry]));
  assert.equal(byPr.get(850).mergeSha, "bcef8e451988af3001f7e6b2063084e2c19d8034");
  assert.equal(byPr.get(854).mergeSha, "e9bfb85961803ee3f7ff405556f3e03f745688e6");
  assert.equal(byPr.get(855).mergeSha, "fb3d053dbfa59171d7ee04af4adefdbd4c8981a2");
  assert.equal(byPr.get(856).mergeSha, "ef741a934566b93190bb6b75101febb0e901e22a");
  assert.equal(byPr.get(857).mergeSha, "5bad9ec43a8675a9d87d0014bf1892d5994e15cb");
  assert.equal(contract.pagesDeployment.runId, 34333705796);
  assert.equal(contract.pagesDeployment.runNumber, 2141);
  assert.equal(contract.pagesDeployment.headSha, byPr.get(856).mergeSha);
  assert.equal(contract.pagesDeployment.conclusion, "success");
});

test("post-merge failure attribution proves P1-08 added zero causal failures", () => {
  const attribution = contract.postMergeRegressionAttribution;
  assert.equal(attribution.baselineBeforeP108RuntimeImplementation.fail, 125);
  assert.equal(attribution.afterP108ImplementationBeforeStaleRepair.fail, 126);
  assert.equal(attribution.afterStaleRepair.fail, 124);
  assert.equal(attribution.exactSetDelta.implementationToRepairRemovedFailures, 2);
  assert.equal(attribution.exactSetDelta.implementationToRepairAddedFailures, 0);
  assert.equal(attribution.exactSetDelta.baselineToRepairOverlapFailures, 124);
  assert.equal(attribution.exactSetDelta.baselineToRepairRemovedFailures, 1);
  assert.equal(attribution.exactSetDelta.baselineToRepairAddedFailures, 0);
  assert.equal(attribution.exactSetDelta.p108CausalNewFailures, 0);
  assert.equal(attribution.disposition, "BASELINE_ONLY");
  assert.equal(attribution.p108SharedRuntimeRegression, "NONE_FOUND");
  assert.equal(attribution.remainingFailureCount, 124);
  assert.equal(attribution.remainingFailuresOwnership, "PRE_EXISTING_REPOSITORY_BASELINE_SCOPE_EXTERNAL_TO_P1_08");
});

test("P1-08 focused product acceptance is complete at 1, 20, and 120", () => {
  const acceptance = contract.focusedAcceptance;
  assert.equal(acceptance.count1Succeeds, true);
  assert.equal(acceptance.count1ExactOneKnowledgePoint, true);
  assert.equal(acceptance.count1SameSeedDeterministic, true);
  assert.equal(acceptance.count1CrossSeedKnowledgePointReachability, true);
  assert.deepEqual(acceptance.count20Allocation, [7, 7, 6]);
  assert.deepEqual(acceptance.count120Allocation, [40, 40, 40]);
  assert.equal(acceptance.allGeneratedRowsTopLevelKnowledgePointIdNonNull, true);
  assert.equal(acceptance.allGeneratedRowsKnowledgePointMembershipExact, true);
  assert.equal(acceptance.canonicalPatternsPreserved, true);
  assert.equal(acceptance.canonicalSourcePreserved, true);
});

test("closeout does not absorb repository baseline debt or mutate adjacent Path1 authority", () => {
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
  assert.equal(contract.scope.mutationClass, "EVIDENCE_AND_GOVERNANCE_ONLY");
  for (const key of [
    "productRuntimeChanged",
    "publicBindingChanged",
    "path1MatrixChanged",
    "patternSpecsChanged",
    "canonicalKnowledgePointsChanged",
    "publicUiOrQueryChanged",
    "p109OrLaterChanged",
  ]) assert.equal(contract.scope[key], false, key);
  assert.equal(contract.currentMainReadbackAtMaterialization.siteFilesChangedAfterRepair, false);
  assert.equal(contract.currentMainReadbackAtMaterialization.curriculumRuntimeFilesChangedAfterRepair, false);
  assert.equal(contract.currentMainReadbackAtMaterialization.onlyCiEvidenceFilesChangedAfterRepair, true);
});

test("P1-08 final distance is D0 and the next P1-09 preflight remains a separate approval boundary", () => {
  assert.equal(contract.distance.goalDistanceBefore, "D1_P108_CAUSAL_REGRESSION_CLEARED_BASELINE_ONLY_GLOBAL_CI_RED");
  assert.equal(contract.distance.goalDistanceAfter, "D0_P108_GENERIC_ARITHMETIC_ROUTE_STABLE_ACCEPTED_BASELINE_ONLY");
  assert.deepEqual(contract.distance.remainingP108Blockers, []);
  assert.equal(contract.distance.scopeExternalDebt.length, 1);
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_09_LARGER_DIVIDEND_TWO_DIGIT_DIVISOR_SOURCE_AUTHORITY_PREFLIGHT_V1");
  assert.equal(contract.distance.nextTaskRequiresSeparateOperatorApproval, true);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 classifies final closeout as KP_FOCUSED without global escalation", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(impact.unitExpectedKnowledgePointIds, P108_KPS);
  assert.deepEqual(Object.values(impact.unitKnowledgePointGateStatus), ["FOCUSED_PASS", "FOCUSED_PASS", "FOCUSED_PASS"]);
  assert.deepEqual(impact.changeImpact, {
    sharedExecutableChange: false,
    publicAuthorityCutover: false,
    legalRouteSemanticsChanged: false,
    affectedRoutes: "BOUNDED",
    globalReleaseCheckpoint: false,
    currentAuthorityChanged: false,
  });

  const gates = plan.lanes.KP_FOCUSED.map((entry) => entry.gateId);
  assert.deepEqual(gates, ["FOCUSED_TEST", "TARGETED_BROWSER_E2E", "DIRECT_DEPENDENCY_CONTRACTS"]);
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
});
