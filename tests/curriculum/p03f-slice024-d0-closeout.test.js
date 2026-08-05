import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice024-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice024-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F24 closeout binds accepted implementation evidence and preserves Slice025 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
  ], [24, 4, 8, 20, 10, 10]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.existingContextBindingCount, 10);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 8);
  assert.equal(manifest.expectedCounts.currentPublicKnowledgePointCount, 211);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 40);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 40);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 549);
  assert.equal(evidence.implementationHeadSha, "091e4241c626379b35f57fc681b842985a0d7218");
  assert.equal(evidence.implementationMergeSha, "40fcb6859190abcd4c5cf5268297842e9ceac89b");
  assert.equal(evidence.implementationNodeWorkflowRunId, 30976548085);
  assert.equal(evidence.implementationNodeWorkflowJobId, 92211657710);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
  ], [2934, 2934, 0]);
  assert.equal(evidence.pgcR02WorkflowRunId, 30976548023);
  assert.equal(evidence.pgcR02Conclusion, "success");
  assert.equal(evidence.pgcR06WorkflowRunId, 30976548067);
  assert.equal(evidence.pgcR06Conclusion, "success");

  assert.equal(evidence.acceptanceWorkflowRunId, 30976345833);
  assert.equal(evidence.acceptanceArtifactId, 8918396713);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:47e2fdf8821c10e08cff2e5abd0c4a6f8ffe08eb3a6474b54b59a71a5da980b9");
  assert.equal(evidence.acceptedRuntimeBlobSha, "ddbc771d7f4c4d6386986971f14f530c7d1ab106");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptanceWitnessesPerPatternSpec,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [2, 40, 40, 20, 2, 11, 11]);
  assert.equal(evidence.acceptanceDuplicatePromptFindingCount, 0);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceConsoleErrorCount, 0);
  assert.equal(evidence.acceptancePageErrorCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");
  assert.equal(evidence.acceptanceVisualPageReviewCount, 11);
  assert.equal(evidence.acceptanceSemanticReview, "PASS");
  assert.equal(evidence.acceptanceAnswerKeyReview, "PASS");
  assert.equal(evidence.temporaryAcceptanceWorkflowRetired, true);

  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 24);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.existingW02ContextLineageReused, true);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(claim.boundaries.slice025Started, false);
  assert.equal(claim.boundaries.newPublicSourceAdded, false);
  assert.equal(claim.boundaries.existingPublicSourceExpanded, true);
  assert.equal(claim.boundaries.existingW02ContextLineageReused, true);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice024KnowledgePointsAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice024D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice024KnowledgePointsAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 2935);
  assert.equal(evidence.closeoutFullRegressionPass, evidence.closeoutFullRegressionTests);
  assert.equal(evidence.closeoutFullRegressionFail, 0);

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.productResult.d0Complete, true);
  assert.ok(Number.isInteger(claim.closeoutEvidence.prNumber));
  assert.match(claim.closeoutEvidence.headSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(claim.closeoutEvidence.nodeWorkflowRunId));
  assert.ok(Number.isInteger(claim.closeoutEvidence.nodeWorkflowJobId));
  assert.equal(claim.closeoutEvidence.nodeConclusion, "success");
  assert.equal(claim.closeoutEvidence.fullRegression.fail, 0);
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice025Implementation");
});
