import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G6A_U04_P03F52_SOURCE_ID,
  G6A_U04_P03F52_SHIFT_KP_ID,
  G6A_U04_P03F52_PRECISION_KP_ID,
  G6A_U04_P03F52_RATE_KP_ID,
  G6A_U04_P03F52_SHIFT_GROUP_ID,
  G6A_U04_P03F52_PRECISION_GROUP_ID,
  G6A_U04_P03F52_RATE_GROUP_ID,
  G6A_U04_P03F52_SHIFT_SPEC_ID,
  G6A_U04_P03F52_PRECISION_SPEC_ID,
  G6A_U04_P03F52_RATE_SPEC_ID,
  P03F52_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g6a-u04-rank12-shift-precision-rate-selector-projection-p03f52.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice052-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice052-product-admission.manifest.json", import.meta.url), "utf8"));
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice052-g6a-u04-rank12-shift-precision-rate-authority.json", import.meta.url), "utf8"));
const sourceResolution = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice052-g6a-u04-direct-source-witness-resolution.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

const KP_IDS = [
  G6A_U04_P03F52_SHIFT_KP_ID,
  G6A_U04_P03F52_PRECISION_KP_ID,
  G6A_U04_P03F52_RATE_KP_ID,
];
const GROUP_IDS = [
  G6A_U04_P03F52_SHIFT_GROUP_ID,
  G6A_U04_P03F52_PRECISION_GROUP_ID,
  G6A_U04_P03F52_RATE_GROUP_ID,
];
const SPEC_IDS = [
  G6A_U04_P03F52_SHIFT_SPEC_ID,
  G6A_U04_P03F52_PRECISION_SPEC_ID,
  G6A_U04_P03F52_RATE_SPEC_ID,
];

test("P03F52 D0 authority binds exact frozen q052 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g6a-u04-rank12-shift-precision-rate-selector-projection-p03f52.js");
  assert.equal(claim.authority.queuePosition, 52);
  assert.equal(claim.authority.queueEntryId, "p03e_q052_r12_g6a_u04_6a04_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G6A_U04_P03F52_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, KP_IDS);
  assert.deepEqual(claim.authority.patternGroupIds, GROUP_IDS);
  assert.deepEqual(claim.authority.patternSpecIds, SPEC_IDS);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F52_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.operationFamilyId, "decimal_division");
  assert.deepEqual(claim.authority.answerTypes, ["integer", "decimal"]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [34, 258, 4, 1, 1]);
  assert.equal(authority.queueAuthority.queuePosition, 52);
  assert.equal(authority.queueAuthority.sliceId, claim.authority.queueEntryId);
  assert.deepEqual(authority.queueAuthority.knowledgePointIds, KP_IDS);
  assert.deepEqual(authority.queueAuthority.reservedNextSliceKnowledgePointIds, ["kp_g6a_u04_decimal_division_rounding"]);
  assert.equal(authority.queueAuthority.queueMutationAllowed, false);
});

test("P03F52 source evidence preserves direct-witness and operator-approved extension boundary", () => {
  assert.equal(claim.sourceEvidence.resolutionPath, "data/curriculum/full-product/p03f/slice052-g6a-u04-direct-source-witness-resolution.json");
  assert.equal(claim.sourceEvidence.status, "PASS_SOURCE_WITNESS_RESOLVED_WITH_OPERATOR_APPROVED_EXTENSIONS");
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_6a04_source.pdf");
  assert.equal(claim.sourceEvidence.sourceDriveFileId, "1jFp8TvNtrECiCMuYCENyPeZNbb3fQNM1");
  assert.equal(claim.sourceEvidence.sourceSha256, "1e1790a2fe9a91e4d819d0c9ff93d3065dde536887d93c5e20323f7011df8f50");
  assert.equal(claim.sourceEvidence.sourceByteLength, 482611);
  assert.equal(claim.sourceEvidence.sourceRevisionCount, 1);
  assert.equal(claim.sourceEvidence.publicMirrorSha256, claim.sourceEvidence.sourceSha256);
  assert.equal(claim.sourceEvidence.binaryIdentityStatus, "PASS_CANONICAL_AND_PUBLIC_MIRROR_BYTE_IDENTICAL");
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [1, 2]);
  assert.equal(claim.sourceEvidence.decimalShiftDirectTextbookWitness, true);
  assert.equal(claim.sourceEvidence.quotientPrecisionDirectTextbookWitness, true);
  assert.equal(claim.sourceEvidence.quotientPrecisionVisibleExpression, "107.9 ÷ 7");
  assert.equal(claim.sourceEvidence.quotientPrecisionZeroFillDirectTextbookWitness, false);
  assert.equal(claim.sourceEvidence.quotientPrecisionZeroFillOperatorApprovedExtension, true);
  assert.equal(claim.sourceEvidence.rateApplicationDirectTextbookWitness, false);
  assert.equal(claim.sourceEvidence.rateApplicationOperatorApprovedExtension, true);
  assert.equal(claim.sourceEvidence.generatedExtensionExampleClaimedAsTextbook, false);
  assert.equal(claim.sourceEvidence.q053RoundingMayBeConsumed, false);
  assert.equal(sourceResolution.status, claim.sourceEvidence.status);
  assert.equal(sourceResolution.resolution.sourceWitnessGapResolved, true);
  assert.equal(sourceResolution.resolution.queueMutationRequired, false);
  assert.equal(sourceResolution.extensionGuardrails.textbookLiteralClaimAllowed, false);
  assert.equal(sourceResolution.extensionGuardrails.q053RoundingMayBeConsumed, false);
});

