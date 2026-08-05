import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice023-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice023-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F23 closeout candidate binds exact evidence and fails closed before Slice024", () => {
  assert.equal(manifest.status, "READY_FOR_CLOSEOUT_CI");
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
  ], [23, 1, 1, 3]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 1);
  assert.equal(manifest.expectedCounts.applicationPatternSpecCount, 0);
  assert.equal(manifest.expectedCounts.globalContextBindingCount, 0);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 24);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 24);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 546);
  assert.equal(evidence.implementationHeadSha, "febe8c4a8e2b0f26fb046c2319fe7c02a44e156c");
  assert.equal(evidence.implementationMergeSha, "8da935579f45166d7b7d1160604ff1d348cccf35");
  assert.equal(evidence.implementationNodeWorkflowRunId, 30964939994);
  assert.equal(evidence.implementationNodeWorkflowJobId, 92176804652);
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
  ], [2925, 2925, 0]);

  assert.equal(evidence.acceptanceArtifactId, 8914436806);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:5b4476b5c62d76a60844eedf041c36864badaf800350f7bc130924def0c2c585");
  assert.equal(evidence.acceptancePdfPageCount, 6);
  assert.equal(evidence.acceptanceQuestionCount, 24);
  assert.equal(evidence.acceptanceAnswerKeyCount, 24);
  assert.deepEqual(Object.values(evidence.acceptancePatternSpecWitnessCounts), [8, 8, 8]);
  assert.equal(evidence.acceptanceDuplicatePromptFindingCount, 0);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceConsoleErrorCount, 0);
  assert.equal(evidence.acceptancePageErrorCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");
  assert.equal(evidence.acceptanceVisualPageReviewCount, 6);
  assert.equal(evidence.acceptanceAnswerKeyReview, "PASS");

  assert.equal(evidence.mainCiReadbackWorkflowRunId, 30965272037);
  assert.equal(evidence.mainCiReadbackWorkflowJobId, 92177755412);
  assert.equal(evidence.mainCiReadbackCommitSha, "f88c4a7df397d7bd7e14d8c9f8d386b92e10fa40");
  assert.equal(evidence.mainCiReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.mainWorkingTree, "clean");
  assert.equal(evidence.deployedSmokeWorkflowRunId, 30965516568);
  assert.equal(evidence.deployedSmokeStatus, "PASS");
  assert.equal(evidence.deployedDeploymentSha, "8da935579f45166d7b7d1160604ff1d348cccf35");
  assert.equal(evidence.deployedContentMatchesMergeSha, true);

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, true);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, false);
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0_CANDIDATE");
  assert.equal(claim.status, "PASS_D0_CLOSEOUT_CANDIDATE");
  assert.equal(claim.goalDistance, "D1_CLOSEOUT_CANDIDATE");
  assert.equal(claim.productResult.productAdmissionState, "PRODUCTION_ADMITTED_CLOSEOUT_CANDIDATE");
  assert.equal(claim.productResult.d0Complete, false);
  assert.equal(claim.boundaries.slice024Started, false);
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice023Implementation");
});
