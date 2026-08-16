import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U04_P03F39_GROUP_ID,
  G5B_U04_P03F39_KP_ID,
  G5B_U04_P03F39_SOURCE_ID,
  G5B_U04_P03F39_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5b-u04-rank9-integer-times-decimal-selector-projection-p03f39.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice039-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice039-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F39 D0 authority binds exact q039 product scope", () => {
  assert.equal(claim.authority.queuePosition, 39);
  assert.equal(claim.authority.queueEntryId, "p03e_q039_r9_g5b_u04_5b04_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5B_U04_P03F39_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5B_U04_P03F39_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5B_U04_P03F39_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5B_U04_P03F39_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"]);
  assert.deepEqual([claim.authority.expectedPublicSourceCount, claim.authority.expectedVisibleKnowledgePointCount, claim.authority.expectedSourceVisibleCount, claim.authority.expectedSourceHiddenCount, claim.authority.expectedSourceNotSelectableCount], [32, 237, 2, 0, 0]);
});

test("P03F39 implementation and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 605);
  assert.equal(claim.implementationEvidence.headSha, "2b640821246d69159a784d9082725d6116d407c7");
  assert.equal(claim.implementationEvidence.mergeSha, "bb015c5c85bb45da4eba3c4f2f8f58b6add49a3f");
  assert.deepEqual([claim.implementationEvidence.node.tests, claim.implementationEvidence.node.pass, claim.implementationEvidence.node.fail, claim.implementationEvidence.node.skipped], [3166, 3166, 0, 0]);
  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.patternSpecCount, product.patternSpecWitnessCount], [24, 24, 1, 24]);
  assert.deepEqual([product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount, product.screenshotCount], [3, 3, 6, 6]);
  assert.deepEqual([product.crossLayerMismatchCount, product.exactAnswerMismatchCount, product.orientationFindingCount, product.semanticScopeFindingCount, product.applicationLeakFindingCount, product.directSourceQuoteLeakFindingCount, product.duplicatePromptFindingCount, product.overflowFindingCount, product.consoleErrorCount, product.pageErrorCount], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.sharedP03F31DecimalRuntime, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.equal(product.manualVisualReview.clippedTextFindingCount, 0);
  assert.equal(product.manualVisualReview.overlapFindingCount, 0);
  assert.equal(product.manualVisualReview.brokenGlyphFindingCount, 0);
});

test("P03F39 final-head Main/Pages E2E binds deployed product behavior", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 606);
  assert.equal(e2e.headSha, "b115cec684ce9aea8edac6917af54e108e5ae8e1");
  assert.equal(e2e.mergeSha, "c0d7d520f27e09a4d509097b320dae4600db301c");
  assert.equal(e2e.status, "PASS_P03F39_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.orientationFindingCount, e2e.duplicatePromptCount, e2e.internalIdLeakageCount], [0, 0, 0, 0]);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedP03F31DecimalRuntime, true);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.patternGroupSelectionMode, "auto-applied-by-kp");
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.decimalTimesDecimalExpansion, false);
  assert.equal(e2e.estimationExpansion, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice040Started, false);
});

test("P03F39 current Pixel authority is exactly 32 sources / 237 visible KPs", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 32);
  assert.equal(pixel.visibleKnowledgePointCount, 237);
  assert.equal(pixel.bySourceId[G5B_U04_P03F39_SOURCE_ID].visibleKnowledgePoints.length, 2);
  assert.equal(pixel.bySourceId[G5B_U04_P03F39_SOURCE_ID].hiddenPendingCount, 0);
  assert.equal(pixel.bySourceId[G5B_U04_P03F39_SOURCE_ID].notSelectableCount, 0);
});

test("P03F39 product admission remains candidate until canonical R00 replay is bound", () => {
  assert.equal(manifest.queuePosition, 39);
  assert.equal(manifest.sourceId, G5B_U04_P03F39_SOURCE_ID);
  assert.deepEqual([manifest.currentAuthority.publicSources, manifest.currentAuthority.visibleKnowledgePoints, manifest.currentAuthority.sourceVisibleKnowledgePoints, manifest.currentAuthority.sourceHiddenKnowledgePoints, manifest.currentAuthority.sourceNotSelectableKnowledgePoints, manifest.currentAuthority.gaps], [32, 237, 2, 0, 0, 0]);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice039Admitted, false);
    assert.equal(manifest.productionAdmission.slice040MayStart, false);
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice039_D0PostMergeReconciliation");
    return;
  }
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([claim.canonical793Evidence.executedRouteCount, claim.canonical793Evidence.terminalRouteCount, claim.canonical793Evidence.passRouteCount, claim.canonical793Evidence.failRouteCount], [793, 793, 793, 0]);
  assert.equal(manifest.productionAdmission.slice039Admitted, true);
  assert.equal(manifest.productionAdmission.slice040MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice040Implementation");
});

test("P03F39 final D0 binds exact candidate Node and canonical 793 replay evidence", () => {
  if (claim.status !== "PASS_D0_CLOSED") return;
  assert.ok(Number.isInteger(claim.closeoutEvidence.candidatePrNumber));
  assert.match(claim.closeoutEvidence.candidateHeadSha, /^[0-9a-f]{40}$/);
  assert.match(claim.closeoutEvidence.candidateMergeSha, /^[0-9a-f]{40}$/);
  assert.equal(claim.closeoutEvidence.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(claim.closeoutEvidence.candidateNode.fail, 0);
  assert.equal(claim.closeoutEvidence.candidateNode.skipped, 0);
  assert.equal(claim.closeoutEvidence.candidateNode.tests, claim.closeoutEvidence.candidateNode.pass);
  const replay = claim.canonical793Evidence;
  assert.match(replay.headSha, /^[0-9a-f]{40}$/);
  assert.deepEqual([replay.legalRouteCount, replay.executedRouteCount, replay.terminalRouteCount, replay.passRouteCount, replay.failRouteCount, replay.fullNineGatePassCount], [793, 793, 793, 793, 0, 793]);
  assert.deepEqual([replay.shardCount, replay.sampleHtmlCount, replay.samplePdfCount], [16, 16, 16]);
  assert.deepEqual([replay.finalCheckpointExecutedRouteCount, replay.finalCheckpointAuthoritative], [793, true]);
  assert.deepEqual([replay.browserConsoleErrorCount, replay.browserPageErrorCount, replay.exitCode], [0, 0, 0]);
  assert.equal(replay.productMutationUsed, false);
  assert.equal(replay.capacityAuthorityMutationUsed, false);
  assert.equal(replay.perRoutePatchUsed, false);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
  assert.equal(manifest.canonical793Evidence.artifactId, replay.artifactId);
  assert.equal(manifest.canonical793Evidence.fail, 0);
});

test("P03F39 canonical R00 replay trigger is current while route authority stays canonical", () => {
  assert.match(r00Test, /P03F39 D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
