import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G4B_U08_P03F43_SOURCE_ID,
  P03F43_GROUP_IDS,
  P03F43_HIDDEN_APPLICATION_SPEC_IDS,
  P03F43_KP_IDS,
  P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS,
  P03F43_SPEC_IDS,
  P03F43_W3_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice043-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice043-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");
const requiredCapabilityUnion = [...new Set([...P03F43_W3_CAPABILITY_IDS, ...P03F43_NUMBER_LINE_REQUIRED_CAPABILITY_IDS])];

test("P03F43 D0 authority binds exact q043 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js");
  assert.equal(claim.authority.queuePosition, 43);
  assert.equal(claim.authority.queueEntryId, "p03e_q043_r10_g4b_u08_4b08_profile_fraction_c1");
  assert.equal(claim.authority.sourceRef, G4B_U08_P03F43_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [...P03F43_KP_IDS]);
  assert.deepEqual(claim.authority.patternGroupIds, [...P03F43_GROUP_IDS]);
  assert.deepEqual(claim.authority.patternSpecIds, [...P03F43_SPEC_IDS]);
  assert.deepEqual(claim.authority.hiddenApplicationPatternSpecIds, [...P03F43_HIDDEN_APPLICATION_SPEC_IDS]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, requiredCapabilityUnion);
  assert.equal(claim.authority.fractionArithmeticRequired, false);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 243, 7, 0, 0]);
});

test("P03F43 exact implementation/product evidence is gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 627);
  assert.equal(claim.implementationEvidence.headSha, "f1a7246a19c2febd14aaf312d9188f32b4c56793");
  assert.equal(claim.implementationEvidence.mergeSha, "7fe42337ccfac8d5489525ef02f5605af37a5a16");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3234, 3234, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount], [24, 24, 3, 3, 6]);
  assert.deepEqual([product.coordinateQuestionCount, product.distanceQuestionCount, product.boundsQuestionCount], [8, 8, 8]);
  assert.equal(product.patternSpecCount, 3);
  assert.equal(product.representationCount, 32);
  assert.deepEqual([
    product.representationOverflowFindingCount,
    product.crossLayerMismatchCount,
    product.coordinateAnswerMismatchCount,
    product.distanceAnswerMismatchCount,
    product.boundsAnswerMismatchCount,
    product.applicationLeakFindingCount,
    product.arithmeticLeakFindingCount,
    product.duplicateProblemFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.applicationExpansion, false);
  assert.equal(product.fractionArithmeticExpansion, false);
  assert.equal(product.slice044Expansion, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.deepEqual([
    product.manualVisualReview.clippedTextFindingCount,
    product.manualVisualReview.overlapFindingCount,
    product.manualVisualReview.brokenGlyphFindingCount,
  ], [0, 0, 0]);
  assert.equal(product.manualVisualReview.questionAnswerAlignmentVisible, true);
  assert.equal(product.manualVisualReview.twoColumnEightQuestionsPerPageConsistent, true);
  assert.equal(product.manualVisualReview.fractionNumberLinesAndAnswersLegible, true);
});

test("P03F43 post-merge Pages E2E binds the deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 628);
  assert.equal(e2e.headSha, "138a8eb14f4143b819ce45c8f34958afc88546d0");
  assert.equal(e2e.mergeSha, "5be183b60bdb2c5e3ad8942b5cc5a1d716ce50f5");
  assert.equal(e2e.status, "PASS_P03F43_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [9, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual([e2e.coordinateWitnessCount, e2e.distanceWitnessCount, e2e.boundsWitnessCount], [8, 8, 8]);
  assert.deepEqual([e2e.representationCount, e2e.numberLineSvgCount, e2e.pointMarkerCount], [32, 32, 48]);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.representationMismatchCount, e2e.unexpectedPatternCount, e2e.duplicateProblemCount, e2e.internalIdLeakageCount], [0, 0, 0, 0, 0]);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.fractionArithmeticExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice044Started, false);
});

test("P03F43 current Pixel authority preserves full q043 admission", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.ok(pixel.sourceCount >= 33);
  assert.ok(pixel.visibleKnowledgePointCount >= 243);
  assert.equal(pixel.bySourceId[G4B_U08_P03F43_SOURCE_ID].visibleKnowledgePoints.length, 7);
  assert.equal(pixel.bySourceId[G4B_U08_P03F43_SOURCE_ID].hiddenPendingCount, 0);
  assert.equal(pixel.bySourceId[G4B_U08_P03F43_SOURCE_ID].notSelectableCount, 0);
});

test("P03F43 candidate is fail-closed and final D0 releases only Slice044", () => {
  assert.equal(manifest.queuePosition, 43);
  assert.equal(manifest.sourceId, G4B_U08_P03F43_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.goalDistance, "D1");
    assert.equal(manifest.productionAdmission.slice043Admitted, false);
    assert.equal(manifest.productionAdmission.slice044MayStart, false);
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
  assert.equal(manifest.productionAdmission.slice043Admitted, true);
  assert.equal(manifest.productionAdmission.slice044MayStart, true);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice044Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice044Implementation");

  const node = claim.closeoutEvidence.candidateNode;
  assert.ok(node.tests >= 3234);
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

test("P03F43 canonical R00 replay trigger stays on the frozen 793-route authority", () => {
  assert.match(r00Test, /P03F43 D0 closeout replay trigger/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
