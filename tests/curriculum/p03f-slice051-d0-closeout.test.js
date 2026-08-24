import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G6A_U04_P03F51_SOURCE_ID,
  G6A_U04_P03F51_KP_ID,
  G6A_U04_P03F51_GROUP_ID,
  G6A_U04_P03F51_SPEC_ID,
  P03F51_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice051-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice051-product-admission.manifest.json", import.meta.url), "utf8"));
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice051-g6a-u04-rank11-decimal-divided-by-decimal-authority.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

test("P03F51 D0 authority binds exact frozen q051 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g6a-u04-rank11-decimal-divided-by-decimal-selector-projection-p03f51.js");
  assert.equal(claim.authority.queuePosition, 51);
  assert.equal(claim.authority.queueEntryId, "p03e_q051_r11_g6a_u04_6a04_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G6A_U04_P03F51_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G6A_U04_P03F51_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G6A_U04_P03F51_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G6A_U04_P03F51_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F51_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.operationFamilyId, "decimal_division");
  assert.deepEqual(claim.authority.answerTypes, ["decimal"]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [34, 255, 1, 4, 4]);
  assert.equal(authority.queueAuthority.queuePosition, 51);
  assert.equal(authority.queueAuthority.sliceId, claim.authority.queueEntryId);
  assert.deepEqual(authority.queueAuthority.knowledgePointIds, claim.authority.knowledgePointIds);
});

test("P03F51 source evidence preserves canonical binary identity, direct expression and independent exact answer boundary", () => {
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_6a04_source.pdf");
  assert.equal(claim.sourceEvidence.sourceDriveFileId, "1jFp8TvNtrECiCMuYCENyPeZNbb3fQNM1");
  assert.equal(claim.sourceEvidence.sourceSha256, "1e1790a2fe9a91e4d819d0c9ff93d3065dde536887d93c5e20323f7011df8f50");
  assert.equal(claim.sourceEvidence.sourceByteLength, 482611);
  assert.equal(claim.sourceEvidence.sourceRevisionCount, 1);
  assert.equal(claim.sourceEvidence.publicMirrorDriveFileId, "17lSzcLixlux4hVNJNwPqARGaoE-3gZyR");
  assert.equal(claim.sourceEvidence.publicMirrorSha256, claim.sourceEvidence.sourceSha256);
  assert.equal(claim.sourceEvidence.binaryIdentityStatus, "PASS_CANONICAL_AND_PUBLIC_MIRROR_BYTE_IDENTICAL");
  assert.equal(claim.sourceEvidence.provenanceCorrection.status, "PASS_CORRECTED_UNTRACEABLE_CLOSEOUT_HASH");
  assert.equal(claim.sourceEvidence.provenanceCorrection.previousUntraceableSha256, "fcacee5cb58fb3618feb0574259a1be2be9b9e49c7b87a4de5f75a17eeb3e17f");
  assert.equal(claim.sourceEvidence.provenanceCorrection.canonicalRawDownloadSha256, claim.sourceEvidence.sourceSha256);
  assert.equal(claim.sourceEvidence.provenanceCorrection.canonicalAndPublicMirrorByteIdentical, true);
  assert.equal(claim.sourceEvidence.provenanceCorrection.driveRevisionCount, 1);
  assert.equal(claim.sourceEvidence.reviewMethod, "FULL_PAGE_VISUAL_READBACK_NO_OCR_AUTHORITY_PLUS_CANONICAL_R02_CANDIDATE");
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [1, 2]);
  assert.equal(claim.sourceEvidence.directExpression, "2.46 ÷ 0.06");
  assert.equal(claim.sourceEvidence.literalSourceAnswerPrinted, false);
  assert.equal(claim.sourceEvidence.independentlyVerifiedExactQuotient, "41");
  const witness = authority.sourceAuthority.sourceWitnesses[0];
  assert.equal(witness.visibleExpression, claim.sourceEvidence.directExpression);
  assert.equal(witness.literalSourceAnswerPrinted, false);
  assert.equal(witness.independentlyVerifiedExactQuotient, "41");
});

