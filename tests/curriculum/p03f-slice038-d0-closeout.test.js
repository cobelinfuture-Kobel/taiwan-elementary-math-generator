import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5A_U06_P03F38_GROUP_ID,
  G5A_U06_P03F38_KP_ID,
  G5A_U06_P03F38_SOURCE_ID,
  G5A_U06_P03F38_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5a-u06-rank9-mixed-improper-add-sub-selector-projection-p03f38.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice038-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice038-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F38 D0 authority binds exact q038 product scope", () => {
  assert.equal(claim.authority.queuePosition, 38);
  assert.equal(claim.authority.queueEntryId, "p03e_q038_r9_g5a_u06_5a06_profile_fraction_c1");
  assert.equal(claim.authority.sourceRef, G5A_U06_P03F38_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5A_U06_P03F38_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5A_U06_P03F38_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5A_U06_P03F38_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"]);
  assert.deepEqual([claim.authority.expectedPublicSourceCount, claim.authority.expectedVisibleKnowledgePointCount, claim.authority.expectedSourceVisibleCount, claim.authority.expectedSourceHiddenCount, claim.authority.expectedSourceNotSelectableCount], [32, 236, 5, 2, 2]);
});

test("P03F38 implementation and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 601);
  assert.equal(claim.implementationEvidence.headSha, "4ebc1f7a7d66b8106496ffa52fa2a018a04c3d0e");
  assert.equal(claim.implementationEvidence.mergeSha, "f7e7888881aaff1b926905021db53a3b7e1542bd");
  assert.deepEqual([claim.implementationEvidence.node.tests, claim.implementationEvidence.node.pass, claim.implementationEvidence.node.fail, claim.implementationEvidence.node.skipped], [3149, 3149, 0, 0]);
  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.patternSpecCount, product.patternSpecWitnessCount], [24, 24, 1, 24]);
  assert.deepEqual([product.operationCounts.add, product.operationCounts.sub], [12, 12]);
  assert.deepEqual(Object.values(product.representationCounts), [16, 16, 16]);
  assert.deepEqual([product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount, product.screenshotCount], [3, 3, 6, 6]);
  assert.deepEqual([product.crossLayerMismatchCount, product.exactAnswerMismatchCount, product.duplicatePromptFindingCount, product.overflowFindingCount, product.consoleErrorCount, product.pageErrorCount, product.semanticScopeFindingCount, product.applicationLeakFindingCount], [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.equal(product.hiddenApplicationPatternSpecPubliclyObserved, false);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F38 final-head Main/Pages E2E binds deployed product behavior", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 602);
  assert.equal(e2e.headSha, "30801cf2ff255309c8622322c950211c9299c091");
  assert.equal(e2e.mergeSha, "0f8ca6b0a2a2759b87574125e2330644a3ad2641");
  assert.equal(e2e.status, "PASS_P03F38_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual([e2e.operationCounts.add, e2e.operationCounts.sub], [12, 12]);
  assert.deepEqual(Object.values(e2e.representationCounts), [16, 16, 16]);
  assert.equal(e2e.exactAnswerMismatchCount, 0);
  assert.equal(e2e.duplicatePromptCount, 0);
  assert.equal(e2e.internalIdLeakageCount, 0);
  assert.equal(e2e.printInvocationCount, 1);
  assert.deepEqual([e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], [0, 0, 0, 0]);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.patternGroupSelectionMode, "auto-applied-by-kp");
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice039Started, false);
});

test("P03F38 historical D0 authority remains 32/236 while current Pixel advances through Slice039 to 32/237", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 238);
  assert.equal(pixel.bySourceId[G5A_U06_P03F38_SOURCE_ID].visibleKnowledgePoints.length, 5);
  assert.equal(pixel.bySourceId[G5A_U06_P03F38_SOURCE_ID].hiddenPendingCount, 2);
});

test("P03F38 final product admission is D0 and releases only the next frozen slice", () => {
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.deepEqual([manifest.currentAuthority.publicSources, manifest.currentAuthority.visibleKnowledgePoints, manifest.currentAuthority.sourceVisibleKnowledgePoints, manifest.currentAuthority.sourceHiddenKnowledgePoints, manifest.currentAuthority.sourceNotSelectableKnowledgePoints, manifest.currentAuthority.gaps], [32, 236, 5, 2, 2, 0]);
  assert.equal(manifest.productionAdmission.slice038Admitted, true);
  assert.equal(manifest.productionAdmission.slice039MayStart, true);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice039Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice039Implementation");
});

test("P03F38 final D0 binds exact candidate Node and canonical 793 replay evidence", () => {
  assert.equal(claim.closeoutEvidence.candidatePrNumber, 603);
  assert.equal(claim.closeoutEvidence.candidateHeadSha, "a4f4dd94b9754b3451e616e8f85f6de34e2e32fb");
  assert.equal(claim.closeoutEvidence.candidateMergeSha, "55e757b81465b6add824a99f0949eccbcea51c69");
  assert.equal(claim.closeoutEvidence.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.deepEqual([
    claim.closeoutEvidence.candidateNode.runId,
    claim.closeoutEvidence.candidateNode.jobId,
    claim.closeoutEvidence.candidateNode.tests,
    claim.closeoutEvidence.candidateNode.pass,
    claim.closeoutEvidence.candidateNode.fail,
    claim.closeoutEvidence.candidateNode.skipped,
    claim.closeoutEvidence.candidateNode.artifactId,
  ], [31880102811, 95001371199, 3156, 3156, 0, 0, 9245824111]);
  assert.equal(claim.closeoutEvidence.candidateNode.artifactDigest, "sha256:43ae9dae6dce9dc36dc8751e19b47415ed94a94e2207eda117f529f21f5c5fb2");

  const replay = claim.canonical793Evidence;
  assert.equal(replay.runId, 31880102862);
  assert.equal(replay.jobId, 95001371246);
  assert.equal(replay.headSha, "a4f4dd94b9754b3451e616e8f85f6de34e2e32fb");
  assert.equal(replay.artifactId, 9245966502);
  assert.equal(replay.artifactDigest, "sha256:e919dca366bd5285c9104e19723b708b1ad281db1a897d372a815131d6024457");
  assert.deepEqual([replay.legalRouteCount, replay.executedRouteCount, replay.terminalRouteCount, replay.passRouteCount, replay.failRouteCount, replay.fullNineGatePassCount], [793, 793, 793, 793, 0, 793]);
  assert.deepEqual([replay.shardCount, replay.sampleHtmlCount, replay.samplePdfCount], [16, 16, 16]);
  assert.deepEqual([replay.finalCheckpointExecutedRouteCount, replay.finalCheckpointAuthoritative], [793, true]);
  assert.deepEqual([replay.browserConsoleErrorCount, replay.browserPageErrorCount, replay.exitCode], [0, 0, 0]);
  assert.equal(replay.productMutationUsed, false);
  assert.equal(replay.capacityAuthorityMutationUsed, false);
  assert.equal(replay.perRoutePatchUsed, false);

  assert.equal(manifest.closeoutPr.number, 603);
  assert.equal(manifest.closeoutPr.headSha, "a4f4dd94b9754b3451e616e8f85f6de34e2e32fb");
  assert.equal(manifest.closeoutPr.mergeSha, "55e757b81465b6add824a99f0949eccbcea51c69");
  assert.equal(manifest.canonical793Evidence.artifactId, 9245966502);
  assert.equal(manifest.canonical793Evidence.fail, 0);
});

test("P03F38 canonical R00 replay trigger remains committed while route authority stays canonical", () => {
  assert.match(r00Test, /P03F38 D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});
