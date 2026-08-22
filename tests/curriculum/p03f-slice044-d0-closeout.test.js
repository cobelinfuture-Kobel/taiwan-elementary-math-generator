import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import {
  G5A_U01_P03F44_SOURCE_ID,
  P03F44_GROUP_IDS,
  P03F44_HIDDEN_APPLICATION_SPEC_IDS,
  P03F44_HIDDEN_SIBLING_KP_IDS,
  P03F44_KP_IDS,
  P03F44_REQUIRED_CAPABILITY_IDS,
  P03F44_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u01-rank10-decimal-selector-projection-p03f44.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice044-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice044-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

test("P03F44 D0 authority binds exact frozen q044 scope", () => {
  assert.equal(claim.authority.path, "site/modules/curriculum/registry/g5a-u01-rank10-decimal-selector-projection-p03f44.js");
  assert.equal(claim.authority.queuePosition, 44);
  assert.equal(claim.authority.queueEntryId, "p03e_q044_r10_g5a_u01_5a01_profile_decimal_c1");
  assert.equal(claim.authority.sourceRef, G5A_U01_P03F44_SOURCE_ID);
  assert.deepEqual(claim.authority.knowledgePointIds, [...P03F44_KP_IDS]);
  assert.deepEqual(claim.authority.hiddenSiblingKnowledgePointIds, [...P03F44_HIDDEN_SIBLING_KP_IDS]);
  assert.deepEqual(claim.authority.patternGroupIds, [...P03F44_GROUP_IDS]);
  assert.deepEqual(claim.authority.patternSpecIds, [...P03F44_SPEC_IDS]);
  assert.deepEqual(claim.authority.hiddenApplicationPatternSpecIds, [...P03F44_HIDDEN_APPLICATION_SPEC_IDS]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [...P03F44_REQUIRED_CAPABILITY_IDS]);
  assert.equal(claim.authority.decimalArithmeticRequired, false);
  assert.deepEqual([
    claim.authority.expectedPublicSourceCount,
    claim.authority.expectedVisibleKnowledgePointCount,
    claim.authority.expectedSourceVisibleCount,
    claim.authority.expectedSourceHiddenCount,
    claim.authority.expectedSourceNotSelectableCount,
  ], [33, 245, 7, 1, 0]);
});

test("P03F44 exact final-head implementation and product evidence is gap-free", () => {
  assert.equal(claim.implementationEvidence.prNumber, 632);
  assert.equal(claim.implementationEvidence.headSha, "ba6ead551f67edef74c14ae4f41e156d89c437d2");
  assert.equal(claim.implementationEvidence.mergeSha, "3db2a0255a45e8242a921ba156aa6892ebc43a58");
  assert.equal(claim.implementationEvidence.runtimeBlobShaOnMain, "78af3c204a2e6c500ead091960bf96a7f2dd1db1");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3249, 3249, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([
    product.questionCount,
    product.answerKeyItemCount,
    product.questionPageCount,
    product.answerPageCount,
    product.physicalPdfPageCount,
  ], [24, 24, 3, 3, 6]);
  assert.deepEqual([
    product.roundedQuestionCount,
    product.estimateQuestionCount,
    product.missingDigitQuestionCount,
  ], [8, 8, 8]);
  assert.equal(product.patternSpecCount, 3);
  assert.deepEqual([
    product.crossLayerMismatchCount,
    product.roundedAnswerMismatchCount,
    product.estimateAnswerMismatchCount,
    product.missingDigitAnswerMismatchCount,
    product.nontrivialDigitSetFindingCount,
    product.semanticScopeFindingCount,
    product.applicationLeakFindingCount,
    product.capabilityMismatchFindingCount,
    product.decimalArithmeticCapabilityLeakFindingCount,
    product.hiddenApplicationLeakFindingCount,
    product.hiddenSiblingLeakFindingCount,
    product.duplicatePromptFindingCount,
    product.overflowFindingCount,
    product.consoleErrorCount,
    product.pageErrorCount,
  ], Array(15).fill(0));
  assert.equal(product.sharedDecimalNumberSystem, true);
  assert.equal(product.sharedDecimalDomainValidator, true);
  assert.equal(product.sharedNumericRendererAdapter, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.applicationExpansion, false);
  assert.equal(product.globalContextExpansion, false);
  assert.equal(product.decimalArithmeticCapabilityExpansion, false);
  assert.equal(product.inverseRoundingRangeExpansion, false);
  assert.equal(product.slice045Expansion, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.equal(product.manualVisualReview.exactHeadReviewed, true);
  assert.deepEqual([
    product.manualVisualReview.clippedTextFindingCount,
    product.manualVisualReview.overlapFindingCount,
    product.manualVisualReview.brokenGlyphFindingCount,
  ], [0, 0, 0]);
});

test("P03F44 post-merge Pages E2E binds exact deployed product and recovered transient 503 without mutation", () => {
  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 633);
  assert.equal(e2e.headSha, "d892702730136e0eaecbe5acc66d346f9ef7d1e8");
  assert.equal(e2e.mergeSha, "bdf4b9045022f164b9db944c6fae6027e92e3577");
  assert.equal(e2e.status, "PASS_P03F44_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactImplementationMergeSha, "3db2a0255a45e8242a921ba156aa6892ebc43a58");
  assert.deepEqual([e2e.deployedAssetCount, e2e.deployedAssetShaMismatchCount], [8, 0]);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual([e2e.roundedWitnessCount, e2e.estimateWitnessCount, e2e.missingDigitWitnessCount], [8, 8, 8]);
  assert.deepEqual([e2e.estimateAddWitnessCount, e2e.estimateSubWitnessCount], [4, 4]);
  assert.deepEqual([
    e2e.exactAnswerMismatchCount,
    e2e.unexpectedPatternCount,
    e2e.duplicateProblemCount,
    e2e.internalIdLeakageCount,
    e2e.consoleErrorCount,
    e2e.pageErrorCount,
    e2e.requestFailureCount,
    e2e.serverErrorCount,
  ], Array(8).fill(0));
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.patternGroupSelectionMode, "auto-applied-by-kp");
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.decimalArithmeticCapabilityExpansion, false);
  assert.equal(e2e.inverseRoundingRangeExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice045Started, false);
  assert.equal(e2e.slice048Started, false);
  assert.equal(e2e.recovery.initialFailureClass, "TRANSIENT_DEPLOYED_DEPENDENCY_HTTP_503");
  assert.equal(e2e.recovery.repositoryMutationBetweenAttempts, false);
  assert.equal(e2e.recovery.successfulRerunJobId, e2e.jobId);
});

