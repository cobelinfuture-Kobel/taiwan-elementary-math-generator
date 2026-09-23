import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice023-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice023-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F23 D0 closeout binds exact GitHub evidence and preserves Slice024 boundary", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
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

  assert.equal(evidence.closeoutPrNumber, 547);
  assert.equal(evidence.closeoutHeadSha, "ff3b3a148b79e9d823191a1848f8690a8375d3e0");
  assert.equal(evidence.closeoutNodeWorkflowRunId, 30966785421);
  assert.equal(evidence.closeoutNodeWorkflowJobId, 92182367493);
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.deepEqual([
    evidence.closeoutFullRegressionTests,
    evidence.closeoutFullRegressionPass,
    evidence.closeoutFullRegressionFail,
  ], [2926, 2926, 0]);
  assert.equal(evidence.closeoutMergeSha, "eba7fb4403e1e82050612b04aeb4500fcd9324f3");
  assert.equal(evidence.closeoutMainCiReadbackWorkflowRunId, 30967406604);
  assert.equal(evidence.closeoutMainCiReadbackWorkflowJobId, 92184251674);
  assert.equal(evidence.closeoutMainReadbackCommitSha, "a843ac194598b27e93cc73cf56fd7adfbbcd80d2");
  assert.equal(evidence.closeoutMainReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(evidence.closeoutMainWorkingTree, "clean");
  assert.equal(evidence.closeoutPagesDeploymentConclusion, "success");
  assert.equal(evidence.closeoutPagesDeploymentSha, "eba7fb4403e1e82050612b04aeb4500fcd9324f3");
  assert.equal(evidence.closeoutPagesDeploymentEvidenceMode, "success_gated_downstream_workflow_run");
  assert.equal(evidence.closeoutPagesDeploymentEvidenceRunId, 30967601941);
  assert.equal(evidence.closeoutDownstreamSmokeStatus, "FAIL_PREEXISTING_STALE_EXPECTATION");
  assert.equal(evidence.closeoutDownstreamSmokePreexistedImplementationCloseout, true);
  assert.equal(evidence.closeoutDownstreamSmokeBlocksSlice023D0, false);

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, true);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, false);
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice024Started, false);
  assert.deepEqual(claim.closeoutEvidence.fullRegression, { tests: 2926, pass: 2926, fail: 0 });
  assert.equal(claim.closeoutEvidence.mainReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(claim.closeoutEvidence.mainWorkingTree, "clean");
  assert.equal(claim.closeoutEvidence.downstreamSmokePreexistedImplementationCloseout, true);
  assert.equal(claim.closeoutEvidence.downstreamSmokeBlocksSlice023D0, false);
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice024Implementation");
});