test("P03F52 implementation L3, exact-head Node, Chromium and ten-page visual evidence are gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 670);
  assert.equal(claim.implementationEvidence.headSha, "88d61daf5e2b3c0c0942342a25040e953c870d29");
  assert.equal(claim.implementationEvidence.mergeSha, "5e1d396977095f0764dee6cb33b9f2e46eda8dd6");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "a0ffb3995c4c00ee795786e88954939f0fe76ee1");
  const node = claim.implementationEvidence.node;
  assert.deepEqual([node.tests, node.pass, node.fail, node.skipped], [3390, 3390, 0, 0]);
  assert.equal(node.status, "SUCCESS");
  assert.equal(node.runId, 32654737471);
  assert.equal(node.jobId, 97231651249);
  assert.equal(node.diagnosticsArtifactId, 9497194153);
  assert.equal(node.diagnosticsDigest, "sha256:e373eee79a8270400300bf84b51c4c45335421afb6c6b462b276f74c4d8b3d57");
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");

  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.runId, 32654737462);
  assert.equal(product.focusedJobId, 97231627110);
  assert.equal(product.jobId, 97231681303);
  assert.equal(product.artifactId, 9497152376);
  assert.equal(product.artifactDigest, "sha256:d62403284e203a30446f5cd96bb3a706c78e7c667c8c0b397827c88bc0d2ad77");
  assert.equal(product.reportSha256, "9455adcfc1656fd61454dc5b29e68d618139009d77e71224980bf9580202136f");
  assert.deepEqual([
    product.numericQuestionCount,
    product.numericAnswerCount,
    product.shiftQuestionCount,
    product.precisionQuestionCount,
    product.applicationQuestionCount,
    product.applicationAnswerCount,
    product.rateQuestionCount,
    product.totalQuestionCount,
    product.totalAnswerCount,
    product.patternSpecCount,
    product.totalPhysicalPdfPageCount,
  ], [24, 24, 12, 12, 12, 12, 12, 36, 36, 3, 10]);
  assert.deepEqual([
    product.shiftScalingMismatchCount,
    product.precisionMismatchCount,
    product.rateMismatchCount,
    product.crossLayerMismatchCount,
    product.duplicatePromptCount,
    product.scopeLeakCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(9).fill(0));
  assert.equal(product.zeroFillOperatorApprovedExtension, true);
  assert.equal(product.rateOperatorApprovedExtension, true);
  assert.equal(product.generatedExtensionExampleClaimedAsTextbook, false);
  assert.equal(product.sharedExactRationalNormalizer, true);
  assert.equal(product.sharedDecimalDivisionFamily, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.slice053Expansion, false);
  assert.equal(product.roundingExpansion, false);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 10);
  assert.equal(product.manualVisualReview.numericPagesReviewed, 6);
  assert.equal(product.manualVisualReview.applicationPagesReviewed, 4);
  assert.equal(product.manualVisualReview.exactHeadReviewed, true);
  assert.deepEqual([
    product.manualVisualReview.clippedTextFindingCount,
    product.manualVisualReview.overlapFindingCount,
    product.manualVisualReview.brokenGlyphFindingCount,
  ], [0, 0, 0]);
  assert.equal(product.manualVisualReview.questionAnswerAlignmentVisible, true);
});

