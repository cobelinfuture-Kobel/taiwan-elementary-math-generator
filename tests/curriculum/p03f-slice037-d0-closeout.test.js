import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5A_U04_P03F37_GROUP_ID,
  G5A_U04_P03F37_KP_ID,
  G5A_U04_P03F37_SOURCE_ID,
  G5A_U04_P03F37_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u04-rank9-equivalent-mixed-selector-projection-p03f37.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice037-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice037-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F37 D0 authority binds exact q037 product scope", () => {
  assert.equal(claim.authority.queuePosition, 37);
  assert.equal(claim.authority.queueEntryId, "p03e_q037_r9_g5a_u04_5a04_profile_fraction_c1");
  assert.equal(claim.authority.sourceRef, G5A_U04_P03F37_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5A_U04_P03F37_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5A_U04_P03F37_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, G5A_U04_P03F37_SPEC_IDS);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [
    "cap_fraction_arithmetic",
    "cap_fraction_domain_validator",
    "cap_fraction_number_system",
  ]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [32, 235, 6, 1, 1]);
});

test("P03F37 implementation and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 597);
  assert.equal(claim.implementationEvidence.headSha, "d8964648a6ecfd448234785e50025768856b5bdf");
  assert.equal(claim.implementationEvidence.mergeSha, "be5ac90b8708cb2764eaae7ed2b0b2bd25e6c982");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3133, 3133, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.patternSpecCount], [24, 24, 3]);
  assert.deepEqual(Object.values(product.patternSpecWitnessCounts), [8, 8, 8]);
  assert.deepEqual(Object.values(product.unknownRoleCounts), [8, 8, 8]);
  assert.equal(product.integerEquivalenceWitnessCount, 9);
  assert.deepEqual([product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount, product.screenshotCount], [3, 3, 6, 6]);
  assert.deepEqual([
    product.crossLayerMismatchCount,
    product.exactAnswerMismatchCount,
    product.duplicatePromptFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
    product.semanticScopeFindingCount,
    product.applicationLeakFindingCount,
  ], [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F37 final-head Main/Pages E2E binds deployed product behavior", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 598);
  assert.equal(e2e.headSha, "b1a22b04db129f64646d61f4f29ccb8c7559c532");
  assert.equal(e2e.mergeSha, "1b4b2f343bfa444b8c35dce94d023e6bf7ec03ec");
  assert.equal(e2e.status, "PASS_P03F37_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual(Object.values(e2e.familyCounts), [8, 8, 8]);
  assert.equal(e2e.integerEquivalenceWitnessCount, 9);
  assert.equal(e2e.exactAnswerMismatchCount, 0);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.patternGroupSelectionMode, "auto-applied-by-kp");
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice038Started, false);
});

test("P03F37 historical authority remains 32/235 while current Pixel advances through Slice046 to 33/247", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 247);
  assert.equal(pixel.bySourceId[G5A_U04_P03F37_SOURCE_ID].visibleKnowledgePoints.length, 6);
  assert.equal(pixel.bySourceId[G5A_U04_P03F37_SOURCE_ID].hiddenPendingCount, 1);
});

test("P03F37 product admission remains candidate until canonical R00 replay is bound", () => {
  assert.equal(manifest.queuePosition, 37);
  assert.equal(manifest.sourceId, G5A_U04_P03F37_SOURCE_ID);
  assert.deepEqual([
    manifest.currentAuthority.publicSources,
    manifest.currentAuthority.visibleKnowledgePoints,
    manifest.currentAuthority.sourceVisibleKnowledgePoints,
    manifest.currentAuthority.sourceHiddenKnowledgePoints,
    manifest.currentAuthority.sourceNotSelectableKnowledgePoints,
    manifest.currentAuthority.gaps,
  ], [32, 235, 6, 1, 1, 0]);

  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice037Admitted, false);
    assert.equal(manifest.productionAdmission.slice038MayStart, false);
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice037_D0PostMergeReconciliation");
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
  assert.equal(manifest.productionAdmission.slice037Admitted, true);
  assert.equal(manifest.productionAdmission.slice038MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice038Implementation");
});

test("P03F37 final D0 binds exact candidate Node and canonical 793 replay evidence", () => {
  if (claim.status !== "PASS_D0_CLOSED") return;

  assert.equal(claim.closeoutEvidence.candidatePrNumber, 599);
  assert.equal(claim.closeoutEvidence.candidateHeadSha, "b21fd32d5c29115a7efed102989e4c853558be0d");
  assert.equal(claim.closeoutEvidence.candidateMergeSha, "9bcf13140e255eb0ce168ffcde0b93807a279c9d");
  assert.equal(claim.closeoutEvidence.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.deepEqual([
    claim.closeoutEvidence.candidateNode.tests,
    claim.closeoutEvidence.candidateNode.pass,
    claim.closeoutEvidence.candidateNode.fail,
    claim.closeoutEvidence.candidateNode.skipped,
  ], [3139, 3139, 0, 0]);
  assert.equal(claim.closeoutEvidence.candidateNode.runId, 31874431055);
  assert.equal(claim.closeoutEvidence.candidateNode.jobId, 94987919450);
  assert.equal(claim.closeoutEvidence.candidateNode.artifactId, 9244373282);
  assert.equal(claim.closeoutEvidence.candidateNode.artifactDigest, "sha256:f19ab09d11f4853a5acf7f867291857753c659b0a647fb4b5d8cfeac30945ced");

  const replay = claim.canonical793Evidence;
  assert.equal(replay.runId, 31874431027);
  assert.equal(replay.jobId, 94987919376);
  assert.equal(replay.headSha, "b21fd32d5c29115a7efed102989e4c853558be0d");
  assert.equal(replay.artifactId, 9244522133);
  assert.equal(replay.artifactDigest, "sha256:1435a330928e30776037e686ffdc56b6a5985b5b000e0c49405f1b978827741a");
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

  assert.equal(manifest.closeoutPr.number, 599);
  assert.equal(manifest.closeoutPr.headSha, "b21fd32d5c29115a7efed102989e4c853558be0d");
  assert.equal(manifest.closeoutPr.mergeSha, "9bcf13140e255eb0ce168ffcde0b93807a279c9d");
  assert.equal(manifest.canonical793Evidence.artifactId, 9244522133);
  assert.equal(manifest.canonical793Evidence.fail, 0);
});

test("P03F37 canonical R00 replay trigger is current while route authority stays canonical", () => {
  assert.match(r00Test, /P03F37 D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
