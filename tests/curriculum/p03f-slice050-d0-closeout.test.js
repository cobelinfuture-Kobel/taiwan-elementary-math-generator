import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U06_P03F50_SOURCE_ID,
  G5B_U06_P03F50_APPLICATION_KP_ID,
  G5B_U06_P03F50_ESTIMATION_KP_ID,
  G5B_U06_P03F50_ZERO_PLACEHOLDER_KP_ID,
  G5B_U06_P03F50_APPLICATION_GROUP_ID,
  G5B_U06_P03F50_ESTIMATION_GROUP_ID,
  G5B_U06_P03F50_ZERO_PLACEHOLDER_GROUP_ID,
  G5B_U06_P03F50_APPLICATION_SPEC_ID,
  G5B_U06_P03F50_ESTIMATION_SPEC_ID,
  G5B_U06_P03F50_ZERO_PLACEHOLDER_SPEC_ID,
  P03F50_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g5b-u06-rank11-application-estimation-zero-placeholder-selector-projection-p03f50.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice050-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice050-product-admission.manifest.json", import.meta.url), "utf8"));
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice050-g5b-u06-rank11-application-estimation-zero-placeholder-authority.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

test("P03F50 D0 authority binds exact frozen q050 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g5b-u06-rank11-application-estimation-zero-placeholder-selector-projection-p03f50.js");
  assert.equal(claim.authority.queuePosition, 50);
  assert.equal(claim.authority.queueEntryId, "p03e_q050_r11_g5b_u06_5b06_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5B_U06_P03F50_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5B_U06_P03F50_APPLICATION_KP_ID, G5B_U06_P03F50_ESTIMATION_KP_ID, G5B_U06_P03F50_ZERO_PLACEHOLDER_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5B_U06_P03F50_APPLICATION_GROUP_ID, G5B_U06_P03F50_ESTIMATION_GROUP_ID, G5B_U06_P03F50_ZERO_PLACEHOLDER_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5B_U06_P03F50_APPLICATION_SPEC_ID, G5B_U06_P03F50_ESTIMATION_SPEC_ID, G5B_U06_P03F50_ZERO_PLACEHOLDER_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F50_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.operationFamilyId, "decimal_division");
  assert.deepEqual(claim.authority.answerTypes, ["decimal"]);
  assert.deepEqual([claim.authority.expectedPublicSourceCount, claim.authority.expectedVisibleKnowledgePointCount, claim.authority.expectedSourceVisibleCount, claim.authority.expectedSourceHiddenCount, claim.authority.expectedSourceNotSelectableCount], [33, 254, 5, 0, 0]);
  assert.equal(authority.queueAuthority.queuePosition, 50);
  assert.equal(authority.queueAuthority.sliceId, claim.authority.queueEntryId);
  assert.deepEqual(authority.queueAuthority.frozenKnowledgePointIds, claim.authority.knowledgePointIds);
});

test("P03F50 source boundary preserves direct witnesses and estimation extension", () => {
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_5b06_source.pdf");
  assert.equal(claim.sourceEvidence.sourceSha256, "f5b06e75d20ac7f7370648ddd90048ef6b911b4296803779878ed4d5a4e871c3");
  assert.equal(claim.sourceEvidence.reviewMethod, "FULL_PAGE_VISUAL_READBACK_NO_OCR_AUTHORITY_PLUS_OPERATOR_APPROVED_ESTIMATION_EXTENSION");
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [1]);
  assert.equal(claim.sourceEvidence.applicationDirectTextbookConceptWitness, true);
  assert.equal(claim.sourceEvidence.applicationGeneratedExampleClaimedAsTextbook, false);
  assert.equal(claim.sourceEvidence.estimationDirectTextbookWitness, false);
  assert.equal(claim.sourceEvidence.zeroPlaceholderDirectTextbookWitness, true);
  assert.equal(authority.sourceAuthority.applicationDirectTextbookConceptWitness, true);
  assert.equal(authority.sourceAuthority.applicationGeneratedExampleClaimedAsTextbook, false);
  assert.equal(authority.sourceAuthority.estimationDirectTextbookWitness, false);
  assert.equal(authority.sourceAuthority.zeroPlaceholderDirectTextbookWitness, true);
});

