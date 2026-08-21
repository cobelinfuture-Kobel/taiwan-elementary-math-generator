import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U06_P03F46_SOURCE_ID,
  G5B_U06_P03F46_KP_ID,
  G5B_U06_P03F46_GROUP_ID,
  G5B_U06_P03F46_SPEC_ID,
  P03F46_REQUIRED_CAPABILITY_IDS,
  P03F46_HIDDEN_SIBLING_KP_IDS,
} from "../../site/modules/curriculum/registry/g5b-u06-rank10-decimal-divided-by-integer-selector-projection-p03f46.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice046-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice046-product-admission.manifest.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

test("P03F46 D0 authority binds exact frozen q046 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g5b-u06-rank10-decimal-divided-by-integer-selector-projection-p03f46.js");
  assert.equal(claim.authority.queuePosition, 46);
  assert.equal(claim.authority.queueEntryId, "p03e_q046_r10_g5b_u06_5b06_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5B_U06_P03F46_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5B_U06_P03F46_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5B_U06_P03F46_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5B_U06_P03F46_SPEC_ID]);
  assert.deepEqual(claim.authority.futureQ050KnowledgePointIds, [...P03F46_HIDDEN_SIBLING_KP_IDS]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F46_REQUIRED_CAPABILITY_IDS]);
  assert.deepEqual([claim.authority.expectedPublicSourceCount, claim.authority.expectedVisibleKnowledgePointCount, claim.authority.expectedSourceVisibleCount, claim.authority.expectedSourceHiddenCount, claim.authority.expectedSourceNotSelectableCount], [33,247,2,3,3]);
});

test("P03F Change Impact Gate forbids D0/comment-only full replay escalation", () => {
  assert.equal(impactPolicy.policyId, "P03F_CHANGE_IMPACT_GATE_V1");
  assert.equal(impactPolicy.invariants.d0CloseoutAloneTriggersFullReplay, false);
  assert.equal(impactPolicy.invariants.commentOnlyReplayTriggerMayEscalateValidation, false);
  assert.equal(impactPolicy.invariants.boundedImpactUsesTargetedReplay, true);
  assert.equal(impactPolicy.invariants.unboundedImpactUsesFullReplay, true);
  assert.equal(impactPolicy.currentFrozenFullReplay.legalRouteCount, 793);
});

test("P03F46 implementation and product evidence is gap-free", () => {
  assert.equal(claim.sourceEvidence.sourceSha256, "f5b06e75d20ac7f7370648ddd90048ef6b911b4296803779878ed4d5a4e871c3");
  assert.equal(claim.sourceEvidence.witness, "48.32 ÷ 8 = 6.04");
  assert.equal(claim.implementationEvidence.prNumber, 640);
  assert.equal(claim.implementationEvidence.headSha, "9d564388d839c0fa1a63d379dc860b087bafed1e");
  assert.equal(claim.implementationEvidence.node.status, "SUCCESS");
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");
  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount, product.patternSpecCount], [24,24,3,3,6,1]);
  assert.deepEqual(product.dividendScales, [1,2,3]);
  assert.equal(product.sourceWitnessPresent, true);
  assert.equal(product.internalZeroQuotientWitness, true);
  assert.deepEqual([product.exactAnswerMismatchCount, product.unexpectedPatternCount, product.duplicateProblemCount, product.questionAnswerIdMismatchCount, product.internalIdLeakageCount, product.overflowFindingCount, product.consoleErrorCount, product.pageErrorCount], Array(8).fill(0));
  assert.equal(product.sharedExactRationalNormalizer, true);
  assert.equal(product.sharedDecimalArithmetic, true);
  assert.equal(product.sharedDecimalNumberSystem, true);
  assert.equal(product.sharedDecimalDomainValidator, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.applicationExpansion, false);
  assert.equal(product.estimationExpansion, false);
  assert.equal(product.zeroPlaceholderKnowledgePointExpansion, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.slice047Expansion, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F46 post-merge targeted Pages E2E binds exact deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 641);
  assert.equal(e2e.status, "PASS_P03F46_POSTMERGE_MAIN_PAGES_E2E");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8,0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [33,247]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [2,3,3]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24,24,3,3]);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.unexpectedPatternCount, e2e.duplicateProblemCount, e2e.questionAnswerIdMismatchCount, e2e.internalIdLeakageCount, e2e.overflowFindingCount, e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], Array(10).fill(0));
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.slice047Expansion, false);
});

test("P03F46 current Pixel authority preserves 33/247 and G5B-U06 2/3/3", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 247);
  const source = pixel.bySourceId[G5B_U06_P03F46_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 2);
  assert.equal(source.hiddenPendingCount, 3);
  assert.equal(source.notSelectableCount, 3);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G5B_U06_P03F46_KP_ID));
  for (const kpId of P03F46_HIDDEN_SIBLING_KP_IDS) assert.equal(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === kpId), false);
});

test("P03F46 Change Impact classification is L3 bounded and does not require 793", () => {
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

test("P03F46 candidate is fail-closed and final D0 releases only Slice047", () => {
  assert.equal(manifest.queuePosition, 46);
  assert.equal(manifest.sourceId, G5B_U06_P03F46_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice046Admitted, false);
    assert.equal(manifest.productionAdmission.slice047MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice046_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice046Admitted, true);
  assert.equal(manifest.productionAdmission.slice047MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice047Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice047Implementation");
  const node = claim.closeoutEvidence.candidateNode;
  assert.ok(node.tests >= 3277);
  assert.equal(node.tests, node.pass);
  assert.equal(node.fail, 0);
  assert.equal(node.skipped, 0);
  assert.match(node.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
});
