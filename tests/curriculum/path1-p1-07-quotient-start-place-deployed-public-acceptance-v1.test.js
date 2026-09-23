import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const CONTRACT_PATH = "data/curriculum/application/contracts/PATH1_P1_07_QUOTIENT_START_PLACE_DEPLOYED_PUBLIC_ACCEPTANCE_V1.json";
const IMPACT_PATH = "data/project/change-impact/PATH1_P1_07_QUOTIENT_START_PLACE_DEPLOYED_PUBLIC_ACCEPTANCE_V1.impact.json";
const PLAN_PATH = "data/project/validation-plans/PATH1_P1_07_QUOTIENT_START_PLACE_DEPLOYED_PUBLIC_ACCEPTANCE_V1.validation.json";
const RUNNER_PATH = "tools/curriculum/run-path1-p1-07-quotient-start-place-deployed-public-acceptance-v1.mjs";

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const impact = JSON.parse(fs.readFileSync(IMPACT_PATH, "utf8"));
const plan = JSON.parse(fs.readFileSync(PLAN_PATH, "utf8"));

test("deployed acceptance contract is anchored to exact PR #847 merge and Pages deployment", () => {
  assert.equal(contract.taskId, "PATH1_P1_07_QUOTIENT_START_PLACE_DEPLOYED_PUBLIC_ACCEPTANCE_V1");
  assert.equal(contract.implementationPr, 847);
  assert.equal(contract.implementationHeadSha, "37083d2edb4c0416fd8a9bbbde686608a54071af");
  assert.equal(contract.implementationMergeSha, "732589ba5507128ca89514de69e624ebf3f50ac7");
  assert.equal(contract.pagesDeployment.runId, 34307225340);
  assert.equal(contract.pagesDeployment.runNumber, 2133);
  assert.equal(contract.pagesDeployment.headSha, contract.implementationMergeSha);
  assert.equal(contract.pagesDeployment.conclusion, "success");
  assert.equal(contract.pagesDeployment.deploymentShaMatchesImplementation, true);
  assert.equal(contract.acceptanceBaseMain, "ea9d4f81ef578f3b5fd9312144b764b47306f613");
  assert.equal(contract.acceptanceBaseRelation.implementationMergeIsAncestor, true);
  assert.equal(contract.acceptanceBaseRelation.siteFilesChangedAfterImplementationMerge, false);
});

test("deployed acceptance is evidence-only and does not mutate product or semantic authority", () => {
  const scope = contract.acceptanceScope;
  assert.equal(scope.route, "/path1/");
  assert.equal(scope.blockId, "P1-07");
  assert.equal(scope.practiceMode, "quotientStartPlace");
  assert.equal(scope.publicCutoverGateId, "PATH1_P107_QUOTIENT_START_PLACE_PUBLIC_CUTOVER_V1");
  for (const key of [
    "productRuntimeChanged",
    "publicBindingChanged",
    "path1MatrixChanged",
    "p107GeneratorChanged",
    "p107ValidatorChanged",
    "p107PatternSpecsChanged",
    "p107DedicatedAdapterChanged",
    "sourceSemanticsChanged",
    "masteryChanged",
  ]) assert.equal(scope[key], false, key);
  for (const value of Object.values(contract.antiScopeCreep)) assert.equal(value, false);
});

test("three-lane source provenance and one-digit exact P1-07 boundary remain locked", () => {
  assert.equal(contract.sourceProvenanceBoundary.allThreeCloudEvidenceLanesRetained, true);
  assert.equal(contract.sourceProvenanceBoundary.learningMapsUse, "CURRICULUM_PROGRESSION_BOUNDARY");
  assert.equal(contract.sourceProvenanceBoundary.liTeacherUse, "NO_DIRECT_WITNESS_NO_PATTERN_ADMISSION");
  assert.equal(contract.sourceProvenanceBoundary.schoolExamUse, "DIRECT_QUOTIENT_DIGIT_COUNT_REPRESENTATION_WITNESS");
  assert.equal(contract.sourceProvenanceBoundary.twoDigitDivisorExamEvidencePresent, true);
  assert.equal(contract.sourceProvenanceBoundary.twoDigitDivisorRuntimeAdmitted, false);
  assert.equal(contract.deployedAcceptance.divisorDomain, "2..9 one-digit only");
  assert.equal(contract.deployedAcceptance.exactDivisionOnly, true);
  assert.equal(contract.deployedAcceptance.quotientZeroPrimaryV1Used, false);
  assert.equal(contract.deployedAcceptance.twoDigitDivisorRuntimeUsed, false);
  assert.equal(contract.deployedAcceptance.divisorEstimationUsed, false);
  assert.equal(contract.deployedAcceptance.remainderContextInterpretationUsed, false);
  assert.equal(contract.deployedAcceptance.wordProblemRelationUsed, false);
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
  assert.equal(contract.deployedAcceptance.p107QuotientStartPlaceQuestionCount, 40);
  assert.equal(contract.deployedAcceptance.p107SemanticWitnessQuestionCount, 120);
  assert.equal(contract.deployedAcceptance.distinctPromptsAt120, 120);
  assert.equal(contract.deployedAcceptance.p107DeepLinkRefreshRequired, true);
  assert.deepEqual(contract.deployedAcceptance.unsupportedQuotientStartPlaceNormalizationBlocks, ["P1-06", "P1-08"]);
  assert.deepEqual(contract.deployedAcceptance.equalGroupsTransferBlocksPreserved, ["P1-01", "P1-02"]);
  assert.deepEqual(contract.deployedAcceptance.multiplicativeModelingBlocksPreserved, ["P1-03", "P1-04", "P1-05"]);
  assert.equal(contract.deployedAcceptance.primaryKnowledgePointIds.length, 2);
  assert.equal(contract.deployedAcceptance.patternSpecIds.length, 4);
  assert.equal(contract.deployedAcceptance.formalCaseIds.length, 4);
  assert.equal(contract.deployedAcceptance.previewPrintParityRequired, true);
  assert.equal(contract.deployedAcceptance.pageErrorsAllowed, 0);
  assert.equal(contract.deployedAcceptance.consoleErrorsAllowed, 0);
});

test("incremental validation remains SHARED_RUNTIME_BOUNDED with no full regression or global replay", () => {
  assert.equal(impact.policyId, "UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(impact.expectedDerivedGate, "SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.sharedExecutableChange, true);
  assert.equal(impact.changeImpact.publicAuthorityCutover, false);
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

test("deployed acceptance runner exists and the next step exits P1-07 scope", () => {
  assert.equal(fs.existsSync(RUNNER_PATH), true);
  assert.equal(contract.distance.goalDistanceAfterTarget, "D0_P107_PUBLIC_PATH1_QUOTIENT_START_PLACE_ROUTE_DEPLOYED_AND_ACCEPTED");
  assert.equal(contract.distance.nextShortestStep, "PATH1_P1_08_PUBLIC_PATH_CONTINUATION_PREFLIGHT_OR_CURRENT_PATH1_QUEUE_AUTHORITY");
});
