import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice018-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice018-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F18 D0 closeout binds merged core, current-surface, E6, Pixel repair and formal closeout evidence while preserving Slice019 boundary", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.expectedCounts.queuePosition, 18);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.knowledgePointCount, 1);
  assert.equal(manifest.expectedCounts.patternGroupCount, 1);
  assert.equal(manifest.expectedCounts.patternSpecCount, 1);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 2);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 18);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 18);

  assert.equal(manifest.exactAcceptance.coreImplementationPrNumber, 522);
  assert.equal(manifest.exactAcceptance.coreImplementationMergeSha, "34282b6282365b1f8b5b4bb8d8e2088523bbdce3");
  assert.equal(manifest.exactAcceptance.currentSurfacePrNumber, 523);
  assert.equal(manifest.exactAcceptance.currentSurfaceMergeSha, "b678f5d1fc985d66f291d5e473dac19305824422");
  assert.equal(manifest.exactAcceptance.currentSurfaceGlmS07RecoveryJobId, 91618448152);
  assert.equal(manifest.exactAcceptance.currentSurfaceGlmS07RecoveryConclusion, "success");
  assert.equal(manifest.exactAcceptance.currentSurfaceGlmS07AggregateConclusion, "success");

  assert.equal(manifest.exactAcceptance.acceptancePrNumber, 524);
  assert.equal(manifest.exactAcceptance.acceptanceWorkflowRunId, 30793658443);
  assert.equal(manifest.exactAcceptance.acceptanceArtifactId, 8848015560);
  assert.equal(manifest.exactAcceptance.acceptanceArtifactDigest, "sha256:593412ae73ab6b21258293be93ad3908540c7406c4dbacd85e78da758352d15f");
  assert.equal(manifest.exactAcceptance.acceptancePdfPageCount, 4);
  assert.equal(manifest.exactAcceptance.acceptanceQuestionCount, 18);
  assert.equal(manifest.exactAcceptance.acceptanceAnswerKeyCount, 18);
  assert.equal(manifest.exactAcceptance.acceptanceOverflowFindingCount, 0);
  assert.equal(manifest.exactAcceptance.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(manifest.exactAcceptance.acceptanceVisualReview, "PASS");
  assert.equal(manifest.exactAcceptance.acceptanceSemanticReview, "PASS");
  assert.equal(manifest.exactAcceptance.acceptanceAnswerKeyReview, "PASS");
  assert.equal(manifest.exactAcceptance.temporaryAcceptanceWorkflowRetired, true);

  assert.equal(manifest.exactAcceptance.pixelRepairPrNumber, 525);
  assert.equal(manifest.exactAcceptance.pixelRepairMergeSha, "9d10f8bd07c8eddc93806242811d3e1c19c902c8");
  assert.equal(manifest.exactAcceptance.pixelRepairNodeConclusion, "success");
  assert.equal(manifest.exactAcceptance.finalNodeWorkflowConclusion, "success");

  assert.equal(manifest.exactAcceptance.closeoutPrNumber, 526);
  assert.equal(manifest.exactAcceptance.closeoutHeadSha, "dce2d5a28ccaab6b2f1ee49c30cc3bffe3e7b17b");
  assert.equal(manifest.exactAcceptance.closeoutNodeWorkflowRunId, 30795972050);
  assert.equal(manifest.exactAcceptance.closeoutNodeWorkflowJobId, 91629520667);
  assert.equal(manifest.exactAcceptance.closeoutNodeConclusion, "success");
  assert.equal(manifest.exactAcceptance.closeoutMergeSha, "b5419c77f10eb0a3422f1f51dcdeaad7abc722d3");

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.nextTask, "P03F_W3DirectProductVerticalSlice019Implementation");
  assert.equal(manifest.mainlineBoundary.decimalCompareAdded, false);
  assert.equal(manifest.mainlineBoundary.decimalSequenceAdded, false);
  assert.equal(manifest.mainlineBoundary.missingDigitReasoningAdded, false);
  assert.equal(manifest.mainlineBoundary.decimalArithmeticAdded, false);

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.closeoutEvidence.prNumber, 526);
  assert.equal(claim.closeoutEvidence.headSha, "dce2d5a28ccaab6b2f1ee49c30cc3bffe3e7b17b");
  assert.equal(claim.closeoutEvidence.nodeWorkflowRunId, 30795972050);
  assert.equal(claim.closeoutEvidence.nodeWorkflowJobId, 91629520667);
  assert.equal(claim.closeoutEvidence.nodeConclusion, "success");
  assert.equal(claim.closeoutEvidence.mergeSha, "b5419c77f10eb0a3422f1f51dcdeaad7abc722d3");
  assert.equal(claim.closeoutEvidence.mainReadback, "PASS");
  assert.equal(claim.productResult.classicPublicSurface, "PASS");
  assert.equal(claim.productResult.pixelPublicSurface, "PASS");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice019Started, false);
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice019Implementation");
});
