import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice028-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice028-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F28 closeout binds implementation, 219-KP R02/R06 lineage, exact-head Chromium/visual, and 793-route evidence while preserving Slice029 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
  ], [28, 1, 1, 1, 1, 0]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 2);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 2);
  assert.equal(manifest.expectedCounts.publicHiddenKnowledgePointCountForSource, 6);
  assert.equal(manifest.expectedCounts.currentPublicSourceCount, 29);
  assert.equal(manifest.expectedCounts.currentPublicKnowledgePointCount, 219);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 24);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 24);
  assert.equal(manifest.expectedCounts.newKnowledgePointWitnessCount, 12);
  assert.equal(manifest.expectedCounts.newProductAdmissionCount, 1);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 564);
  assert.equal(evidence.implementationHeadSha, "d6edf1c17c10b522b1e77e1e5a00b46de3f25d06");
  assert.equal(evidence.implementationMergeSha, "fa1cc0adcc7bf5f4891249ccf623d9e5e99e93dd");
  assert.equal(evidence.implementationNodeWorkflowRunId, 31235704359);
  assert.equal(evidence.implementationNodeWorkflowJobId, 93047680291);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
    evidence.implementationFullRegressionSkipped,
  ], [2983, 2983, 0, 0]);
  assert.equal(evidence.implementationNodeDiagnosticsArtifactId, 9015345888);
  assert.equal(evidence.implementationNodeDiagnosticsArtifactDigest, "sha256:985e52a3c25bbb99e25f6c490340d25e6e0e03e3b125a6dcb2bbf5a9bca08d40");
  assert.equal(evidence.pgcR02WorkflowRunId, 31235704339);
  assert.equal(evidence.pgcR02Conclusion, "success");
  assert.equal(evidence.pgcR06WorkflowRunId, 31235704345);
  assert.equal(evidence.pgcR06Conclusion, "success");
  assert.equal(evidence.pgcR06A01HistoricalWorkflowRunId, 31235704334);
  assert.equal(evidence.pgcR06A01HistoricalConclusion, "success");
  assert.equal(evidence.pgcR06A03WorkflowRunId, 31235704325);
  assert.equal(evidence.pgcR06A03Conclusion, "success");
  assert.equal(evidence.pgcR00WorkflowRunId, 31235704342);
  assert.equal(evidence.pgcR00Conclusion, "success");

  assert.equal(evidence.pgcR09Exact793ArtifactId, 9015524580);
  assert.equal(evidence.pgcR09Exact793ArtifactDigest, "sha256:2681eaf8d2092eb413aeef70e8ab62b9810fcee95a9663a0f06673ce00e03698");
  assert.equal(evidence.pgcR09Exact793LegalRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793ExecutedRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793PassRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793FailRouteCount, 0);
  assert.equal(evidence.pgcR09Exact793FullNineGatePassCount, 793);
  assert.equal(evidence.pgcR09Exact793ConsoleErrorCount, 0);
  assert.equal(evidence.pgcR09Exact793PageErrorCount, 0);

  assert.equal(evidence.acceptanceWorkflowRunId, 31235704359);
  assert.equal(evidence.acceptanceWorkflowJobId, 93047680291);
  assert.equal(evidence.acceptanceEvidenceHeadSha, "d6edf1c17c10b522b1e77e1e5a00b46de3f25d06");
  assert.equal(evidence.acceptanceArtifactId, 9015346361);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:8a2b72de43ef6cc712abe9ed2c1402df5b6be5e914e24da27fabac67f8c67ede");
  assert.equal(evidence.acceptedRuntimeBlobSha, "6648b583e9d25e01dff6e6dc06d3d0474cffaf97");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptanceWitnessesPerPatternSpec,
    evidence.acceptanceNewPatternSpecWitnessCount,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [1, 24, 24, 2, 12, 12, 6, 6]);
  assert.equal(evidence.acceptanceInternalZeroWitnessCount, 2);
  assert.equal(evidence.acceptanceTrailingZeroWitnessCount, 4);
  assert.equal(evidence.acceptanceCrossLayerMismatchCount, 0);
  assert.equal(evidence.acceptanceDuplicatePromptFindingCount, 0);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceConsoleErrorCount, 0);
  assert.equal(evidence.acceptancePageErrorCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceApplicationLeakFindingCount, 0);
  assert.equal(evidence.acceptanceHiddenApplicationLineagePreserved, true);
  assert.equal(evidence.acceptanceSharedPagination, true);
  assert.equal(evidence.acceptanceSharedRenderer, true);
  assert.equal(evidence.acceptanceParallelPipeline, false);
  assert.equal(evidence.acceptanceVisualReview, "PASS");
  assert.equal(evidence.acceptanceVisualPageReviewCount, 6);
  assert.equal(evidence.acceptanceAnswerKeyReview, "PASS");
  assert.equal(evidence.acceptanceClippedTextFindingCount, 0);
  assert.equal(evidence.acceptanceOverlapFindingCount, 0);
  assert.equal(evidence.acceptanceBrokenGlyphFindingCount, 0);

  assert.equal(manifest.admissionDecision.r02CurrentAuthorityStatus, "PASS_29_SOURCES_219_KPS_ZERO_GAPS");
  assert.equal(manifest.admissionDecision.r06HistoricalLineageStatus, "PRESERVED");
  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 28);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.applicationNotApplicable, true);
  assert.equal(manifest.mainlineBoundary.applicationProductionAdmitted, false);
  assert.equal(manifest.mainlineBoundary.hiddenApplicationLineagePreserved, true);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(manifest.mainlineBoundary.nextTaskRequiresSeparateApproval, true);
  assert.equal(claim.boundaries.slice029Started, false);
  assert.equal(claim.boundaries.applicationNotApplicable, true);
  assert.equal(claim.boundaries.applicationProductionAdmitted, false);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice028KnowledgePointAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice028D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice028KnowledgePointAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 2984);
  assert.equal(evidence.closeoutFullRegressionPass, evidence.closeoutFullRegressionTests);
  assert.equal(evidence.closeoutFullRegressionFail, 0);
  assert.equal(evidence.closeoutFullRegressionSkipped, 0);
  assert.ok(Number.isInteger(evidence.closeoutNodeDiagnosticsArtifactId));
  assert.match(evidence.closeoutNodeDiagnosticsArtifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.match(evidence.closeoutMergeSha, /^[0-9a-f]{40}$/);

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
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice029Implementation");
});
