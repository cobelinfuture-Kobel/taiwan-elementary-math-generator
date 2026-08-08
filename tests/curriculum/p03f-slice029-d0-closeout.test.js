import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice029-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice029-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F29 closeout binds exact implementation and preserves Slice030 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
    manifest.expectedCounts.hiddenApplicationPatternSpecCount,
  ], [29, 1, 1, 1, 1, 0, 1]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 3);
  assert.deepEqual([
    manifest.expectedCounts.publicVisibleKnowledgePointCountForSource,
    manifest.expectedCounts.publicHiddenKnowledgePointCountForSource,
    manifest.expectedCounts.currentPublicSourceCount,
    manifest.expectedCounts.currentPublicKnowledgePointCount,
  ], [5, 2, 29, 220]);
  assert.deepEqual([
    manifest.expectedCounts.questionWitnessCount,
    manifest.expectedCounts.answerKeyWitnessCount,
    manifest.expectedCounts.newKnowledgePointWitnessCount,
    manifest.expectedCounts.newProductAdmissionCount,
  ], [24, 24, 24, 1]);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 569);
  assert.equal(evidence.implementationHeadSha, "255920159d30affad14e69799ac5fb19b620fe8b");
  assert.equal(evidence.implementationMergeSha, "2c582e37ae8ceaa9053d78c0e2d027565f4b76a8");
  assert.equal(evidence.implementationNodeWorkflowRunId, 31259126674);
  assert.equal(evidence.implementationNodeWorkflowJobId, 93107060614);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
    evidence.implementationFullRegressionSkipped,
  ], [2993, 2993, 0, 0]);
  assert.equal(evidence.implementationNodeDiagnosticsArtifactId, 9022292797);
  assert.equal(evidence.implementationNodeDiagnosticsArtifactDigest, "sha256:d9085dab5c1f362f3f959cf198d2997fe282a278f80887e76ef069cb60a0f10d");
  assert.equal(evidence.pgcR02EvidenceProvenance, "NODE_FULL_REGRESSION_CONTRACTS");
  assert.equal(evidence.pgcR02Status, "PASS_29_SOURCES_220_KPS");
  assert.equal(evidence.pgcR06A03WorkflowRunId, 31259126623);
  assert.equal(evidence.pgcR06A03Conclusion, "success");
  assert.equal(evidence.pgcR06HistoricalLineageStatus, "PRESERVED_BY_NODE_FULL_REGRESSION");
  assert.equal(evidence.pgcR00EvidenceProvenance, "NODE_FULL_REGRESSION_CANONICAL_793_AUTHORITY_CONTRACTS");
  assert.equal(evidence.pgcR00Canonical793Status, "PASS");
  assert.equal(evidence.prGateWorkflowRunId, 31259126611);
  assert.equal(evidence.prGateConclusion, "success");

  assert.equal(evidence.acceptanceWorkflowRunId, 31259126664);
  assert.equal(evidence.acceptanceWorkflowJobId, 93107060101);
  assert.equal(evidence.acceptanceEvidenceHeadSha, "255920159d30affad14e69799ac5fb19b620fe8b");
  assert.equal(evidence.acceptanceArtifactId, 9022269645);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:041c404624a8913b30747e012e57fbf65e8f91e7194d300908df54a3584b699c");
  assert.equal(evidence.acceptedRuntimeBlobSha, "caeafed358519b4ad8e3532d8399dbb226e6d2f7");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptancePatternSpecWitnessCount,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [1, 24, 24, 1, 24, 6, 6]);
  assert.deepEqual([
    evidence.acceptanceLessThanWitnessCount,
    evidence.acceptanceEqualWitnessCount,
    evidence.acceptanceGreaterThanWitnessCount,
    evidence.acceptanceImproperFractionWitnessCount,
  ], [11, 4, 9, 12]);
  for (const key of [
    "acceptanceCrossLayerMismatchCount",
    "acceptanceDuplicatePromptFindingCount",
    "acceptanceOverflowFindingCount",
    "acceptanceConsoleErrorCount",
    "acceptancePageErrorCount",
    "acceptanceSemanticScopeFindingCount",
    "acceptanceApplicationLeakFindingCount",
    "acceptanceClippedTextFindingCount",
    "acceptanceOverlapFindingCount",
    "acceptanceBrokenGlyphFindingCount",
  ]) assert.equal(evidence[key], 0, key);
  assert.equal(evidence.acceptanceHiddenApplicationLineagePreserved, true);
  assert.equal(evidence.acceptanceSharedPagination, true);
  assert.equal(evidence.acceptanceSharedRenderer, true);
  assert.equal(evidence.acceptanceParallelPipeline, false);
  assert.equal(evidence.acceptanceVisualReview, "PASS");
  assert.equal(evidence.acceptanceVisualPageReviewCount, 6);
  assert.equal(evidence.acceptanceAnswerKeyReview, "PASS");

  assert.equal(manifest.admissionDecision.r02CurrentAuthorityStatus, "PASS_29_SOURCES_220_KPS_NODE_CONTRACT");
  assert.equal(manifest.admissionDecision.r06HistoricalLineageStatus, "PRESERVED");
  assert.equal(manifest.admissionDecision.canonical793AuthorityStatus, "PASS_NODE_CONTRACT");
  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 29);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, false);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, true);
  assert.equal(manifest.mainlineBoundary.applicationCompatible, true);
  assert.equal(manifest.mainlineBoundary.applicationProductionAdmitted, false);
  assert.equal(manifest.mainlineBoundary.hiddenApplicationLineagePreserved, true);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(manifest.mainlineBoundary.nextTaskRequiresSeparateApproval, true);
  assert.equal(claim.boundaries.slice030Started, false);
  assert.equal(claim.boundaries.applicationCompatible, true);
  assert.equal(claim.boundaries.applicationProductionAdmitted, false);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice029KnowledgePointAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice029D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice029KnowledgePointAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 2994);
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
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice030Implementation");
});
