import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U06_P03F40_GROUP_ID,
  G5B_U06_P03F40_KP_ID,
  G5B_U06_P03F40_SOURCE_ID,
  G5B_U06_P03F40_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5b-u06-rank9-integer-division-decimal-quotient-selector-projection-p03f40.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice040-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice040-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F40 D0 authority binds exact q040 product scope", () => {
  assert.equal(claim.authority.queuePosition, 40);
  assert.equal(claim.authority.queueEntryId, "p03e_q040_r9_g5b_u06_5b06_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5B_U06_P03F40_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5B_U06_P03F40_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5B_U06_P03F40_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5B_U06_P03F40_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 238, 1, 4, 4]);
});

test("P03F40 implementation and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 609);
  assert.equal(claim.implementationEvidence.headSha, "0868bbaed1820c661857776f4f4a9981f043941d");
  assert.equal(claim.implementationEvidence.mergeSha, "74690ae4aa57082c4e0295e7ed62ce5baf89c437");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3182, 3182, 0, 0]);
  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.patternSpecCount, product.patternSpecWitnessCount], [24, 24, 1, 24]);
  assert.deepEqual([product.belowOneWitnessCount, product.aboveOneWitnessCount], [12, 12]);
  assert.deepEqual([product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount, product.screenshotCount], [3, 3, 6, 6]);
  assert.deepEqual([
    product.crossLayerMismatchCount,
    product.exactAnswerMismatchCount,
    product.semanticScopeFindingCount,
    product.applicationLeakFindingCount,
    product.decimalDividendFindingCount,
    product.integerQuotientFindingCount,
    product.duplicatePromptFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.sharedP03F32ExactRationalNormalizer, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F40 final-head Main/Pages E2E binds deployed product behavior", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 611);
  assert.equal(e2e.headSha, "a599a72315adfc040d385f311e721ecf3c834132");
  assert.equal(e2e.mergeSha, "60cfc3f41fadc4f1e41db46398640d934282a537");
  assert.equal(e2e.status, "PASS_P03F40_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual([e2e.belowOneWitnessCount, e2e.aboveOneWitnessCount], [12, 12]);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.semanticScopeFindingCount, e2e.duplicatePromptCount, e2e.internalIdLeakageCount], [0, 0, 0, 0]);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedP03F32ExactRationalNormalizer, true);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.patternGroupSelectionMode, "auto-applied-by-kp");
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.decimalDividendExpansion, false);
  assert.equal(e2e.estimationExpansion, false);
  assert.equal(e2e.zeroPlaceholderExpansion, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice041Started, false);
});

test("P03F40 current Pixel authority is exactly 33 sources / 238 visible KPs", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 238);
  assert.equal(pixel.bySourceId[G5B_U06_P03F40_SOURCE_ID].visibleKnowledgePoints.length, 1);
  assert.equal(pixel.bySourceId[G5B_U06_P03F40_SOURCE_ID].hiddenPendingCount, 4);
  assert.equal(pixel.bySourceId[G5B_U06_P03F40_SOURCE_ID].notSelectableCount, 4);
});

test("P03F40 closeout state machine never releases Slice041 before final D0", () => {
  assert.deepEqual([
    manifest.currentAuthority.publicSources,
    manifest.currentAuthority.visibleKnowledgePoints,
    manifest.currentAuthority.sourceVisibleKnowledgePoints,
    manifest.currentAuthority.sourceHiddenKnowledgePoints,
    manifest.currentAuthority.sourceNotSelectableKnowledgePoints,
    manifest.currentAuthority.gaps,
  ], [33, 238, 1, 4, 4, 0]);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);

  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice040Admitted, false);
    assert.equal(manifest.productionAdmission.slice041MayStart, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice040_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice040_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([
    claim.canonical793Evidence.executedRouteCount,
    claim.canonical793Evidence.terminalRouteCount,
    claim.canonical793Evidence.passRouteCount,
    claim.canonical793Evidence.failRouteCount,
  ], [793, 793, 793, 0]);
  assert.equal(manifest.productionAdmission.slice040Admitted, true);
  assert.equal(manifest.productionAdmission.slice041MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice041Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice041Implementation");
});

test("P03F40 canonical R00 replay trigger is committed while historical route authority stays canonical", () => {
  assert.match(r00Test, /P03F40 D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
