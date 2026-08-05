import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice022-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice022-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F22 D0 closeout binds exact GitHub evidence and preserves Slice023 boundary", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
  ], [22, 2, 2, 6]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.applicationPatternSpecCount, 0);
  assert.equal(manifest.expectedCounts.globalContextBindingCount, 0);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 24);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 24);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 543);
  assert.equal(evidence.implementationHeadSha, "9eeda5577406cb31133b55510d4d7b938616372c");
  assert.equal(evidence.implementationMergeSha, "fbdaeb0dc87a8e533bfd6daa36fe1066dc037849");
  assert.equal(evidence.implementationNodeWorkflowRunId, 30917763608);
  assert.equal(evidence.implementationNodeWorkflowJobId, 92020152984);
  assert.deepEqual([evidence.implementationFullRegressionTests, evidence.implementationFullRegressionPass, evidence.implementationFullRegressionFail], [2915, 2915, 0]);
  assert.equal(evidence.acceptanceArtifactId, 8895878847);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:246fd7017267516b689e2e6258d8c589093dc318d8a5832aa7c626f383198b22");
  assert.equal(evidence.acceptancePdfPageCount, 6);
  assert.equal(evidence.acceptanceQuestionCount, 24);
  assert.equal(evidence.acceptanceAnswerKeyCount, 24);
  assert.deepEqual(Object.values(evidence.acceptancePatternSpecWitnessCounts), [4, 4, 4, 4, 4, 4]);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");

  assert.equal(evidence.mainNodeWorkflowRunId, 30918789598);
  assert.equal(evidence.mainNodeWorkflowJobId, 92023641785);
  assert.equal(evidence.mainNodeConclusion, "success");
  assert.equal(evidence.mainCiReadbackWorkflowRunId, 30918789630);
  assert.equal(evidence.mainCiReadbackCommitSha, "8ace75808da310b22f88d0c2b49330532ca6b264");
  assert.equal(evidence.mainCiReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.mainWorkingTree, "clean");
  assert.equal(evidence.pagesDeploymentWorkflowRunId, 30918789915);
  assert.equal(evidence.pagesDeploymentWorkflowJobId, 92024853887);
  assert.equal(evidence.pagesDeploymentConclusion, "success");
  assert.equal(evidence.deployedSiteHttpStatus, 200);
  assert.equal(evidence.deployedContentMatchesMergeSha, true);

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(evidence.closeoutPrNumber, 544);
  assert.equal(evidence.closeoutHeadSha, "3aa17dc70933b39f8e2e5e500cd956609ac936c7");
  assert.equal(evidence.closeoutNodeWorkflowRunId, 30920034105);
  assert.equal(evidence.closeoutNodeWorkflowJobId, 92027921649);
  assert.deepEqual([evidence.closeoutFullRegressionTests, evidence.closeoutFullRegressionPass, evidence.closeoutFullRegressionFail], [2916, 2916, 0]);
  assert.equal(evidence.closeoutMergeSha, "4de52051799b483acfa5b517d3492b3d38112e86");
  assert.equal(evidence.closeoutMainNodeWorkflowRunId, 30920396179);
  assert.equal(evidence.closeoutMainCiReadbackWorkflowRunId, 30920396645);
  assert.equal(evidence.closeoutMainReadbackCommitSha, "420c52f2de460837e2f3ff4aaddc2777138e66cd");
  assert.equal(evidence.closeoutMainReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.closeoutMainWorkingTree, "clean");
  assert.equal(evidence.closeoutPagesDeploymentWorkflowRunId, 30920396080);
  assert.equal(evidence.closeoutPagesDeploymentConclusion, "success");

  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice023Started, false);
  assert.deepEqual(claim.closeoutEvidence.fullRegression, {tests: 2916, pass: 2916, fail: 0});
  assert.equal(claim.closeoutEvidence.mainReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(claim.closeoutEvidence.mainWorkingTree, "clean");
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice023Implementation");
});
