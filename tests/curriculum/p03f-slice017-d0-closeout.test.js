import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice017-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice017-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F17 D0 closeout binds exact E6 evidence and preserves Slice018 boundary", () => {
  assert.equal(manifest.status, "PASS_D0_CLOSEOUT_CANDIDATE");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.expectedCounts.queuePosition, 17);
  assert.equal(manifest.expectedCounts.knowledgePointCount, 1);
  assert.equal(manifest.expectedCounts.patternGroupCount, 1);
  assert.equal(manifest.expectedCounts.patternSpecCount, 3);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 18);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 18);
  assert.equal(manifest.exactAcceptance.implementationPrNumber, 518);
  assert.equal(manifest.exactAcceptance.implementationMergeSha, "27a11f571819eabca4f9344c2e937e304fcceba9");
  assert.equal(manifest.exactAcceptance.acceptanceWorkflowRunId, 30777237958);
  assert.equal(manifest.exactAcceptance.acceptanceArtifactId, 8842440677);
  assert.equal(manifest.exactAcceptance.acceptanceArtifactDigest, "sha256:35f2826dccb35762210a3c52980edadb74e31eedca788a628710d84b686a7d6c");
  assert.equal(manifest.exactAcceptance.acceptanceVisualReview, "PASS");
  assert.equal(manifest.exactAcceptance.acceptanceSemanticReview, "PASS");
  assert.equal(manifest.exactAcceptance.acceptanceAnswerKeyReview, "PASS");
  assert.equal(manifest.exactAcceptance.temporaryAcceptanceWorkflowRetired, true);
  assert.equal(manifest.exactAcceptance.finalNodeWorkflowConclusion, "success");
  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.nextTask, "P03F_W3DirectProductVerticalSlice018Implementation");
  assert.equal(claim.status, "PASS_D0_CLOSEOUT_CANDIDATE");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice018Started, false);
});
