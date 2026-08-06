import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice025-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice025-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F25 closeout binds accepted implementation, Chromium, and 793-route evidence while preserving Slice026 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
  ], [25, 1, 1, 3, 3, 0]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 2);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 2);
  assert.equal(manifest.expectedCounts.publicHiddenKnowledgePointCountForSource, 4);
  assert.equal(manifest.expectedCounts.currentPublicKnowledgePointCount, 212);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 24);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 24);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 552);
  assert.equal(evidence.implementationHeadSha, "a0aec21da893147636d6a92342315972947b4315");
  assert.equal(evidence.implementationMergeSha, "2e51effd085ee5b0237506089f00e7b3871a361e");
  assert.equal(evidence.implementationNodeWorkflowRunId, 31014126078);
  assert.equal(evidence.implementationNodeWorkflowJobId, 92333608758);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
    evidence.implementationFullRegressionSkipped,
  ], [2942, 2942, 0, 0]);
  assert.equal(evidence.pgcR02WorkflowRunId, 31014126040);
  assert.equal(evidence.pgcR02Conclusion, "success");
  assert.equal(evidence.pgcR06WorkflowRunId, 31014127184);
  assert.equal(evidence.pgcR06Conclusion, "success");

  assert.equal(evidence.pgcR00WorkflowRunId, 31014126028);
  assert.equal(evidence.pgcR00Conclusion, "success");
  assert.equal(evidence.pgcR09Exact793ArtifactId, 8936342581);
  assert.equal(evidence.pgcR09Exact793ExecutedRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793PassRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793FailRouteCount, 0);
  assert.equal(evidence.pgcR09Exact793FullNineGatePassCount, 793);
  assert.equal(evidence.pgcR09Exact793ConsoleErrorCount, 0);
  assert.equal(evidence.pgcR09Exact793PageErrorCount, 0);
  assert.equal(evidence.transientClassification, "NON_DETERMINISTIC_AGGREGATE_BROWSER_CLICK_DISPATCH_STALL_NOT_PRODUCT_DEFECT");

  assert.equal(evidence.acceptanceWorkflowRunId, 31014127688);
  assert.equal(evidence.acceptanceArtifactId, 8933725140);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:9662f49912c759c538f1f6230203d98466c853dcc4d89bf3ac71a28e0fe7333c");
  assert.equal(evidence.acceptedRuntimeBlobSha, "a997ee32665f2edd3081d0390fa6ee50dac28d66");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptanceWitnessesPerPatternSpec,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [1, 24, 24, 3, 8, 6, 6]);
  assert.equal(evidence.acceptanceDuplicatePromptFindingCount, 0);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceConsoleErrorCount, 0);
  assert.equal(evidence.acceptancePageErrorCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");
  assert.equal(evidence.acceptanceVisualPageReviewCount, 6);
  assert.equal(evidence.acceptanceAnswerKeyReview, "PASS");

  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 25);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(manifest.mainlineBoundary.fractionArithmeticAdded, false);
  assert.equal(claim.boundaries.slice026Started, false);
  assert.equal(claim.boundaries.newPublicSourceAdded, false);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);
  assert.equal(claim.boundaries.fractionArithmeticAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice025KnowledgePointAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice025D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice025KnowledgePointAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 2943);
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
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice026Implementation");
});
