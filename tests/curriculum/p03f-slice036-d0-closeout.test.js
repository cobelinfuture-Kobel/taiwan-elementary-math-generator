import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f36-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice036-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice036-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");
const sourceId = "g5a_u01_5a01";

test("P03F36 D0 authority binds exact implementation and post-merge Main/Pages E2E evidence", () => {
  assert.equal(claim.authority.queuePosition, 36);
  assert.equal(claim.authority.sourceRef, sourceId);
  assert.equal(claim.authority.knowledgePointIds.length, 3);
  assert.equal(claim.authority.patternGroupIds.length, 3);
  assert.equal(claim.authority.patternSpecIds.length, 4);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [
    "cap_decimal_arithmetic",
    "cap_decimal_domain_validator",
    "cap_decimal_number_system",
  ]);
  assert.equal(claim.implementationEvidence.prNumber, 593);
  assert.equal(claim.implementationEvidence.headSha, "cf680cfcad312dcf51a1f80a127ae7ea7579420a");
  assert.equal(claim.implementationEvidence.mergeSha, "ccf0a9e6cd1f00a0b8fa3fc43739f9145add8c8b");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3115, 3115, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.questionCount, 24);
  assert.equal(product.answerKeyItemCount, 24);
  assert.equal(product.patternSpecCount, 4);
  assert.deepEqual(Object.values(product.knowledgePointWitnessCounts), [6, 6, 12]);
  assert.deepEqual([product.addWitnessCount, product.subWitnessCount], [3, 3]);
  assert.equal(product.physicalPdfPageCount, 6);
  assert.equal(product.crossLayerMismatchCount, 0);
  assert.equal(product.duplicatePromptFindingCount, 0);
  assert.equal(product.overflowFindingCount, 0);
  assert.equal(product.consoleErrorCount, 0);
  assert.equal(product.pageErrorCount, 0);
  assert.equal(product.semanticScopeFindingCount, 0);
  assert.equal(product.applicationLeakFindingCount, 0);
  assert.equal(product.globalContextLeakFindingCount, 0);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);

  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 594);
  assert.equal(e2e.headSha, "5107ac06b69e4b0edc42adeb101a9ec3e0d4ac7a");
  assert.equal(e2e.mergeSha, "50fe8c3c5cddfb54e6934dde09ccfc45c7450125");
  assert.equal(e2e.status, "PASS_P03F36_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual(Object.values(e2e.familyCounts), [6, 6, 6, 6]);
  assert.deepEqual([e2e.operationCounts.add, e2e.operationCounts.sub], [3, 3]);
  assert.equal(e2e.exactAnswerMismatchCount, 0);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.patternGroupSelectionMode, "auto-applied-by-kp");
  assert.equal(e2e.slice037Started, false);
});

test("P03F36 selector and current Pixel authority are exactly 32 sources / 234 KPs with G5A-U01 at 5 visible", () => {
  assert.deepEqual([
    BATCH_A_SELECTOR_AVAILABILITY.sourceCount,
    BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,
    BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
  ], [32, 32, 234]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.deepEqual([
    availability.visibleCount,
    availability.hiddenPendingCount,
    availability.notSelectableCount,
  ], [5, 3, 3]);
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 32);
  assert.equal(pixel.visibleKnowledgePointCount, 234);
  assert.equal(pixel.bySourceId[sourceId].visibleKnowledgePoints.length, 5);
});

test("P03F36 product admission state is candidate or final only and never releases Slice037 early", () => {
  assert.equal(manifest.queuePosition, 36);
  assert.equal(manifest.sourceId, sourceId);
  assert.deepEqual([
    manifest.currentAuthority.publicSources,
    manifest.currentAuthority.visibleKnowledgePoints,
    manifest.currentAuthority.sourceVisibleKnowledgePoints,
    manifest.currentAuthority.sourceHiddenKnowledgePoints,
    manifest.currentAuthority.gaps,
  ], [32, 234, 5, 3, 0]);

  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice036Admitted, false);
    assert.equal(manifest.productionAdmission.slice037MayStart, false);
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice036_D0PostMergeReconciliation");
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
  assert.equal(manifest.productionAdmission.slice036Admitted, true);
  assert.equal(manifest.productionAdmission.slice037MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice037Implementation");
});

test("P03F36 canonical R00 replay trigger is current while historical R00 authority remains unchanged", () => {
  assert.match(r00Test, /P03F36 D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.triggerPath, "tests/curriculum/pgc-r00-public-generation-scope.test.js");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
