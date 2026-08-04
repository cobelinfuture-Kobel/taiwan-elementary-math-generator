import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice021-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice021-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F21 D0 closeout binds exact GitHub evidence and preserves Slice022 boundary", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
  ], [21, 1, 1, 1]);
  assert.equal(manifest.expectedCounts.applicationPatternSpecCount, 0);
  assert.equal(manifest.expectedCounts.globalContextBindingCount, 0);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 20);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 20);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 540);
  assert.equal(evidence.implementationHeadSha, "1f552618eca857953b5bee3d6532437081d39b72");
  assert.equal(evidence.implementationMergeSha, "0627a673914153b11974c6525812ec6b96e8bae6");
  assert.equal(evidence.implementationNodeWorkflowRunId, 30910870862);
  assert.equal(evidence.implementationNodeWorkflowJobId, 91997017874);
  assert.deepEqual([evidence.implementationFullRegressionTests, evidence.implementationFullRegressionPass, evidence.implementationFullRegressionFail], [2904, 2904, 0]);
  assert.equal(evidence.acceptanceArtifactId, 8893121205);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:31e3dfa20005e77c4c3773c73940bf85f478b056be7693a4d6f2ff61b3e3048a");
  assert.equal(evidence.acceptancePdfPageCount, 6);
  assert.equal(evidence.acceptanceQuestionCount, 20);
  assert.equal(evidence.acceptanceAnswerKeyCount, 20);
  assert.deepEqual(Object.values(evidence.acceptancePatternSpecWitnessCounts), [20]);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");

  assert.equal(evidence.mainNodeWorkflowRunId, 30911329496);
  assert.equal(evidence.mainNodeConclusion, "success");
  assert.equal(evidence.mainCiReadbackWorkflowRunId, 30911330128);
  assert.equal(evidence.mainCiReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.mainWorkingTree, "clean");
  assert.equal(evidence.pagesDeploymentWorkflowRunId, 30911329831);
  assert.equal(evidence.pagesDeploymentConclusion, "success");
  assert.equal(evidence.deployedSiteHttpStatus, 200);
  assert.equal(evidence.deployedContentMatchesMergeSha, true);
  assert.equal(evidence.closeoutPrNumber, 541);
  assert.equal(evidence.closeoutHeadSha, "499ac0c2a05be229d7dd85c1e06a9bc0c75196dc");
  assert.equal(evidence.closeoutNodeWorkflowRunId, 30912296930);
  assert.equal(evidence.closeoutNodeWorkflowJobId, 92001742449);
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.deepEqual([evidence.closeoutFullRegressionTests, evidence.closeoutFullRegressionPass, evidence.closeoutFullRegressionFail], [2905, 2905, 0]);
  assert.equal(evidence.closeoutMergeSha, "e517aad4a50d8599816b1176f6ccfdd0283bda78");
  assert.equal(evidence.closeoutMainCiReadbackWorkflowRunId, 30912609079);
  assert.equal(evidence.closeoutMainCiReadbackWorkflowJobId, 92002775688);
  assert.equal(evidence.closeoutMainReadbackCommitSha, "e8af3bfa83e45186422219a19a77d13851f6a7e6");
  assert.equal(evidence.closeoutMainReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.closeoutMainWorkingTree, "clean");

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice022Started, false);
  assert.deepEqual(claim.closeoutEvidence.fullRegression, {tests: 2905, pass: 2905, fail: 0});
  assert.equal(claim.closeoutEvidence.mainReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(claim.closeoutEvidence.mainWorkingTree, "clean");
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice022Implementation");
});
