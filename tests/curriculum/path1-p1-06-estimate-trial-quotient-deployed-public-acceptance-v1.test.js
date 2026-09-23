import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_DEPLOYED_PUBLIC_ACCEPTANCE_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_DEPLOYED_PUBLIC_ACCEPTANCE_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_DEPLOYED_PUBLIC_ACCEPTANCE_V1.validation.json";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-06-estimate-trial-quotient-deployed-public-acceptance-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

test("deployed acceptance contract is anchored to exact PR #836 merge and Pages deployment", () => {
  assert.equal(contract.taskId, "PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_DEPLOYED_PUBLIC_ACCEPTANCE_V1");
  assert.equal(contract.operatorApproval, "APPROVED_VIA_PATH1_P1_06_ESTIMATE_TRIAL_QUOTIENT_PR836_MERGE_AND_DEPLOYED_ACCEPTANCE_V1");
  assert.equal(contract.implementationPr, 836);
  assert.equal(contract.implementationHeadSha, "0fe9adabda30dfb2232dad328fdb4cbd3d1fcbe8");
  assert.equal(contract.implementationMergeSha, "df1ec7d4b4b31f7c02236472129bbfb69b4f620d");
  assert.equal(contract.pagesDeployment.runId, 34241131866);
  assert.equal(contract.pagesDeployment.runNumber, 2122);
  assert.equal(contract.pagesDeployment.headSha, contract.implementationMergeSha);
  assert.equal(contract.pagesDeployment.conclusion, "success");
  assert.equal(contract.acceptanceBaseMain, "8a83fce996c4ea5af26e41d71a96cb7b2659abd2");
  assert.equal(contract.acceptanceBaseRelation.implementationMergeIsAncestor, true);
  assert.equal(contract.acceptanceBaseRelation.siteFilesChangedAfterImplementationMerge, false);
});

test("deployed acceptance is evidence-only and does not mutate product or semantic authority", () => {
  const scope = contract.acceptanceScope;
  assert.equal(scope.route, "/path1/");
  assert.equal(scope.blockId, "P1-06");
  assert.equal(scope.practiceMode, "estimateTrialQuotient");
  assert.equal(scope.publicCutoverGateId, "PATH1_P106_ESTIMATE_TRIAL_QUOTIENT_PUBLIC_CUTOVER_V1");
  for (const key of [
    "productRuntimeChanged",
    "publicBindingChanged",
    "path1MatrixChanged",
    "p106GeneratorChanged",
    "p106ValidatorChanged",
    "p106PatternSpecsChanged",
    "p106DedicatedAdapterChanged",
  ]) assert.equal(scope[key], false, key);
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
});

test("exact deployment identity and live route acceptance boundaries are fully specified", () => {
  assert.equal(contract.exactDeploymentIdentity.required, true);
  assert.equal(contract.exactDeploymentIdentity.referenceSha, contract.implementationMergeSha);
  assert.deepEqual(contract.exactDeploymentIdentity.files, [
    "site/path1/index.html",
    "site/assets/browser/path1-manual.js",
    "site/assets/browser/state/path1-manual-query-state.js",
    "site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js",
  ]);
  assert.equal(contract.deployedAcceptance.p106EstimateQuestionCount, 40);
  assert.equal(contract.deployedAcceptance.p106SemanticWitnessQuestionCount, 120);
  assert.equal(contract.deployedAcceptance.p106DeepLinkRefreshRequired, true);
  assert.deepEqual(contract.deployedAcceptance.unsupportedEstimateModeNormalizationBlocks, ["P1-05", "P1-07"]);
  assert.deepEqual(contract.deployedAcceptance.equalGroupsTransferBlocksPreserved, ["P1-01", "P1-02"]);
  assert.deepEqual(contract.deployedAcceptance.multiplicativeModelingBlocksPreserved, ["P1-03", "P1-04", "P1-05"]);
  assert.equal(contract.deployedAcceptance.previewPrintParityRequired, true);
  assert.equal(contract.deployedAcceptance.pageErrorsAllowed, 0);
  assert.equal(contract.deployedAcceptance.consoleErrorsAllowed, 0);
  assert.deepEqual(contract.deployedAcceptance.allowedDivisorOnesDigits, [1, 2, 3, 4, 6, 7, 8, 9]);
  assert.equal(contract.deployedAcceptance.endingFiveDeferred, true);
  assert.equal(contract.deployedAcceptance.endingZeroEstimateWitnessExcluded, true);
});

test("incremental validation remains SHARED_RUNTIME_BOUNDED with no full regression or global replay", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.sharedExecutableChange, true);
  assert.equal(impact.changeImpact.affectedRoutes, "BOUNDED");
  assert.equal(impact.changeImpact.globalReleaseCheckpoint, false);
  assert.equal(contract.validation.fullRepositoryRegressionRequired, false);
  assert.equal(contract.validation.globalBrowserReplayRequired, false);
  const lane = plan.lanes.SHARED_RUNTIME_BOUNDED;
  assert.equal(lane.length, 2);
  assert.deepEqual(lane.map((entry) => entry.gateId), ["GLOBAL_CONTRACTS", "TARGETED_ROUTE_REPLAY"]);
  assert.equal(lane[1].path, RUNNER_PATH);
  assert.equal(lane[1].runtime, "PLAYWRIGHT_CHROMIUM");
});

test("deployed acceptance runner exists", () => {
  assert.equal(fs.existsSync(RUNNER_PATH), true);
});
