import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/GCI_PM01_W7_FINAL_BASELINE_ONLY_CLOSEOUT_V1.json";
const IMPACT_PATH = "data/project/change-impact/GCI_PM01_W7_FINAL_BASELINE_ONLY_CLOSEOUT_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/GCI_PM01_W7_FINAL_BASELINE_ONLY_CLOSEOUT_V1.validation.json";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

test("W7 final closeout preserves the frozen 26-slice / 32-KP authority and Q026 final owner", () => {
  assert.equal(contract.taskId, "GCI_PM01_W7_FINAL_BASELINE_ONLY_CLOSEOUT_V1");
  assert.equal(contract.scope.waveId, "W7");
  assert.equal(contract.scope.queueSliceCount, 26);
  assert.equal(contract.scope.directW7KnowledgePointCount, 32);
  assert.equal(contract.w7FinalAuthority.queueDigest, "ad37a23f07b3de22a088f5bf9f59e2b45f13cc3c350bb84def21860d21135843");
  assert.equal(contract.w7FinalAuthority.finalSliceId, "p07e_q026_r15_g6a_u08_6a08_profile_speed_rate_c1");
  assert.equal(contract.w7FinalAuthority.finalSourceId, "g6a_u08_6a08");
  assert.equal(contract.w7FinalAuthority.finalKnowledgePointId, "kp_effective_speed_current_wind");
  assert.equal(contract.w7FinalAuthority.finalProductPr, 1075);
  assert.equal(contract.w7FinalAuthority.finalProductMergeSha, "281c059a39e42bd5af1def2a52d6cbe4dbde3a16");
  assert.equal(contract.w7FinalAuthority.finalProductPagesE2EConclusion, "success");
});

test("Q024 final compatibility repair was test-only and passed focused PR Gate plus Pages deployment", () => {
  const repair = contract.q024FinalCompatibilityRepair;
  assert.equal(repair.pr, 1076);
  assert.equal(repair.prGateRunId, 36203153793);
  assert.equal(repair.prGateConclusion, "success");
  assert.equal(repair.mergeSha, "1de11644f510f36bf88036882a1440ce9aedf235");
  assert.equal(repair.pagesDeploymentRunId, 36203264653);
  assert.equal(repair.pagesDeploymentConclusion, "success");
  assert.equal(repair.repairClass, "TEST_ONLY_SUCCESSOR_SAFE_CURRENT_POINTER_COMPATIBILITY");
  assert.equal(repair.productSemanticsChanged, false);
});

test("Node Test failure-title-set attribution is a strict subset of the Q026 final baseline", () => {
  const node = contract.postMergeRegressionAttribution.nodeTest;
  assert.deepEqual(
    { tests: node.baseline.tests, pass: node.baseline.pass, fail: node.baseline.fail },
    { tests: 6083, pass: 5911, fail: 172 }
  );
  assert.deepEqual(
    { tests: node.afterRepair.tests, pass: node.afterRepair.pass, fail: node.afterRepair.fail },
    { tests: 6083, pass: 5913, fail: 170 }
  );
  assert.equal(node.exactSetDelta.overlapFailures, 170);
  assert.equal(node.exactSetDelta.removedFailures, 2);
  assert.equal(node.exactSetDelta.addedFailures, 0);
  assert.deepEqual(node.exactSetDelta.addedFailureTitles, []);
  assert.deepEqual(node.exactSetDelta.removedFailureTitles, [
    "Q024 current pointers and bounded validation are successor-safe",
    "PGC-R07 A01 preserves its historical Classic failure while later deployed smokes may advance"
  ]);
});