test("P03F50 implementation L3 and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 659);
  assert.equal(claim.implementationEvidence.headSha, "2be52a036658a85274977600c4fd52582a332280");
  assert.equal(claim.implementationEvidence.mergeSha, "1c154711f9a9069995ae230c1c6cbd6c2800ec26");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "5efca49a5acc8bdbd53d43653bb3247401c51d07");
  const node = claim.implementationEvidence.node;
  assert.deepEqual([node.tests, node.pass, node.fail, node.skipped], [3344, 3344, 0, 0]);
  assert.equal(node.status, "SUCCESS");
  assert.equal(node.runId, 32585757392);
  assert.equal(node.jobId, 97061784069);
  assert.equal(node.diagnosticsArtifactId, 9479030456);
  assert.equal(node.diagnosticsDigest, "sha256:c474ce8dff142c1e31d3c296d0553c9382bf927ca6a41cacab05e0da3f2dc1ab");
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");
  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.runId, 32585757404);
  assert.equal(product.focusedJobId, 97061779048);
  assert.equal(product.jobId, 97061823178);
  assert.equal(product.artifactId, 9479006296);
  assert.equal(product.artifactDigest, "sha256:507e16dc3f6420982cff81d2e1032b786408621a9e668d1f54c5199efecc2a64");
  assert.deepEqual([product.applicationQuestionCount, product.estimationQuestionCount, product.zeroPlaceholderQuestionCount, product.questionCount, product.answerKeyItemCount, product.physicalPdfPageCount, product.patternSpecCount], [12, 12, 12, 36, 36, 12, 3]);
  assert.equal(product.applicationWitnessPresent, true);
  assert.equal(product.estimationWitnessPresent, true);
  assert.equal(product.zeroPlaceholderWitnessPresent, true);
  assert.deepEqual([product.exactAnswerMismatchCount, product.crossLayerMismatchCount, product.duplicatePromptCount, product.scopeLeakCount, product.overflowFindingCount, product.consoleErrorCount, product.pageErrorCount], Array(7).fill(0));
  assert.equal(product.sharedExactRationalNormalizer, true);
  assert.equal(product.sharedDecimalDivisionFamily, true);
  assert.equal(product.sharedNumericRendererAdapter, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.applicationExpansion, true);
  assert.equal(product.estimationExpansion, true);
  assert.equal(product.zeroPlaceholderExpansion, true);
  assert.equal(product.directTextbookApplicationExampleClaimed, false);
  assert.equal(product.directTextbookEstimationMethodClaimed, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.slice051Expansion, false);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 12);
});

test("P03F50 post-merge targeted Pages E2E binds exact deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 660);
  assert.equal(e2e.headSha, "683db83888a113128d2629cd3a6d2a958e556e4f");
  assert.equal(e2e.mergeSha, "afb8f5da7cfe0a9add6878c7e16e24181ff71729");
  assert.equal(e2e.status, "PASS_P03F50_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationMergeSha, "1c154711f9a9069995ae230c1c6cbd6c2800ec26");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [33, 254]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [5, 0, 0]);
  assert.deepEqual([e2e.applicationQuestionCount, e2e.estimationQuestionCount, e2e.zeroPlaceholderQuestionCount, e2e.questionCount, e2e.answerCount, e2e.pageCount], [12, 12, 12, 36, 36, 12]);
  assert.equal(e2e.applicationConceptWitnessRendered, true);
  assert.equal(e2e.operatorApprovedEstimationWitnessRendered, true);
  assert.equal(e2e.zeroPlaceholderSourceWitnessRendered, true);
  assert.deepEqual([e2e.exactAnswerMismatchCount, e2e.applicationDimensionMismatchCount, e2e.estimationInstructionMismatchCount, e2e.zeroPlaceholderMismatchCount, e2e.unexpectedPatternCount, e2e.duplicatePromptCount, e2e.questionAnswerIdMismatchCount, e2e.internalIdLeakageCount, e2e.q051LeakageCount, e2e.overflowFindingCount, e2e.consoleErrorCount, e2e.pageErrorCount, e2e.requestFailureCount, e2e.serverErrorCount], Array(14).fill(0));
  assert.equal(e2e.printInvocationCount, 3);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.slice051Expansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.manualVisualReview.status, "PASS");
  assert.equal(e2e.manualVisualReview.pagesReviewed, 12);
});

test("P03F50 current Pixel authority advances through Slice053 to 34/259 while G5B-U06 remains fully visible 5/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 34);
  assert.equal(pixel.visibleKnowledgePointCount, 259);
  const source = pixel.bySourceId[G5B_U06_P03F50_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 5);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  for (const knowledgePointId of [G5B_U06_P03F50_APPLICATION_KP_ID, G5B_U06_P03F50_ESTIMATION_KP_ID, G5B_U06_P03F50_ZERO_PLACEHOLDER_KP_ID]) assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === knowledgePointId));
});

test("P03F50 Change Impact classification is bounded L3 and explicitly does not require 793", () => {
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

test("P03F50 candidate is fail-closed and final D0 releases only Slice051", () => {
  assert.equal(manifest.queuePosition, 50);
  assert.equal(manifest.sourceId, G5B_U06_P03F50_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice050Admitted, false);
    assert.equal(manifest.productionAdmission.slice051MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(manifest.closeoutPr.number, null);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice050_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice050_D0PostMergeReconciliation");
    return;
  }
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice050Admitted, true);
  assert.equal(manifest.productionAdmission.slice051MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice051Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice051Implementation");
  const closeoutNode = claim.closeoutEvidence.candidateNode;
  assert.equal(closeoutNode.tests, 3351);
  assert.equal(closeoutNode.tests, closeoutNode.pass);
  assert.equal(closeoutNode.fail, 0);
  assert.equal(closeoutNode.skipped, 0);
  assert.match(closeoutNode.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
});
