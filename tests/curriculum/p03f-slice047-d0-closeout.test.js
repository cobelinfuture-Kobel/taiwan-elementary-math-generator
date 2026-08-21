import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G6B_U01_P03F47_SOURCE_ID,
  G6B_U01_P03F47_KP_ID,
  G6B_U01_P03F47_GROUP_ID,
  G6B_U01_P03F47_SPEC_ID,
  P03F47_REQUIRED_CAPABILITY_IDS,
  P03F47_HIDDEN_SIBLING_KP_IDS,
} from "../../site/modules/curriculum/registry/g6b-u01-rank10-mixed-decimal-fraction-add-sub-selector-projection-p03f47.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice047-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice047-product-admission.manifest.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

test("P03F47 D0 authority binds exact frozen q047 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g6b-u01-rank10-mixed-decimal-fraction-add-sub-selector-projection-p03f47.js");
  assert.equal(claim.authority.queuePosition, 47);
  assert.equal(claim.authority.queueEntryId, "p03e_q047_r10_g6b_u01_6b01_profile_mixed_number_domain_c1");
  assert.equal(claim.authority.sourceRef, G6B_U01_P03F47_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G6B_U01_P03F47_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G6B_U01_P03F47_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G6B_U01_P03F47_SPEC_ID]);
  assert.deepEqual(claim.authority.hiddenSiblingKnowledgePointIds, [...P03F47_HIDDEN_SIBLING_KP_IDS]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F47_REQUIRED_CAPABILITY_IDS]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 248, 3, 2, 2]);
});

test("P03F47 source evidence stays inside repository-authorized review lineage", () => {
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_6b01_source.pdf");
  assert.equal(claim.sourceEvidence.sourceSha256Status, "NOT_RECORDED_IN_SLICE047_REPOSITORY_AUTHORITY");
  assert.equal(claim.sourceEvidence.reviewMethod, "R02_CANONICAL_REVIEW_PLUS_SLICE041_FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [1]);
  assert.equal(claim.sourceEvidence.witness, "1.8 + 1 3/4");
});

test("P03F47 implementation and Chromium product evidence are gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 644);
  assert.equal(claim.implementationEvidence.headSha, "339fbe0e3f3f257988f06c1fd9edeefa82fabed4");
  assert.equal(claim.implementationEvidence.mergeSha, "9ea10b64d5a26dbf7ecff1e2ec89fbfe9cce3634");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "49ae65c116608abf2b0ffe19bf2d4507c9658708");
  const node = claim.implementationEvidence.node;
  assert.equal(node.status, "SUCCESS");
  assert.deepEqual([node.tests, node.pass, node.fail, node.skipped], [3294, 3294, 0, 0]);
  assert.match(node.diagnosticsDigest, /^sha256:[0-9a-f]{64}$/);
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");
  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([
    product.questionCount,
    product.answerKeyItemCount,
    product.questionPageCount,
    product.answerPageCount,
    product.physicalPdfPageCount,
    product.patternSpecCount,
    product.addCount,
    product.subtractCount,
  ], [24, 24, 3, 3, 6, 1, 12, 12]);
  assert.equal(product.sourceWitnessPresent, true);
  assert.deepEqual([
    product.crossLayerMismatchCount,
    product.exactAnswerMismatchCount,
    product.semanticScopeFindingCount,
    product.capabilityMismatchFindingCount,
    product.futureScopeLeakFindingCount,
    product.duplicatePromptFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(9).fill(0));
  assert.equal(product.sharedP03F32MixedDomainNormalizer, true);
  assert.equal(product.sharedDecimalArithmetic, true);
  assert.equal(product.sharedFractionArithmetic, true);
  assert.equal(product.sharedNumericRendererAdapter, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.applicationExpansion, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.multiplicationDivisionExpansion, false);
  assert.equal(product.mixedExpressionExpansion, false);
  assert.equal(product.slice048Expansion, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F47 post-merge targeted Pages E2E binds exact deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 645);
  assert.equal(e2e.headSha, "a115c30462b85803e42bd0a391fd462ffcc62516");
  assert.equal(e2e.mergeSha, "3d5bff0e2093240eac5f44ed5acfbc6a19d523cb");
  assert.equal(e2e.status, "PASS_P03F47_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [33, 248]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [3, 2, 2]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.pageCount, e2e.addCount, e2e.subtractCount], [24, 24, 6, 12, 12]);
  assert.equal(e2e.sourceWitnessRendered, true);
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.unexpectedPatternCount,
    e2e.duplicatePromptCount,
    e2e.questionAnswerIdMismatchCount,
    e2e.internalIdLeakageCount,
    e2e.overflowFindingCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(10).fill(0));
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.manualVisualReview.status, "PASS");
  assert.equal(e2e.manualVisualReview.pagesReviewed, 6);
});

test("P03F47 current Pixel authority is 33/248 and G6B-U01 remains 3/2/2", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 248);
  const source = pixel.bySourceId[G6B_U01_P03F47_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 3);
  assert.equal(source.hiddenPendingCount, 2);
  assert.equal(source.notSelectableCount, 2);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G6B_U01_P03F47_KP_ID));
  for (const kpId of P03F47_HIDDEN_SIBLING_KP_IDS) assert.equal(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === kpId), false);
});

test("P03F47 Change Impact classification is bounded L3 and does not require 793", () => {
  assert.equal(impactPolicy.policyId, "P03F_CHANGE_IMPACT_GATE_V1");
  assert.equal(impactPolicy.invariants.d0CloseoutAloneTriggersFullReplay, false);
  assert.equal(impactPolicy.invariants.commentOnlyReplayTriggerMayEscalateValidation, false);
  assert.equal(impactPolicy.invariants.boundedImpactUsesTargetedReplay, true);
  assert.equal(impactPolicy.currentFrozenFullReplay.legalRouteCount, 793);
  const impact = claim.changeImpactGate;
  assert.equal(impact.policyId, impactPolicy.policyId);
  assert.equal(impact.level, "L3");
  assert.equal(impact.sharedExecutablePathModified, true);
  assert.equal(impact.sharedExecutionSemanticsChanged, false);
  assert.equal(impact.legalRouteSemanticsChanged, false);
  assert.equal(impact.currentAuthorityChanged, true);
  assert.equal(impact.affectedRouteSetBounded, true);
  assert.equal(impact.globalReleaseCheckpoint, false);
  assert.equal(impact.targetedRouteReplayRequired, true);
  assert.match(impact.targetedRouteReplayStatus, /^PASS_/);
  assert.equal(impact.fullRouteReplayRequired, false);
  assert.equal(manifest.changeImpactGate.level, "L3");
  assert.equal(manifest.changeImpactGate.fullRouteReplayRequired, false);
});

test("P03F47 candidate is fail-closed and final D0 releases only Slice048", () => {
  assert.equal(manifest.queuePosition, 47);
  assert.equal(manifest.sourceId, G6B_U01_P03F47_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice047Admitted, false);
    assert.equal(manifest.productionAdmission.slice048MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(manifest.closeoutPr.number, null);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice047_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice047_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice047Admitted, true);
  assert.equal(manifest.productionAdmission.slice048MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice048Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice048Implementation");
  const closeoutNode = claim.closeoutEvidence.candidateNode;
  assert.ok(closeoutNode.tests >= 3294);
  assert.equal(closeoutNode.tests, closeoutNode.pass);
  assert.equal(closeoutNode.fail, 0);
  assert.equal(closeoutNode.skipped, 0);
  assert.match(closeoutNode.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
});