test("P03F51 implementation L3 and Chromium evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 664);
  assert.equal(claim.implementationEvidence.headSha, "c233cee8bebbaa10358e43411c623f0706741e0e");
  assert.equal(claim.implementationEvidence.mergeSha, "3828fc01f3633805548d74eb15825a3597855cd7");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "76de45dec3c982e9b4507b6280ff8be233caa4ec");
  const node = claim.implementationEvidence.node;
  assert.deepEqual([node.tests, node.pass, node.fail, node.skipped], [3361, 3361, 0, 0]);
  assert.equal(node.status, "SUCCESS");
  assert.equal(node.runId, 32635568307);
  assert.equal(node.jobId, 97184672560);
  assert.equal(node.diagnosticsArtifactId, 9492245451);
  assert.equal(node.diagnosticsDigest, "sha256:a9034a7f25e3071809d21ce881a4661406757cf8c468399ea62a28b067059aab");
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");

  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.runId, 32635568241);
  assert.equal(product.focusedJobId, 97184672220);
  assert.equal(product.jobId, 97184812754);
  assert.equal(product.artifactId, 9492224777);
  assert.equal(product.artifactDigest, "sha256:656ab3e710a1e16232574b5ecd88fb4ae608e002f49e04d14bc10a738db75930");
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.physicalPdfPageCount, product.patternSpecCount], [24, 24, 6, 1]);
  assert.equal(product.sourceWitnessExpressionPresent, true);
  assert.equal(product.sourceWitnessExactQuotient, "41");
  assert.deepEqual([
    product.exactAnswerMismatchCount,
    product.crossLayerMismatchCount,
    product.duplicatePromptCount,
    product.scopeLeakCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(7).fill(0));
  assert.equal(product.sharedExactRationalNormalizer, true);
  assert.equal(product.sharedDecimalDivisionFamily, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.slice052Expansion, false);
  assert.equal(product.slice053Expansion, false);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.equal(product.manualVisualReview.exactHeadReviewed, true);
});

test("P03F51 post-merge targeted Pages E2E binds exact deployed q051 product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 665);
  assert.equal(e2e.headSha, "f9b6a7739ab36351572aedf673c11f9efd847983");
  assert.equal(e2e.mergeSha, "cc5837187b131239929b0e6e81dba3ab83f815c7");
  assert.equal(e2e.status, "PASS_P03F51_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationMergeSha, "3828fc01f3633805548d74eb15825a3597855cd7");
  assert.equal(e2e.preflightStatus, "PASS_P03F51_DEPLOYED_DEPENDENCY_AND_UI_PREFLIGHT");
  assert.deepEqual([e2e.dependencyClosureAssetCount, e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [18, 8, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [34, 255]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [1, 4, 4]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.pageCount], [24, 24, 6]);
  assert.equal(e2e.sourceWitnessExpressionRendered, true);
  assert.equal(e2e.sourceWitnessExactQuotient, "41");
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.decimalOperandShapeMismatchCount,
    e2e.unexpectedPatternCount,
    e2e.duplicatePromptCount,
    e2e.questionAnswerIdMismatchCount,
    e2e.internalIdLeakageCount,
    e2e.q052LeakageCount,
    e2e.q053LeakageCount,
    e2e.overflowFindingCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(13).fill(0));
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.slice052Expansion, false);
  assert.equal(e2e.slice053Expansion, false);
  assert.equal(e2e.parallelPipeline, false);
});

test("P03F51 current Pixel authority advances through Slice053 to 34/259 and G6A-U04 is 5/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 34);
  assert.equal(pixel.visibleKnowledgePointCount, 259);
  const source = pixel.bySourceId[G6A_U04_P03F51_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 5);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G6A_U04_P03F51_KP_ID));
});

test("P03F51 Change Impact classification is bounded L3 and does not require 793 for D0", () => {
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

test("P03F51 candidate is fail-closed and final D0 releases only Slice052", () => {
  assert.equal(manifest.queuePosition, 51);
  assert.equal(manifest.sourceId, G6A_U04_P03F51_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice051Admitted, false);
    assert.equal(manifest.productionAdmission.slice052MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(manifest.closeoutPr.number, null);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice051_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice051_D0PostMergeReconciliation");
    return;
  }
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice051Admitted, true);
  assert.equal(manifest.productionAdmission.slice052MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice052Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice052Implementation");
  const closeoutNode = claim.closeoutEvidence.candidateNode;
  assert.equal(closeoutNode.tests, 3368);
  assert.equal(closeoutNode.tests, closeoutNode.pass);
  assert.equal(closeoutNode.fail, 0);
  assert.equal(closeoutNode.skipped, 0);
  assert.match(closeoutNode.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
});
