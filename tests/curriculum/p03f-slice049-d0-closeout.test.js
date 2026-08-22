import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5B_U04_P03F49_SOURCE_ID,
  G5B_U04_P03F49_APPLICATION_KP_ID,
  G5B_U04_P03F49_ESTIMATION_KP_ID,
  G5B_U04_P03F49_APPLICATION_GROUP_ID,
  G5B_U04_P03F49_ESTIMATION_GROUP_ID,
  G5B_U04_P03F49_APPLICATION_SPEC_ID,
  G5B_U04_P03F49_ESTIMATION_SPEC_ID,
  P03F49_REQUIRED_CAPABILITY_IDS,
} from "../../site/modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice049-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice049-product-admission.manifest.json", import.meta.url), "utf8"));
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice049-g5b-u04-rank11-application-estimation-authority.json", import.meta.url), "utf8"));
const impactPolicy = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/change-impact-gate-v1.json", import.meta.url), "utf8"));

test("P03F49 D0 authority binds exact frozen q049 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g5b-u04-rank11-application-estimation-selector-projection-p03f49.js");
  assert.equal(claim.authority.queuePosition, 49);
  assert.equal(claim.authority.queueEntryId, "p03e_q049_r11_g5b_u04_5b04_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5B_U04_P03F49_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [G5B_U04_P03F49_APPLICATION_KP_ID, G5B_U04_P03F49_ESTIMATION_KP_ID]);
  assert.deepEqual(claim.authority.patternGroupIds, [G5B_U04_P03F49_APPLICATION_GROUP_ID, G5B_U04_P03F49_ESTIMATION_GROUP_ID]);
  assert.deepEqual(claim.authority.patternSpecIds, [G5B_U04_P03F49_APPLICATION_SPEC_ID, G5B_U04_P03F49_ESTIMATION_SPEC_ID]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F49_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.operationFamilyId, "decimal_multiplication");
  assert.deepEqual(claim.authority.answerTypes, ["decimal"]);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 251, 5, 0, 0]);
  assert.equal(authority.queueAuthority.queuePosition, 49);
  assert.equal(authority.queueAuthority.sliceId, claim.authority.queueEntryId);
  assert.deepEqual(authority.queueAuthority.frozenKnowledgePointIds, claim.authority.knowledgePointIds);
});

test("P03F49 source boundary preserves direct-witness gap and operator-approved extensions", () => {
  assert.equal(claim.sourceEvidence.sourceFileName, "meow911_5b04_source.pdf");
  assert.equal(claim.sourceEvidence.sourceSha256, "12fae845404ae3b845a0e531e0c1a8695d421cdc3e3d0858b0b8e47c334c7ca9");
  assert.equal(claim.sourceEvidence.reviewMethod, "FULL_PAGE_VISUAL_READBACK_PLUS_OPERATOR_APPROVED_CURRICULUM_EXTENSION");
  assert.deepEqual(claim.sourceEvidence.reviewedPages, [1]);
  assert.equal(claim.sourceEvidence.applicationDirectTextbookWitness, false);
  assert.equal(claim.sourceEvidence.estimationDirectTextbookWitness, false);
  assert.equal(claim.sourceEvidence.textbookDirectWitnessClaimAdded, false);
  assert.equal(authority.sourceAuthority.applicationDirectTextbookWitness, false);
  assert.equal(authority.sourceAuthority.estimationDirectTextbookWitness, false);
  assert.equal(authority.sourceAuthority.textbookDirectWitnessClaimAdded, false);
  assert.equal(authority.operatorApprovedExamples.length, 2);
  assert.ok(authority.operatorApprovedExamples.every((row) => row.textbookDirectWitness === false));
});

