import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice030-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice030-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F30 closeout binds exact implementation and preserves Slice031 boundary", () => {
  assert.deepEqual([
    manifest.expectedCounts.queuePosition,
    manifest.expectedCounts.knowledgePointCount,
    manifest.expectedCounts.patternGroupCount,
    manifest.expectedCounts.patternSpecCount,
    manifest.expectedCounts.numericPatternSpecCount,
    manifest.expectedCounts.applicationPatternSpecCount,
    manifest.expectedCounts.hiddenApplicationPatternSpecCount,
  ], [30, 4, 4, 4, 4, 0, 3]);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 1);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 3);
  assert.deepEqual([
    manifest.expectedCounts.publicVisibleKnowledgePointCountForSource,
    manifest.expectedCounts.publicHiddenKnowledgePointCountForSource,
    manifest.expectedCounts.currentPublicSourceCount,
    manifest.expectedCounts.currentPublicKnowledgePointCount,
  ], [4, 3, 30, 224]);
  assert.deepEqual([
    manifest.expectedCounts.questionWitnessCount,
    manifest.expectedCounts.answerKeyWitnessCount,
    manifest.expectedCounts.newKnowledgePointWitnessCount,
    manifest.expectedCounts.newProductAdmissionCount,
  ], [24, 24, 24, 4]);

  const evidence = manifest.exactAcceptance;
  assert.equal(evidence.implementationPrNumber, 572);
  assert.equal(evidence.implementationHeadSha, "a24733f1deebc6ee6fdaf029d32da4a93496feaa");
  assert.equal(evidence.implementationMergeSha, "1de4bcc6dbf40d512131dcf84270471fb48ad50b");
  assert.equal(evidence.implementationNodeWorkflowRunId, 31306695826);
  assert.equal(evidence.implementationNodeWorkflowJobId, 93228095486);
  assert.equal(evidence.implementationNodeConclusion, "success");
  assert.deepEqual([
    evidence.implementationFullRegressionTests,
    evidence.implementationFullRegressionPass,
    evidence.implementationFullRegressionFail,
    evidence.implementationFullRegressionSkipped,
  ], [3003, 3003, 0, 0]);
  assert.equal(evidence.implementationNodeDiagnosticsArtifactId, 9036198175);
  assert.equal(evidence.implementationNodeDiagnosticsArtifactDigest, "sha256:6806e70b00b48fd5e59929092c14b0d43bc1a990cf508667f2df453e70c68677");
  assert.equal(evidence.pgcR02EvidenceProvenance, "NODE_FULL_REGRESSION_AND_MAIN_READBACK");
  assert.equal(evidence.pgcR02Status, "PASS_30_SOURCES_224_KPS_ZERO_GAPS");
  assert.equal(evidence.pgcR06A03WorkflowRunId, 31306695795);
  assert.equal(evidence.pgcR06A03Conclusion, "success");
  assert.equal(evidence.pgcR06HistoricalLineageStatus, "PRESERVED_BY_EXACT_HEAD_REQUIRED_CI");
  assert.equal(evidence.pgcR00WorkflowRunId, 31306696007);
  assert.equal(evidence.pgcR00Conclusion, "success");
  assert.equal(evidence.pgcR09Exact793ArtifactId, 9036356547);
  assert.equal(evidence.pgcR09Exact793ArtifactDigest, "sha256:fb2a47ff7cfbbe2d1356668bbd45bc041a84c8ce24ac801877dba063e28896b8");
  assert.deepEqual([
    evidence.pgcR09Exact793Legal,
    evidence.pgcR09Exact793Executed,
    evidence.pgcR09Exact793Pass,
    evidence.pgcR09Exact793Fail,
    evidence.pgcR09Exact793FullNineGatePass,
  ], [793, 793, 793, 0, 793]);
  assert.equal(evidence.prGateWorkflowRunId, 31306695903);
  assert.equal(evidence.prGateConclusion, "success");

  assert.equal(evidence.acceptanceWorkflowRunId, 31306695911);
  assert.equal(evidence.acceptanceWorkflowJobId, 93228095786);
  assert.equal(evidence.acceptanceEvidenceHeadSha, "a24733f1deebc6ee6fdaf029d32da4a93496feaa");
  assert.equal(evidence.acceptanceArtifactId, 9036174106);
  assert.equal(evidence.acceptanceArtifactDigest, "sha256:4d404a474d234ced5a50cb0b49c37cf9ce98ceeb59d4cc109292863f63941cce");
  assert.equal(evidence.acceptedRuntimeBlobSha, "e781667f8f308be5b4632b9d6b778664b3a61c54");
  assert.equal(evidence.mainRuntimeBlobSha, evidence.acceptedRuntimeBlobSha);
  assert.deepEqual([
    evidence.acceptanceCaseCount,
    evidence.acceptanceQuestionCount,
    evidence.acceptanceAnswerKeyCount,
    evidence.acceptancePatternSpecCount,
    evidence.acceptanceWitnessesPerPatternSpec,
    evidence.acceptancePdfPageCount,
    evidence.acceptanceScreenshotCount,
  ], [1, 24, 24, 4, 6, 6, 6]);
  assert.deepEqual([
    evidence.acceptanceLessThanWitnessCount,
    evidence.acceptanceEqualWitnessCount,
    evidence.acceptanceGreaterThanWitnessCount,
    evidence.acceptanceImproperFractionWitnessCount,
  ], [2, 1, 3, 17]);
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

  assert.equal(manifest.admissionDecision.r02CurrentAuthorityStatus, "PASS_30_SOURCES_224_KPS_ZERO_GAPS");
  assert.equal(manifest.admissionDecision.r06HistoricalLineageStatus, "PRESERVED");
  assert.equal(manifest.admissionDecision.canonical793AuthorityStatus, "PASS_EXACT_BROWSER_REPLAY");
  assert.equal(manifest.mainlineBoundary.queuePositionConsumed, 30);
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.newPublicSourceAdded, true);
  assert.equal(manifest.mainlineBoundary.existingPublicSourceExpanded, false);
  assert.equal(manifest.mainlineBoundary.applicationCompatible, true);
  assert.equal(manifest.mainlineBoundary.applicationProductionAdmitted, false);
  assert.equal(manifest.mainlineBoundary.hiddenApplicationLineagePreserved, true);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);
  assert.equal(manifest.mainlineBoundary.sharedWorksheetRendererBehaviorChanged, false);
  assert.equal(manifest.mainlineBoundary.nextTaskRequiresSeparateApproval, false);
  assert.equal(claim.boundaries.slice031Started, false);
  assert.equal(claim.boundaries.newPublicSourceAdded, true);
  assert.equal(claim.boundaries.existingPublicSourceExpanded, false);
  assert.equal(claim.boundaries.applicationCompatible, true);
  assert.equal(claim.boundaries.applicationProductionAdmitted, false);
  assert.equal(claim.boundaries.globalContextExpanded, false);
  assert.equal(claim.boundaries.parallelRuntimePipelineAdded, false);

  if (manifest.status === "READY_FOR_D0_CLOSEOUT_CI") {
    assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionDecision.status, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(manifest.mainlineBoundary.slice030KnowledgePointsAdmitted, false);
    assert.equal(claim.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(claim.goalDistance, "D1");
    assert.equal(claim.productResult.productAdmissionState, "READY_FOR_D0_CLOSEOUT_CI");
    assert.equal(claim.productResult.d0Complete, false);
    assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice030D0Closeout");
    return;
  }

  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.mainlineBoundary.slice030KnowledgePointsAdmitted, true);
  assert.ok(Number.isInteger(evidence.closeoutPrNumber));
  assert.match(evidence.closeoutHeadSha, /^[0-9a-f]{40}$/);
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowRunId));
  assert.ok(Number.isInteger(evidence.closeoutNodeWorkflowJobId));
  assert.equal(evidence.closeoutNodeConclusion, "success");
  assert.ok(evidence.closeoutFullRegressionTests >= 3004);
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
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice031Implementation");
});