test("Math CI Readback independently proves the same zero-added-failure disposition", () => {
  const readback = contract.postMergeRegressionAttribution.mathCiReadback;
  assert.deepEqual(
    { tests: readback.baseline.tests, pass: readback.baseline.pass, fail: readback.baseline.fail },
    { tests: 6083, pass: 5910, fail: 173 }
  );
  assert.deepEqual(
    { tests: readback.afterRepair.tests, pass: readback.afterRepair.pass, fail: readback.afterRepair.fail },
    { tests: 6083, pass: 5912, fail: 171 }
  );
  assert.equal(readback.exactSetDelta.overlapFailures, 171);
  assert.equal(readback.exactSetDelta.removedFailures, 2);
  assert.equal(readback.exactSetDelta.addedFailures, 0);
  assert.deepEqual(readback.exactSetDelta.addedFailureTitles, []);
  assert.equal(contract.postMergeRegressionAttribution.finalRepairCausalNewFailures, 0);
  assert.equal(contract.postMergeRegressionAttribution.q024CompatibilityFailureRemoved, true);
  assert.equal(contract.postMergeRegressionAttribution.disposition, "BASELINE_ONLY_RELATIVE_TO_Q026_FINAL_PRODUCT_BASELINE");
});

test("current main advanced after the Q024 repair only through CI evidence files", () => {
  const readback = contract.currentMainReadbackAtMaterialization;
  assert.equal(readback.mainSha, "87275f4a165733fab812e95c3ab9764c2b08bef9");
  assert.equal(readback.q024RepairMergeSha, "1de11644f510f36bf88036882a1440ce9aedf235");
  assert.equal(readback.commitsAfterRepair, 6);
  assert.equal(readback.siteFilesChangedAfterRepair, false);
  assert.equal(readback.curriculumRuntimeFilesChangedAfterRepair, false);
  assert.equal(readback.onlyCiEvidenceFilesChangedAfterRepair, true);
  assert.ok(readback.changedFilesAfterRepair.every((path) => path.startsWith("docs/ci/")));
});

test("closeout does not absorb residual repository debt or mutate W7 product surfaces", () => {
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
  for (const key of [
    "productRuntimeChanged",
    "publicBindingChanged",
    "selectorRuntimeChanged",
    "generatorChanged",
    "validatorChanged",
    "rendererChanged",
    "worksheetRuntimeChanged",
    "sourceAuthorityChanged",
    "patternSpecsChanged",
    "frozenQueueChanged"
  ]) assert.equal(contract.scope[key], false, key);
});

test("W7 final distance closes D1 to D0 while residual global CI debt remains scope-external", () => {
  assert.equal(contract.distance.goalDistanceBefore, "D1_W7_26_OF_26_PRODUCT_D0_WAITING_FINAL_FAILURE_SET_ATTRIBUTION");
  assert.equal(contract.distance.goalDistanceAfter, "D0_W7_26_OF_26_FINAL_PARITY_BASELINE_ONLY_CLOSED");
  assert.deepEqual(contract.distance.remainingW7Blockers, []);
  assert.equal(contract.distance.scopeExternalDebt.length, 2);
  assert.equal(contract.distance.nextShortestStep, "W8_SOURCE_AUTHORITY_AND_FROZEN_QUEUE_DISCOVERY_PREFLIGHT");
  assert.equal(contract.distance.nextTaskRequiresSeparateOperatorApproval, true);
});

test("UNIT_INCREMENTAL_VALIDATION_V1 classifies W7 final closeout as KP_FOCUSED without global escalation", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.currentScope, "KP_LEAF");
  assert.equal(impact.currentKnowledgePointId, "kp_effective_speed_current_wind");
  assert.equal(impact.expectedDerivedGate, "KP_FOCUSED");
  assert.deepEqual(Object.values(impact.unitKnowledgePointGateStatus), ["FOCUSED_PASS"]);
  assert.deepEqual(impact.changeImpact, {
    sharedExecutableChange: false,
    publicAuthorityCutover: false,
    legalRouteSemanticsChanged: false,
    affectedRoutes: "BOUNDED",
    globalReleaseCheckpoint: false,
    currentAuthorityChanged: false
  });
  assert.deepEqual(plan.lanes.KP_FOCUSED.map((entry) => entry.gateId), [
    "FOCUSED_TEST",
    "TARGETED_BROWSER_E2E",
    "DIRECT_DEPENDENCY_CONTRACTS"
  ]);
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
});
