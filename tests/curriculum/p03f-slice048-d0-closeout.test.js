import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5A_U01_P03F48_SOURCE_ID,
  G5A_U01_P03F48_KP_ID,
  G5A_U01_P03F48_GROUP_ID,
  G5A_U01_P03F48_SPEC_ID,
  P03F48_REQUIRED_CAPABILITY_IDS,
  P03F48_HIDDEN_SIBLING_KP_IDS,
} from "../../site/modules/curriculum/registry/g5a-u01-rank11-inverse-rounding-range-selector-projection-p03f48.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice048-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice048-product-admission.manifest.json", import.meta.url), "utf8"));
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice048-g5a-u01-rank11-inverse-rounding-range-authority.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

test("P03F48 D0 authority binds exact frozen q048 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g5a-u01-rank11-inverse-rounding-range-selector-projection-p03f48.js");
  assert.equal(claim.authority.queuePosition, 48);
  assert.equal(claim.authority.queueEntryId, "p03e_q048_r11_g5a_u01_5a01_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5A_U01_P03F48_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5A_U01_P03F48_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5A_U01_P03F48_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5A_U01_P03F48_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F48_REQUIRED_CAPABILITY_IDS]);
  assert.deepEqual(P03F48_HIDDEN_SIBLING_KP_IDS, []);
  assert.equal(claim.authority.operationFamilyId, "inverse_rounding");
  assert.equal(claim.authority.answerType, "decimal_range");
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 249, 8, 0, 0]);
  assert.equal(authority.queuePosition, 48);
  assert.equal(authority.queueEntryId, claim.authority.queueEntryId);
});

test("P03F48 source evidence binds canonical page-2 inverse-rounding witness", () => {
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_5a01_source.pdf");
  assert.equal(claim.sourceEvidence.sourceSha256, "f56cfe9e3bed688313a29d2fa6e0b90c2aa854b953f7dcfff2822effe439fefe");
  assert.equal(claim.sourceEvidence.contentIdentity, "pdf_f56cfe9e3bed");
  assert.equal(claim.sourceEvidence.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [2]);
  assert.equal(claim.sourceEvidence.witness, "1.6 -> 1.55～1.64");
  assert.deepEqual(authority.sourceWitness, { roundedValue: "1.6", sourcePrecision: 2, targetPrecision: 1, lower: "1.55", upper: "1.64" });
});

test("P03F48 implementation L3 and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 648);
  assert.equal(claim.implementationEvidence.headSha, "8684a581999e5b2448f1f01d1fedcf04fdbd58d4");
  assert.equal(claim.implementationEvidence.mergeSha, "3d4461d297e09a96f94f7720dd2697df4f280a6f");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "16e62b9e17b658f0036ce89f3c7131165f89efea");
  const node = claim.implementationEvidence.node;
  assert.deepEqual([node.tests, node.pass, node.fail, node.skipped], [3305, 3305, 0, 0]);
  assert.equal(node.status, "SUCCESS");
  assert.match(node.diagnosticsDigest, /^sha256:[0-9a-f]{64}$/);
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.questionPageCount, product.answerPageCount, product.physicalPdfPageCount, product.patternSpecCount], [24, 24, 3, 3, 6, 1]);
  assert.equal(product.sourceWitnessPresent, true);
  assert.deepEqual([product.exactRangeMismatchCount, product.crossLayerMismatchCount, product.duplicatePromptCount, product.scopeLeakCount, product.overflowFindingCount, product.consoleErrorCount, product.pageErrorCount], Array(7).fill(0));
  assert.equal(product.sharedIntegerScaledDecimalModel, true);
  assert.equal(product.sharedNumericRendererAdapter, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.applicationExpansion, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.decimalArithmeticExpansion, false);
  assert.equal(product.slice049Expansion, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F48 post-merge targeted Pages E2E binds exact deployed product and recovered transient 503", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 649);
  assert.equal(e2e.headSha, "0b104e77a9864800ee6e8b327ad287e2c783b534");
  assert.equal(e2e.mergeSha, "c61067cced95dde900c74661139aea7e75869e36");
  assert.equal(e2e.status, "PASS_P03F48_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationMergeSha, "3d4461d297e09a96f94f7720dd2697df4f280a6f");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [33, 249]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [8, 0, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.pageCount], [24, 24, 6]);
  assert.equal(e2e.sourceWitnessRendered, true);
  assert.deepEqual([e2e.exactRangeMismatchCount, e2e.unexpectedPatternCount, e2e.duplicatePromptCount, e2e.questionAnswerIdMismatchCount, e2e.internalIdLeakageCount, e2e.overflowFindingCount, e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], Array(10).fill(0));
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.decimalArithmeticExpansion, false);
  assert.equal(e2e.slice049Expansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.recovery.initialJobId, 96826089382);
  assert.equal(e2e.recovery.initialFailureClass, "TRANSIENT_GITHUB_PAGES_503_UNRELATED_DEPENDENCY");
  assert.equal(e2e.recovery.successfulRerunJobId, 96827028507);
  assert.equal(e2e.recovery.productMutationUsed, false);
  assert.equal(e2e.manualVisualReview.status, "PASS");
  assert.equal(e2e.manualVisualReview.pagesReviewed, 6);
});

test("P03F48 current Pixel authority advances through Slice051 to 34/255 while G5A-U01 remains fully visible 8/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 34);
  assert.equal(pixel.visibleKnowledgePointCount, 255);
  const source = pixel.bySourceId[G5A_U01_P03F48_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 8);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G5A_U01_P03F48_KP_ID));
});

test("P03F48 Change Impact classification is bounded L3 and explicitly does not require 793", () => {
  assert.equal(impactPolicy.policyId, "P03F_CHANGE_IMPACT_GATE_V1");
  assert.equal(impactPolicy.invariants.d0CloseoutAloneTriggersFullReplay, false);
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
  assert.equal(impact.targetedRouteReplayStatus, "PASS_IMPLEMENTATION_PRODUCT_ACCEPTANCE_AND_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(impact.fullRouteReplayRequired, false);
  assert.equal(manifest.changeImpactGate.level, "L3");
  assert.equal(manifest.changeImpactGate.fullRouteReplayRequired, false);
});

test("P03F48 candidate is fail-closed and final D0 releases only Slice049", () => {
  assert.equal(manifest.queuePosition, 48);
  assert.equal(manifest.sourceId, G5A_U01_P03F48_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice048Admitted, false);
    assert.equal(manifest.productionAdmission.slice049MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(manifest.closeoutPr.number, null);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice048_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice048_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice048Admitted, true);
  assert.equal(manifest.productionAdmission.slice049MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice049Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice049Implementation");
  const closeoutNode = claim.closeoutEvidence.candidateNode;
  assert.ok(closeoutNode.tests >= 3305);
  assert.equal(closeoutNode.tests, closeoutNode.pass);
  assert.equal(closeoutNode.fail, 0);
  assert.equal(closeoutNode.skipped, 0);
  assert.match(closeoutNode.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
});
