import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U04_P03F45_SOURCE_ID,
  G5B_U04_P03F45_KP_ID,
  G5B_U04_P03F45_GROUP_ID,
  G5B_U04_P03F45_SPEC_ID,
  P03F45_REQUIRED_CAPABILITY_IDS,
  P03F45_FUTURE_Q049_KP_IDS,
} from "../../site/modules/curriculum/registry/g5b-u04-rank10-decimal-times-decimal-selector-projection-p03f45.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice045-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice045-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F45 D0 authority binds exact frozen q045 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g5b-u04-rank10-decimal-times-decimal-selector-projection-p03f45.js");
  assert.equal(claim.authority.queuePosition, 45);
  assert.equal(claim.authority.queueEntryId, "p03e_q045_r10_g5b_u04_5b04_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5B_U04_P03F45_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5B_U04_P03F45_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5B_U04_P03F45_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5B_U04_P03F45_SPEC_ID]);
  assert.deepEqual(claim.authority.futureQ049KnowledgePointIds, [...P03F45_FUTURE_Q049_KP_IDS]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F45_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.decimalArithmeticRequired, true);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 246, 3, 0, 0]);
});

test("P03F45 exact final-head implementation and product evidence is gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 636);
  assert.equal(claim.implementationEvidence.headSha, "07ec2d5c2706ec75d907382239b5106a473a151e");
  assert.equal(claim.implementationEvidence.mergeSha, "a02c44b5bca2cd1afc122a195d79b2f143d10968");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "90900b8cd14c0ba4c15b9e60d00777d8721df2e0");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3265, 3265, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([
    product.questionCount,
    product.answerKeyItemCount,
    product.questionPageCount,
    product.answerPageCount,
    product.physicalPdfPageCount,
    product.patternSpecCount,
  ], [24, 24, 3, 3, 6, 1]);
  assert.deepEqual(product.scalePairWitnesses, ["1x1", "2x1", "2x2", "4x3"]);
  assert.deepEqual(product.sourceWitnesses, { oneByOne: true, twoByOne: true, twoByTwoTrailingZero: true });
  assert.ok(product.trailingZeroCanonicalizationWitnessCount >= 1);
  assert.deepEqual([
    product.crossLayerMismatchCount,
    product.exactAnswerMismatchCount,
    product.semanticScopeFindingCount,
    product.capabilityMismatchFindingCount,
    product.q049LeakFindingCount,
    product.duplicatePromptFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(9).fill(0));
  assert.equal(product.sharedDecimalArithmetic, true);
  assert.equal(product.sharedDecimalNumberSystem, true);
  assert.equal(product.sharedDecimalDomainValidator, true);
  assert.equal(product.sharedNumericRendererAdapter, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.applicationExpansion, false);
  assert.equal(product.estimationExpansion, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.q049ApplicationExpansion, false);
  assert.equal(product.q049EstimationExpansion, false);
  assert.equal(product.slice046Expansion, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.equal(product.manualVisualReview.exactHeadReviewed, true);
  assert.deepEqual([
    product.manualVisualReview.clippedTextFindingCount,
    product.manualVisualReview.overlapFindingCount,
    product.manualVisualReview.brokenGlyphFindingCount,
  ], [0, 0, 0]);
});

test("P03F45 post-merge Pages E2E binds exact deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 637);
  assert.equal(e2e.headSha, "8be2c35d952a130beaf2ac8a32763b0e6d587ba4");
  assert.equal(e2e.mergeSha, "a686b962863f4aa008f452d1b11ee545a300f6c1");
  assert.equal(e2e.status, "PASS_P03F45_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationMergeSha, "a02c44b5bca2cd1afc122a195d79b2f143d10968");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [33, 246]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [3, 0, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual(e2e.scalePairWitnesses, ["1x1", "2x1", "2x2", "4x3"]);
  assert.deepEqual(e2e.sourceWitnesses, { oneByOne: true, twoByOne: true, twoByTwoTrailingZero: true });
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.unexpectedPatternCount,
    e2e.duplicateProblemCount,
    e2e.questionAnswerIdMismatchCount,
    e2e.internalIdLeakageCount,
    e2e.overflowFindingCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(10).fill(0));
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.sharedPagination, true);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.estimationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.q049ApplicationExpansion, false);
  assert.equal(e2e.q049EstimationExpansion, false);
  assert.equal(e2e.slice046Expansion, false);
});

test("P03F45 current Pixel authority advances through Slice050 to 33/254 while G5B-U04 remains 5/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 254);
  const source = pixel.bySourceId[G5B_U04_P03F45_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 5);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G5B_U04_P03F45_KP_ID));
  for (const kpId of P03F45_FUTURE_Q049_KP_IDS) {
    assert.equal(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === kpId), true);
  }
});

test("P03F45 candidate is fail-closed and final D0 releases only Slice046", () => {
  assert.equal(manifest.queuePosition, 45);
  assert.equal(manifest.sourceId, G5B_U04_P03F45_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.goalDistance, "D1");
    assert.equal(manifest.productionAdmission.slice045Admitted, false);
    assert.equal(manifest.productionAdmission.slice046MayStart, false);
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(claim.closeoutEvidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice045_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.goalDistance, "D0");
  assert.equal(manifest.productionAdmission.slice045Admitted, true);
  assert.equal(manifest.productionAdmission.slice046MayStart, true);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice046Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice046Implementation");

  const node = claim.closeoutEvidence.candidateNode;
  assert.ok(node.tests >= 3265);
  assert.equal(node.tests, node.pass);
  assert.equal(node.fail, 0);
  assert.equal(node.skipped, 0);
  assert.match(node.artifactDigest, /^sha256:[0-9a-f]{64}$/);

  const replay = claim.canonical793Evidence;
  assert.equal(replay.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([
    replay.legalRouteCount,
    replay.executedRouteCount,
    replay.terminalRouteCount,
    replay.passRouteCount,
    replay.failRouteCount,
    replay.fullNineGatePassCount,
  ], [793, 793, 793, 793, 0, 793]);
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

test("P03F45 canonical R00 replay trigger stays on frozen 793-route authority", () => {
  assert.match(r00Test, /P03F45 D0 closeout replay trigger/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});