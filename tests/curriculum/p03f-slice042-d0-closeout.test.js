import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G4B_U06_P03F42_GROUP_ID,
  G4B_U06_P03F42_KP_ID,
  G4B_U06_P03F42_SOURCE_ID,
  G4B_U06_P03F42_SPEC_ID,
  P03F42_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g4b-u06-rank10-decimal-number-line-selector-projection-p03f42.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice042-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice042-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F42 D0 authority binds exact q042 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g4b-u06-rank10-decimal-number-line-selector-projection-p03f42.js");
  assert.equal(claim.authority.queuePosition, 42);
  assert.equal(claim.authority.queueEntryId, "p03e_q042_r10_g4b_u06_4b06_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G4B_U06_P03F42_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G4B_U06_P03F42_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G4B_U06_P03F42_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G4B_U06_P03F42_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F42_REQUIRED_CAPABILITY_IDS]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 240, 5, 1, 0]);
});

test("P03F42 exact implementation/product evidence is gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 619);
  assert.equal(claim.implementationEvidence.headSha, "e7b8808df6c1d7982bd1327211cc25cdadf7701b");
  assert.equal(claim.implementationEvidence.mergeSha, "f7ccdde3a661aa131445884ea25c7dea87e7539e");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3213, 3213, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount], [24, 24, 3, 3, 6]);
  assert.deepEqual([product.representationCount, product.numberLineSvgCount, product.pointMarkerCount], [48, 48, 96]);
  assert.deepEqual([product.step01WitnessCount, product.step02WitnessCount, product.rightwardWitnessCount, product.leftwardWitnessCount], [12, 12, 11, 13]);
  assert.deepEqual([
    product.representationOverflowFindingCount,
    product.crossLayerMismatchCount,
    product.exactAnswerMismatchCount,
    product.sourceSubdivisionFindingCount,
    product.semanticScopeFindingCount,
    product.applicationLeakFindingCount,
    product.arithmeticLeakFindingCount,
    product.hiddenSiblingLeakFindingCount,
    product.duplicateProblemFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.sharedNumberLineRendererAdapter, true);
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
  assert.equal(product.manualVisualReview.numberLinePointsTicksAndDecimalAnswersLegible, true);
});

test("P03F42 post-merge Pages E2E binds the deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 620);
  assert.equal(e2e.headSha, "a39afe392c03d757a9737f54082e1901a8531b9d");
  assert.equal(e2e.mergeSha, "75252ac380d9c329170ffb7a9642908b46fda405");
  assert.equal(e2e.status, "PASS_P03F42_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual([e2e.representationCount, e2e.numberLineSvgCount, e2e.pointMarkerCount], [48, 48, 96]);
  assert.deepEqual([e2e.step01WitnessCount, e2e.step02WitnessCount, e2e.rightwardWitnessCount, e2e.leftwardWitnessCount], [12, 12, 11, 13]);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.semanticScopeFindingCount, e2e.duplicatePromptCount, e2e.internalIdLeakageCount], [0, 0, 0, 0]);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedNumberLineRendererAdapter, true);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.arithmeticExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice043Started, false);
});

test("P03F42 current Pixel authority reconciles the full q042 two-KP allocation", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.ok(pixel.sourceCount >= 33);
  assert.ok(pixel.visibleKnowledgePointCount >= 241);
  assert.equal(pixel.bySourceId[G4B_U06_P03F42_SOURCE_ID].visibleKnowledgePoints.length, 6);
  assert.equal(pixel.bySourceId[G4B_U06_P03F42_SOURCE_ID].hiddenPendingCount, 0);
  assert.equal(pixel.bySourceId[G4B_U06_P03F42_SOURCE_ID].notSelectableCount, 0);
});

test("P03F42 final product admission is D0 and releases only Slice043", () => {
  assert.equal(manifest.queuePosition, 42);
  assert.equal(manifest.sourceId, G4B_U06_P03F42_SOURCE_ID);
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.goalDistance, "D0");
  assert.deepEqual([
    manifest.currentAuthority.publicSourcesAtAdmission,
    manifest.currentAuthority.visibleKnowledgePointsAtAdmission,
    manifest.currentAuthority.sourceVisibleKnowledgePoints,
    manifest.currentAuthority.sourceHiddenKnowledgePoints,
    manifest.currentAuthority.sourceNotSelectableKnowledgePoints,
    manifest.currentAuthority.gaps,
  ], [33, 240, 5, 1, 0, 0]);
  assert.equal(manifest.productionAdmission.slice042Admitted, true);
  assert.equal(manifest.productionAdmission.slice043MayStart, true);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice043Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice043Implementation");

  const node = claim.closeoutEvidence.candidateNode;
  assert.deepEqual([node.runId, node.jobId, node.tests, node.pass, node.fail, node.skipped], [31985254709, 95259042682, 3219, 3219, 0, 0]);
  assert.equal(node.artifactId, 9273607579);
  assert.match(node.artifactDigest, /^sha256:[0-9a-f]{64}$/);

  const replay = claim.canonical793Evidence;
  assert.equal(replay.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([replay.runId, replay.jobId, replay.artifactId], [31985254744, 95307677670, 9279596956]);
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

test("P03F42 canonical R00 replay trigger stays on the frozen 793-route authority", () => {
  assert.match(r00Test, /P03F42 D0 closeout replay trigger/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
