import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice020-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice020-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F20 D0 closeout is main-reconciled with exact GitHub evidence and preserves Slice021 boundary", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.expectedCounts.queuePosition, 20);
  assert.equal(manifest.expectedCounts.knowledgePointCount, 1);
  assert.equal(manifest.expectedCounts.patternGroupCount, 1);
  assert.equal(manifest.expectedCounts.patternSpecCount, 2);
  assert.equal(manifest.expectedCounts.applicationPatternSpecCount, 0);
  assert.equal(manifest.expectedCounts.globalContextBindingCount, 0);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 20);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 20);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 537);
  assert.equal(evidence.implementationHeadSha, "2fe3f5d4d338d6335e5aa933e760a186fb2b5252");
  assert.equal(evidence.implementationMergeSha, "760fb5060f094828831a0d302e383c01a1c71ee7");
  assert.equal(evidence.implementationNodeWorkflowRunId, 30905471695);
  assert.equal(evidence.implementationNodeWorkflowJobId, 91979418276);
  assert.deepEqual([evidence.implementationFullRegressionTests, evidence.implementationFullRegressionPass, evidence.implementationFullRegressionFail], [2893, 2893, 0]);
  assert.equal(evidence.acceptanceArtifactId, 8890938314);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:a119548a03294d919225e0c55d9b206117948880460245b81ff7f46c8ae9138b");
  assert.equal(evidence.acceptancePdfPageCount, 4);
  assert.equal(evidence.acceptanceQuestionCount, 20);
  assert.equal(evidence.acceptanceAnswerKeyCount, 20);
  assert.deepEqual(Object.values(evidence.acceptancePatternSpecWitnessCounts), [10, 10]);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");

  assert.equal(evidence.mainNodeWorkflowRunId, 30905856582);
  assert.equal(evidence.mainNodeConclusion, "success");
  assert.equal(evidence.mainCiReadbackWorkflowRunId, 30905856642);
  assert.equal(evidence.mainCiReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.mainWorkingTree, "clean");
  assert.equal(evidence.pagesDeploymentWorkflowRunId, 30905856537);
  assert.equal(evidence.pagesDeploymentConclusion, "success");
  assert.equal(evidence.deployedSiteHttpStatus, 200);
  assert.equal(evidence.deployedContentMatchesMergeSha, true);

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(evidence.closeoutPrNumber, 538);
  assert.equal(evidence.closeoutHeadSha, "1395a1fbae95dd2447349ea3f92dc10db4482491");
  assert.equal(evidence.closeoutNodeWorkflowRunId, 30906605404);
  assert.equal(evidence.closeoutNodeWorkflowJobId, 91983038877);
  assert.deepEqual([evidence.closeoutFullRegressionTests, evidence.closeoutFullRegressionPass, evidence.closeoutFullRegressionFail], [2894, 2894, 0]);
  assert.equal(evidence.closeoutMergeSha, "1900ba0676a175f52b5c2c592664c68dc843c7e8");
  assert.equal(evidence.closeoutMainReadback, "PASS");

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice021Started, false);
  assert.equal(claim.closeoutEvidence.prNumber, 538);
  assert.equal(claim.closeoutEvidence.nodeWorkflowRunId, 30906605404);
  assert.deepEqual(claim.closeoutEvidence.fullRegression, {tests: 2894, pass: 2894, fail: 0});
  assert.equal(claim.closeoutEvidence.mergeSha, "1900ba0676a175f52b5c2c592664c68dc843c7e8");
  assert.equal(claim.closeoutEvidence.mainReadback, "PASS");
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice021Implementation");
});
