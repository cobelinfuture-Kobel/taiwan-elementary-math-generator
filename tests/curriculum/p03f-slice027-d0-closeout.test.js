import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice027-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice027-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F27 closeout binds implementation, current R02/R06 lineage, exact-head Chromium, visual, and 793-route evidence while preserving Slice028 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
  ], [27, 2, 2, 2, 2, 0]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 3);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 5);
  assert.equal(manifest.expectedCounts.publicHiddenKnowledgePointCountForSource, 2);
  assert.equal(manifest.expectedCounts.currentPublicSourceCount, 29);
  assert.equal(manifest.expectedCounts.currentPublicKnowledgePointCount, 218);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 24);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 24);
  assert.equal(manifest.expectedCounts.newProductAdmissionCount, 2);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 560);
  assert.equal(evidence.implementationHeadSha, "f48536bdcdab757884f22af3232f5f0c91618b3f");
  assert.equal(evidence.implementationMergeSha, "2f64d44d12ecb6b24583a69a5146aca74824a464");
  assert.equal(evidence.implementationNodeWorkflowRunId, 31203366587);
  assert.equal(evidence.implementationNodeWorkflowJobId, 92948439338);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
    evidence.implementationFullRegressionSkipped,
  ], [2968, 2968, 0, 0]);
  assert.equal(evidence.pgcR02WorkflowRunId, 31203365710);
  assert.equal(evidence.pgcR02Conclusion, "success");
  assert.equal(evidence.pgcR06WorkflowRunId, 31203365672);
  assert.equal(evidence.pgcR06Conclusion, "success");
  assert.equal(evidence.pgcR00WorkflowRunId, 31203365252);
  assert.equal(evidence.pgcR00Conclusion, "success");

  assert.equal(evidence.pgcR09Exact793ArtifactId, 9004245066);
  assert.equal(evidence.pgcR09Exact793LegalRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793ExecutedRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793PassRouteCount, 793);
  assert.equal(evidence.pgcR09Exact793FailRouteCount, 0);
  assert.equal(evidence.pgcR09Exact793FullNineGatePassCount, 793);
  assert.equal(evidence.pgcR09Exact793ConsoleErrorCount, 0);
  assert.equal(evidence.pgcR09Exact793PageErrorCount, 0);

  assert.equal(evidence.acceptanceWorkflowRunId, 31203366587);
  assert.equal(evidence.acceptanceWorkflowJobId, 92948439338);
  assert.equal(evidence.acceptanceEvidenceHeadSha, "f48536bdcdab757884f22af3232f5f0c91618b3f");
  assert.equal(evidence.acceptanceArtifactId, 9003818238);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:434bebbc468c74043e52bd10b7c6e3e78d9fc65e46b8ac5776a274a7b3fb7e69");
  assert.equal(evidence.acceptedRuntimeBlobSha, "5d5414014db0d6b539dd975a0133a5776d98b895");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptanceWitnessesPerPatternSpec,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [1, 24, 24, 2, 12, 6, 6]);
  assert.equal(evidence.acceptanceComparisonEqualityWitnessCount, 3);
  assert.equal(evidence.acceptanceComparisonNonEqualityWitnessCount, 9);
  assert.equal(evidence.acceptanceAdditionWitnessCount, 6);
  assert.equal(evidence.acceptanceSubtractionWitnessCount, 6);
  assert.equal(evidence.acceptanceCrossLayerMismatchCount, 0);
  assert.equal(evidence.acceptanceDuplicatePromptFindingCount, 0);
  assert.equal(evidence.acceptanceOverflowFindingCount, 0);
  assert.equal(evidence.acceptanceConsoleErrorCount, 0);
  assert.equal(evidence.acceptancePageErrorCount, 0);
  assert.equal(evidence.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(evidence.acceptanceHiddenApplicationLeakCount, 0);
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

  assert.equal(manifest.admissionDecision.r02CurrentAuthorityStatus, "PASS_29_SOURCES_218_KPS_ZERO_GAPS");
  assert.equal(manifest.admissionDecision.r06A07TerminalLineageStatus, "PRESERVED");
  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 27);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.hiddenApplicationLineagePreserved, true);
  assert.equal(manifest.mainlineBoundary.applicationProductionAdmitted, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(claim.boundaries.slice028Started, false);
  assert.equal(claim.boundaries.hiddenApplicationLineagePreserved, true);
  assert.equal(claim.boundaries.applicationProductionAdmitted, false);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice027KnowledgePointsAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice027D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice027KnowledgePointsAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 2969);
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
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice028Implementation");
});