test("P03F52 post-merge targeted Pages E2E binds exact deployed q052 product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 672);
  assert.equal(e2e.headSha, "377054e3aa731f2074c0de5cd683dda0e9c0a8f8");
  assert.equal(e2e.mergeSha, "f4a46ca2793fc1b7e01722c5c0c54650643eb9f7");
  assert.equal(e2e.runId, 32674091445);
  assert.equal(e2e.runAttempt, 3);
  assert.equal(e2e.jobId, 97297895813);
  assert.equal(e2e.artifactId, 9504470269);
  assert.equal(e2e.artifactDigest, "sha256:d70a99e261309fa441c94dead4886d3f849a6cdb53ec1ccd9a6b21961a837661");
  assert.equal(e2e.reportSha256, "412a958ee74f5b6b10274742f78a3e0871c5c0300a33096fe950bfa24718b825");
  assert.equal(e2e.preflightReportSha256, "21d6699962fcd6acc986d887802772bda6772d1cc1ed13a6aebf55d50a2ab1bc");
  assert.equal(e2e.status, "PASS_P03F52_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationHeadSha, claim.implementationEvidence.headSha);
  assert.equal(e2e.exactImplementationMergeSha, claim.implementationEvidence.mergeSha);
  assert.equal(e2e.preflightStatus, "PASS_P03F52_DEPLOYED_DEPENDENCY_AND_UI_PREFLIGHT");
  assert.deepEqual([e2e.dependencyClosureAssetCount, e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [16, 12, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [34, 258]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [4, 1, 1]);
  assert.deepEqual([
    e2e.numericQuestionCount,
    e2e.numericAnswerCount,
    e2e.shiftQuestionCount,
    e2e.precisionQuestionCount,
    e2e.applicationQuestionCount,
    e2e.applicationAnswerCount,
    e2e.rateQuestionCount,
    e2e.totalQuestionCount,
    e2e.totalAnswerCount,
    e2e.totalPageCount,
  ], [24, 24, 12, 12, 12, 12, 12, 36, 36, 10]);
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.operandOrPromptShapeMismatchCount,
    e2e.unexpectedPatternCount,
    e2e.duplicatePromptCount,
    e2e.questionAnswerIdMismatchCount,
    e2e.internalIdLeakageCount,
    e2e.q053SemanticLeakageCount,
    e2e.overflowFindingCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(12).fill(0));
  assert.equal(e2e.printInvocationCount, 2);
  assert.equal(e2e.zeroFillExtensionRouteCovered, true);
  assert.equal(e2e.rateExtensionRouteCovered, true);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.slice053Expansion, false);
  assert.equal(e2e.roundingExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
});

test("P03F52 current Pixel authority is 34/258 and G6A-U04 remains 4/1/1", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 34);
  assert.equal(pixel.visibleKnowledgePointCount, 258);
  const source = pixel.bySourceId[G6A_U04_P03F52_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 4);
  assert.equal(source.hiddenPendingCount, 1);
  assert.equal(source.notSelectableCount, 1);
  for (const kpId of KP_IDS) assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === kpId));
});

test("P03F52 Change Impact classification is bounded L3 and does not require 793 for D0", () => {
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

test("P03F52 candidate is fail-closed and final D0 releases only Slice053", () => {
  assert.equal(manifest.queuePosition, 52);
  assert.equal(manifest.sourceId, G6A_U04_P03F52_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice052Admitted, false);
    assert.equal(manifest.productionAdmission.slice053MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(manifest.closeoutPr.number, null);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice052_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice052_D0PostMergeReconciliation");
    return;
  }
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice052Admitted, true);
  assert.equal(manifest.productionAdmission.slice053MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice053Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice053Implementation");
  const closeoutNode = claim.closeoutEvidence.candidateNode;
  assert.ok(Number.isInteger(closeoutNode.tests) && closeoutNode.tests > 0);
  assert.equal(closeoutNode.tests, closeoutNode.pass);
  assert.equal(closeoutNode.fail, 0);
  assert.equal(closeoutNode.skipped, 0);
  assert.match(closeoutNode.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
  assert.deepEqual(manifest.closeoutNode, closeoutNode);
});