test("P03F49 implementation L3 and Chromium product evidence are exact and gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 653);
  assert.equal(claim.implementationEvidence.headSha, "de61a7f4d1a16dd4f052534ebf96f1b0cfcd8fc1");
  assert.equal(claim.implementationEvidence.mergeSha, "67355e0ab7bb6e26611bb068cbf7b4e5d3d4d4fa");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "5ea65a7b4040fba4af987d3ef512fc15b049b80a");
  const node = claim.implementationEvidence.node;
  assert.deepEqual([node.tests, node.pass, node.fail, node.skipped], [3414, 3414, 0, 0]);
  assert.equal(node.status, "SUCCESS");
  assert.equal(node.runId, 32561490291);
  assert.equal(node.jobId, 97003635412);
  assert.equal(node.diagnosticsArtifactId, 9472978350);
  assert.equal(node.diagnosticsDigest, "sha256:18e3bdc9a01e0659ad89e6d022ef63cabe851eedea7f39e0cca8d88e79022200");
  for (const status of Object.values(claim.implementationEvidence.globalContracts)) assert.equal(status, "SUCCESS");

  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.runId, 32561490097);
  assert.equal(product.focusedJobId, 97003634866);
  assert.equal(product.jobId, 97003810256);
  assert.equal(product.artifactId, 9472935441);
  assert.equal(product.artifactDigest, "sha256:3c00c03ef5b105dd285f092f412b18047877d06e040ab5bb5e7937f25cfbe339");
  assert.deepEqual([
    product.applicationQuestionCount,
    product.estimationQuestionCount,
    product.questionCount,
    product.answerKeyItemCount,
    product.physicalPdfPageCount,
    product.patternSpecCount,
  ], [12, 12, 24, 24, 8, 2]);
  assert.equal(product.applicationWitnessPresent, true);
  assert.equal(product.estimationWitnessPresent, true);
  assert.deepEqual([
    product.exactAnswerMismatchCount,
    product.crossLayerMismatchCount,
    product.duplicatePromptCount,
    product.scopeLeakCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(7).fill(0));
  assert.equal(product.sharedIntegerScaledDecimalModel, true);
  assert.equal(product.sharedNumericRendererAdapter, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.applicationExpansion, true);
  assert.equal(product.operatorApprovedApplication, true);
  assert.equal(product.operatorApprovedEstimation, true);
  assert.equal(product.directTextbookApplicationExampleClaimed, false);
  assert.equal(product.directTextbookEstimationMethodClaimed, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.slice050Expansion, false);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 8);
});

test("P03F49 post-merge targeted Pages E2E binds exact deployed product", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 656);
  assert.equal(e2e.headSha, "9f8950bd33ce01915fdf974ccc481cb16ae6f135");
  assert.equal(e2e.mergeSha, "7fc0be3d78e51f342aeac2e69b046f4656d03161");
  assert.equal(e2e.status, "PASS_P03F49_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationMergeSha, "67355e0ab7bb6e26611bb068cbf7b4e5d3d4d4fa");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.publicSourceCount, e2e.visibleKnowledgePointCount], [33, 251]);
  assert.deepEqual([e2e.sourceVisibleCount, e2e.sourceHiddenCount, e2e.sourceNotSelectableCount], [5, 0, 0]);
  assert.deepEqual([e2e.applicationQuestionCount, e2e.estimationQuestionCount, e2e.questionCount, e2e.answerCount, e2e.pageCount], [12, 12, 24, 24, 8]);
  assert.equal(e2e.operatorApprovedApplicationWitnessRendered, true);
  assert.equal(e2e.operatorApprovedEstimationWitnessRendered, true);
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.applicationDimensionMismatchCount,
    e2e.estimationInstructionMismatchCount,
    e2e.unexpectedPatternCount,
    e2e.duplicatePromptCount,
    e2e.questionAnswerIdMismatchCount,
    e2e.internalIdLeakageCount,
    e2e.q050LeakageCount,
    e2e.overflowFindingCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(13).fill(0));
  assert.equal(e2e.printInvocationCount, 2);
  assert.equal(e2e.applicationExpansion, true);
  assert.equal(e2e.operatorApprovedApplication, true);
  assert.equal(e2e.operatorApprovedEstimation, true);
  assert.equal(e2e.directTextbookApplicationExampleClaimed, false);
  assert.equal(e2e.directTextbookEstimationMethodClaimed, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.slice050Expansion, false);
  assert.equal(e2e.parallelPipeline, false);
});

test("P03F49 current Pixel authority is exactly 33/251 and G5B-U04 is fully visible 5/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 251);
  const source = pixel.bySourceId[G5B_U04_P03F49_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 5);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G5B_U04_P03F49_APPLICATION_KP_ID));
  assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G5B_U04_P03F49_ESTIMATION_KP_ID));
});

test("P03F49 Change Impact classification is bounded L3 and explicitly does not require 793", () => {
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

test("P03F49 candidate is fail-closed and final D0 releases only Slice050", () => {
  assert.equal(manifest.queuePosition, 49);
  assert.equal(manifest.sourceId, G5B_U04_P03F49_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.productionAdmission.slice049Admitted, false);
    assert.equal(manifest.productionAdmission.slice050MayStart, false);
    assert.equal(claim.closeoutEvidence.status, "PENDING_EXACT_HEAD_NODE_CI");
    assert.equal(claim.closeoutEvidence.candidatePrNumber, null);
    assert.equal(manifest.closeoutPr.number, null);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice049_D0PostMergeReconciliation");
    assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice049_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.productionAdmission.slice049Admitted, true);
  assert.equal(manifest.productionAdmission.slice050MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice050Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice050Implementation");
  const closeoutNode = claim.closeoutEvidence.candidateNode;
  assert.ok(closeoutNode.tests >= 3414);
  assert.equal(closeoutNode.tests, closeoutNode.pass);
  assert.equal(closeoutNode.fail, 0);
  assert.equal(closeoutNode.skipped, 0);
  assert.match(closeoutNode.artifactDigest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
});
