import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice026-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice026-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F26 closeout binds implementation, current R02/R06 lineage, Chromium, visual, and 793-route evidence while preserving Slice027 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
  ], [26, 4, 4, 5, 5, 0]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 3);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 6);
  assert.equal(manifest.expectedCounts.publicHiddenKnowledgePointCountForSource, 2);
  assert.equal(manifest.expectedCounts.currentPublicSourceCount, 29);
  assert.equal(manifest.expectedCounts.currentPublicKnowledgePointCount, 216);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 25);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 25);
  assert.equal(manifest.expectedCounts.newProductAdmissionCount, 4);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 555);
  assert.equal(evidence.implementationHeadSha, "0bad04ab589055557fbc3a50d3ca490b09bedf8d");
  assert.equal(evidence.implementationMergeSha, "188b119aad4c66b8b26010d341407483fddf4a79");
  assert.equal(evidence.implementationNodeWorkflowRunId, 31146839536);
  assert.equal(evidence.implementationNodeWorkflowJobId, 92767885624);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
    evidence.implementationFullRegressionSkipped,
  ], [2953, 2953, 0, 0]);
  assert.equal(evidence.pgcR02WorkflowRunId, 31146839944);
  assert.equal(evidence.pgcR02Conclusion, "success");
  assert.equal(evidence.pgcR06WorkflowRunId, 31146839798);
  assert.equal(evidence.pgcR06Conclusion, "success");
  assert.equal(evidence.pgcR00WorkflowRunId, 31146840420);
  assert.equal(evidence.pgcR00Conclusion, "success");

  assert.equal(evidence.pgcR09Exact793ArtifactId, 8983138301);
  assert.equal(evidence.pgcR09Exact793LegalRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793ExecutedRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793PassRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793FailRouteCount, 0);
  assert.equal(evidence.pgcR09Exact793FullNineGatePassCount, 793);
  assert.equal(evidence.pgcR09Exact793ConsoleErrorCount, 0);
  assert.equal(evidence.pgcR09Exact793PageErrorCount, 0);

  assert.equal(evidence.acceptanceWorkflowRunId, 31151104775);
  assert.equal(evidence.acceptanceWorkflowJobId, 92780737546);
  assert.equal(evidence.acceptanceArtifactId, 8983322713);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:22f2e31d285e62171f1087a4864f0fc8792e6dd8e433f3af306d93e2dec9158a");
  assert.equal(evidence.acceptedRuntimeBlobSha, "699b90ef1868c7cfbd5ca28d2600d07e19958b77");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptanceWitnessesPerPatternSpec,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [1, 25, 25, 5, 5, 7, 7]);
  assert.equal(evidence.acceptanceNormalizedTrailingZeroEqualityWitnessCount, 1);
  assert.equal(evidence.acceptanceMissingDigitAdditionWitnessCount, 3);
  assert.equal(evidence.acceptanceMissingDigitSubtractionWitnessCount, 2);
  assert.equal(evidence.acceptanceDuplicatePromptFindingCount, 0);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceConsoleErrorCount, 0);
  assert.equal(evidence.acceptancePageErrorCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceVisualReview, "PASS");
  assert.equal(evidence.acceptanceVisualPageReviewCount, 7);
  assert.equal(evidence.acceptanceAnswerKeyReview, "PASS");
  assert.equal(evidence.acceptanceClippedTextFindingCount, 0);
  assert.equal(evidence.acceptanceOverlapFindingCount, 0);
  assert.equal(evidence.acceptanceBrokenGlyphFindingCount, 0);

  assert.equal(manifest.admissionDecision.r02CurrentAuthorityStatus, "PASS_29_SOURCES_216_KPS_ZERO_GAPS");
  assert.equal(manifest.admissionDecision.r06A07TerminalLineageStatus, "PRESERVED");
  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 26);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.hiddenApplicationLineagePreserved, true);
  assert.equal(manifest.mainlineBoundary.applicationProductionAdmitted, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(claim.boundaries.slice027Started, false);
  assert.equal(claim.boundaries.hiddenApplicationLineagePreserved, true);
  assert.equal(claim.boundaries.applicationProductionAdmitted, false);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice026KnowledgePointsAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice026D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice026KnowledgePointsAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 2954);
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
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice027Implementation");
});
