import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice021-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice021-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F21 D0 closeout candidate binds exact GitHub evidence and preserves Slice022 boundary", () => {
  assert.equal(manifest.status, "READY_FOR_CLOSEOUT_CI");
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

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(claim.status, "PASS_D0_CLOSEOUT_CANDIDATE");
  assert.equal(claim.goalDistance, "D1_CLOSEOUT_CI_PENDING");
  assert.equal(claim.productResult.d0Complete, false);
  assert.equal(claim.boundaries.slice022Started, false);
  assert.equal(claim.closeoutEvidence.mainReadback, "PENDING");
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice022Implementation");
});
