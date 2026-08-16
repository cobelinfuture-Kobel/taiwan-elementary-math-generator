import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G6B_U01_P03F41_GROUP_ID,
  G6B_U01_P03F41_KP_ID,
  G6B_U01_P03F41_SOURCE_ID,
  G6B_U01_P03F41_SPEC_ID,
  P03F41_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice041-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice041-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F41 D0 authority binds exact q041 scope", () => {
  assert.equal(claim.authority.queuePosition, 41);
  assert.equal(claim.authority.queueEntryId, "p03e_q041_r9_g6b_u01_6b01_profile_mixed_number_domain_c1");
  assert.equal(claim.authority.sourceRef, G6B_U01_P03F41_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G6B_U01_P03F41_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G6B_U01_P03F41_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G6B_U01_P03F41_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F41_REQUIRED_CAPABILITY_IDS]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 239, 2, 3, 3]);
});

test("P03F41 exact implementation/product evidence is gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 614);
  assert.equal(claim.implementationEvidence.headSha, "855dc228e14a846744f2db4aa9f68b8cbd6b6b70");
  assert.equal(claim.implementationEvidence.mergeSha, "109c55de6ff7a7d182c3e41f2e76072dc95ce614");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3198, 3198, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount], [24, 24, 3, 3, 6]);
  assert.deepEqual(Object.values(product.relationWitnessCounts), [8, 8, 8]);
  assert.deepEqual(Object.values(product.orientationWitnessCounts), [12, 12]);
  assert.deepEqual([
    product.crossLayerMismatchCount,
    product.exactAnswerMismatchCount,
    product.semanticScopeFindingCount,
    product.applicationLeakFindingCount,
    product.arithmeticLeakFindingCount,
    product.slice047LeakFindingCount,
    product.duplicatePromptFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.sharedP03F32MixedDomainNormalizer, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.deepEqual([
    product.manualVisualReview.clippedTextFindingCount,
    product.manualVisualReview.overlapFindingCount,
    product.manualVisualReview.brokenGlyphFindingCount,
  ], [0, 0, 0]);
  assert.equal(product.manualVisualReview.questionAnswerAlignmentVisible, true);
  assert.equal(product.manualVisualReview.twoColumnEightQuestionsPerPageConsistent, true);
  assert.equal(product.manualVisualReview.mixedDomainOperandsAndRelationAnswersLegible, true);
});

test("P03F41 post-merge Pages E2E binds the deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 615);
  assert.equal(e2e.headSha, "2e03243ae3cefc4047c94b0863a0b7c9f29b70e4");
  assert.equal(e2e.mergeSha, "69f838118ef25f1273e4fe5b7d0b503d1e519995");
  assert.equal(e2e.status, "PASS_P03F41_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [6, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual(Object.values(e2e.relationWitnessCounts), [8, 8, 8]);
  assert.deepEqual(Object.values(e2e.orientationWitnessCounts), [12, 12]);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.semanticScopeFindingCount, e2e.duplicatePromptCount, e2e.internalIdLeakageCount], [0, 0, 0, 0]);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedP03F32ExactRationalNormalizer, true);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.arithmeticExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice042Started, false);
});

test("P03F41 current Pixel authority preserves q041 admission", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.ok(pixel.sourceCount >= 33);
  assert.ok(pixel.visibleKnowledgePointCount >= 239);
  assert.equal(pixel.bySourceId[G6B_U01_P03F41_SOURCE_ID].visibleKnowledgePoints.length, 2);
  assert.equal(pixel.bySourceId[G6B_U01_P03F41_SOURCE_ID].hiddenPendingCount, 3);
  assert.equal(pixel.bySourceId[G6B_U01_P03F41_SOURCE_ID].notSelectableCount, 3);
});

test("P03F41 candidate is fail-closed and final D0 releases only Slice042", () => {
  assert.equal(manifest.queuePosition, 41);
  assert.equal(manifest.sourceId, G6B_U01_P03F41_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.goalDistance, "D1");
    assert.equal(manifest.productionAdmission.slice041Admitted, false);
    assert.equal(manifest.productionAdmission.slice042MayStart, false);
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(claim.closeoutEvidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.goalDistance, "D0");
  assert.equal(manifest.productionAdmission.slice041Admitted, true);
  assert.equal(manifest.productionAdmission.slice042MayStart, true);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice042Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice042Implementation");

  const node = claim.closeoutEvidence.candidateNode;
  assert.ok(node.tests >= 3198);
  assert.equal(node.tests, node.pass);
  assert.equal(node.fail, 0);
  assert.equal(node.skipped, 0);
  assert.match(node.artifactDigest, /^sha256:[0-9a-f]{64}$/);

  const replay = claim.canonical793Evidence;
  assert.equal(replay.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([replay.legalRouteCount, replay.executedRouteCount, replay.terminalRouteCount, replay.passRouteCount, replay.failRouteCount, replay.fullNineGatePassCount], [793, 793, 793, 793, 0, 793]);
  assert.deepEqual([replay.shardCount, replay.sampleHtmlCount, replay.samplePdfCount], [16, 16, 16]);
  assert.deepEqual([replay.finalCheckpointExecutedRouteCount, replay.finalCheckpointAuthoritative], [793, true]);
  assert.deepEqual([replay.browserConsoleErrorCount, replay.browserPageErrorCount, replay.exitCode], [0, 0, 0]);
  assert.equal(replay.productMutationUsed, false);
  assert.equal(replay.capacityAuthorityMutationUsed, false);
  assert.equal(replay.perRoutePatchUsed, false);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
  assert.equal(manifest.canonical793Evidence.artifactId, replay.artifactId);
});

test("P03F41 canonical R00 replay trigger stays on the frozen 793-route authority", () => {
  assert.match(r00Test, /P03F41 D0 closeout replay trigger/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