test("P03F44 current Pixel authority advances through Slice049 to 33/251 while G5A-U01 remains fully visible 8/0/0", () => {
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 251);
  const source = pixel.bySourceId[G5A_U01_P03F44_SOURCE_ID];
  assert.equal(source.visibleKnowledgePoints.length, 8);
  assert.equal(source.hiddenPendingCount, 0);
  assert.equal(source.notSelectableCount, 0);
  for (const kpId of P03F44_KP_IDS) assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === kpId));
  for (const kpId of P03F44_HIDDEN_SIBLING_KP_IDS) assert.ok(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === kpId));
});

test("P03F44 candidate is fail-closed and final D0 releases only Slice045", () => {
  assert.equal(manifest.queuePosition, 44);
  assert.equal(manifest.sourceId, G5A_U01_P03F44_SOURCE_ID);
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(manifest.goalDistance, "D1");
    assert.equal(manifest.productionAdmission.slice044Admitted, false);
    assert.equal(manifest.productionAdmission.slice045MayStart, false);
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(claim.closeoutEvidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice044_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.goalDistance, "D0");
  assert.equal(manifest.productionAdmission.slice044Admitted, true);
  assert.equal(manifest.productionAdmission.slice045MayStart, true);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice045Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice045Implementation");

  const node = claim.closeoutEvidence.candidateNode;
  assert.ok(node.tests >= 3249);
  assert.equal(node.tests, node.pass);
  assert.equal(node.fail, 0);
  assert.equal(node.skipped, 0);
  assert.match(node.artifactDigest, /^sha256:[0-9a-f]{64}$/);

  const replay = claim.canonical793Evidence;
  assert.equal(replay.status, "PASS_ALL_793_LEGAL_ROUTES");
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
  assert.equal(manifest.closeoutPr.number, claim.closeoutEvidence.candidatePrNumber);
  assert.equal(manifest.closeoutPr.headSha, claim.closeoutEvidence.candidateHeadSha);
  assert.equal(manifest.closeoutPr.mergeSha, claim.closeoutEvidence.candidateMergeSha);
  assert.equal(manifest.canonical793Evidence.artifactId, replay.artifactId);
});

test("P03F44 canonical R00 replay trigger stays on frozen 793-route authority", () => {
  assert.match(r00Test, /P03F44 D0 closeout replay trigger/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});