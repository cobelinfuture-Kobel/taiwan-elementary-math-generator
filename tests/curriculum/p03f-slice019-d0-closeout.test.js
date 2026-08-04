import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice019-product-admission.manifest.json", import.meta.url), "utf8"));
const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice019-e6-d0-v1.json", import.meta.url), "utf8"));

test("P03F19 D0 closeout binds exact implementation, Chromium, main and deployed evidence while preserving Slice020 boundary", () => {
  assert.equal(manifest.status, "PASS_D0_CLOSEOUT_CANDIDATE");
  assert.equal(manifest.admissionState, "E6_ARTIFACT_ACCEPTED_D0");
  assert.equal(manifest.admissionDecision.status, "ADMITTED_D0");
  assert.equal(manifest.expectedCounts.queuePosition, 19);
  assert.equal(manifest.expectedCounts.newPublicSourceCount, 0);
  assert.equal(manifest.expectedCounts.knowledgePointCount, 2);
  assert.equal(manifest.expectedCounts.patternGroupCount, 4);
  assert.equal(manifest.expectedCounts.patternSpecCount, 6);
  assert.equal(manifest.expectedCounts.numericPatternSpecCount, 3);
  assert.equal(manifest.expectedCounts.applicationPatternSpecCount, 3);
  assert.equal(manifest.expectedCounts.globalContextBindingCount, 3);
  assert.equal(manifest.expectedCounts.requiredCapabilityCount, 3);
  assert.equal(manifest.expectedCounts.publicVisibleKnowledgePointCountForSource, 3);
  assert.equal(manifest.expectedCounts.questionWitnessCount, 80);
  assert.equal(manifest.expectedCounts.answerKeyWitnessCount, 80);

  assert.equal(manifest.exactAcceptance.implementationPrNumber, 534);
  assert.equal(manifest.exactAcceptance.implementationHeadSha, "b1512f0ace37e3e15ca725f440e859381a4da6be");
  assert.equal(manifest.exactAcceptance.implementationMergeSha, "400f60a39eb614079073d594d30faf2cd56a3f76");
  assert.equal(manifest.exactAcceptance.implementationNodeWorkflowRunId, 30864843856);
  assert.equal(manifest.exactAcceptance.implementationNodeWorkflowJobId, 91854342539);
  assert.equal(manifest.exactAcceptance.implementationNodeConclusion, "success");
  assert.equal(manifest.exactAcceptance.implementationFullRegressionTests, 2883);
  assert.equal(manifest.exactAcceptance.implementationFullRegressionPass, 2883);
  assert.equal(manifest.exactAcceptance.implementationFullRegressionFail, 0);

  assert.equal(manifest.exactAcceptance.acceptanceArtifactId, 8875763563);
  assert.equal(manifest.exactAcceptance.acceptanceArtifactDigest, "sha256:6d0f4d08f9eebd2ca754a39c9f56064a2c7badc5780b5f76c3873fc454e3ac60");
  assert.equal(manifest.exactAcceptance.acceptanceCaseCount, 4);
  assert.equal(manifest.exactAcceptance.acceptancePdfPageCount, 20);
  assert.equal(manifest.exactAcceptance.acceptancePdfByteLength, 273884);
  assert.equal(manifest.exactAcceptance.acceptanceScreenshotCount, 20);
  assert.equal(manifest.exactAcceptance.acceptanceQuestionCount, 80);
  assert.equal(manifest.exactAcceptance.acceptanceAnswerKeyCount, 80);
  assert.equal(Object.keys(manifest.exactAcceptance.acceptancePatternSpecWitnessCounts).length, 6);
  assert.deepEqual(Object.values(manifest.exactAcceptance.acceptancePatternSpecWitnessCounts).sort((a, b) => a - b), [10, 10, 10, 10, 20, 20]);
  assert.equal(manifest.exactAcceptance.acceptanceOverflowFindingCount, 0);
  assert.equal(manifest.exactAcceptance.acceptanceSemanticScopeFindingCount, 0);
  assert.equal(manifest.exactAcceptance.acceptanceVisualReview, "PASS");
  assert.equal(manifest.exactAcceptance.acceptanceSemanticReview, "PASS");
  assert.equal(manifest.exactAcceptance.acceptanceAnswerKeyReview, "PASS");
  assert.equal(manifest.exactAcceptance.separatePerSliceWorkflowAdded, false);

  assert.equal(manifest.exactAcceptance.mainNodeWorkflowRunId, 30865129414);
  assert.equal(manifest.exactAcceptance.mainNodeConclusion, "success");
  assert.equal(manifest.exactAcceptance.mainCiReadbackWorkflowRunId, 30865129411);
  assert.equal(manifest.exactAcceptance.mainCiReadback, "PASS_CI_SYNCED_AND_CLEAN");
  assert.equal(manifest.exactAcceptance.pagesDeploymentWorkflowRunId, 30865129429);
  assert.equal(manifest.exactAcceptance.pagesDeploymentConclusion, "success");
  assert.equal(manifest.exactAcceptance.deployedSiteHttpStatus, 200);
  assert.equal(manifest.exactAcceptance.deployedContentMatchesMergeSha, true);

  assert.equal(manifest.mainlineBoundary.nextQueuePositionStarted, false);
  assert.equal(manifest.mainlineBoundary.nextTask, "P03F_W3DirectProductVerticalSlice020Implementation");
  assert.equal(manifest.mainlineBoundary.applicationContextCandidateAdded, false);
  assert.equal(manifest.mainlineBoundary.globalContextExpanded, false);
  assert.equal(manifest.mainlineBoundary.parallelRuntimePipelineAdded, false);

  assert.equal(claim.status, "PASS_D0_CLOSEOUT_CANDIDATE");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.productResult.classicPublicSurface, "PASS");
  assert.equal(claim.productResult.pixelPublicSurface, "PASS");
  assert.equal(claim.productResult.d0Complete, true);
  assert.equal(claim.boundaries.slice020Started, false);
  assert.equal(claim.nextResumeTask, "P03F_W3DirectProductVerticalSlice020Implementation");
});
