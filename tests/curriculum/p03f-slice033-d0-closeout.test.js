import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f33-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice033-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice033-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");

const sourceId = "g4a_u06_4a06";

test("P03F33 closeout candidate binds exact implementation and accepted product evidence", () => {
  assert.equal(claim.authority.queuePosition, 33);
  assert.equal(claim.authority.sourceRef, sourceId);
  assert.equal(claim.authority.knowledgePointIds.length, 3);
  assert.equal(claim.authority.patternGroupIds.length, 3);
  assert.equal(claim.authority.patternSpecIds.length, 4);
  assert.deepEqual(claim.authority.requiredCapabilityIds, [
    "cap_fraction_arithmetic",
    "cap_fraction_domain_validator",
    "cap_fraction_number_system",
  ]);
  assert.equal(claim.implementationEvidence.prNumber, 582);
  assert.equal(claim.implementationEvidence.headSha, "cfd52c46604732a4fcb9a8c61427b27d064551b9");
  assert.equal(claim.implementationEvidence.mergeSha, "3305e7b2692b54e954fe54c6cc8a2114b0366b4e");
  assert.deepEqual([
    claim.implementationEvidence.node.tests,
    claim.implementationEvidence.node.pass,
    claim.implementationEvidence.node.fail,
    claim.implementationEvidence.node.skipped,
  ], [3065, 3065, 0, 0]);

  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.questionCount, 24);
  assert.equal(product.answerKeyItemCount, 24);
  assert.equal(product.uniqueQuestionCount, 24);
  assert.equal(product.patternSpecCount, 4);
  assert.equal(product.witnessesPerPatternSpec, 6);
  assert.equal(product.physicalPdfPageCount, 6);
  for (const key of [
    "crossLayerMismatchCount",
    "duplicatePromptFindingCount",
    "overflowFindingCount",
    "consoleErrorCount",
    "pageErrorCount",
    "semanticScopeFindingCount",
    "applicationLeakFindingCount",
    "hiddenApplicationLeakFindingCount",
    "excludedFractionTimesIntegerFindingCount",
  ]) assert.equal(product[key], 0, key);
  assert.equal(product.hiddenApplicationLineagePreserved, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
  assert.equal(product.manualVisualReview.clippedTextFindingCount, 0);
  assert.equal(product.manualVisualReview.overlapFindingCount, 0);
  assert.equal(product.manualVisualReview.brokenGlyphFindingCount, 0);
  assert.equal(product.manualVisualReview.sourceWitnessVisibleAndAnswerAligned, true);
});

test("P03F33 historical selector remains exactly 32 sources / 229 KPs while current Pixel advances through Slice046 to 247 KPs", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, 32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 229);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [5, 1, 0]);
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 247);
  assert.equal(pixel.bySourceId[sourceId].visibleKnowledgePoints.length, 5);
});

test("P03F33 files agree on main authority and admission follows closeout state", () => {
  assert.equal(manifest.queuePosition, 33);
  assert.equal(manifest.sourceId, sourceId);
  assert.equal(manifest.currentAuthority.publicSources, 32);
  assert.equal(manifest.currentAuthority.visibleKnowledgePoints, 229);
  assert.equal(manifest.currentAuthority.sourceVisibleKnowledgePoints, 5);
  assert.equal(manifest.currentAuthority.sourceHiddenKnowledgePoints, 1);
  assert.equal(manifest.currentAuthority.gaps, 0);
  assert.equal(manifest.implementation.prNumber, claim.implementationEvidence.prNumber);
  assert.equal(manifest.implementation.headSha, claim.implementationEvidence.headSha);
  assert.equal(manifest.implementation.mergeSha, claim.implementationEvidence.mergeSha);
  assert.equal(manifest.runtime.mainBlobSha, claim.implementationEvidence.runtimeBlobShaOnMain);
  assert.equal(manifest.productEvidence.artifactId, claim.implementationEvidence.productAcceptance.artifactId);
  assert.equal(manifest.productEvidence.artifactDigest, claim.implementationEvidence.productAcceptance.artifactDigest);
  const finalD0 = claim.status === "PASS_D0_CLOSED";
  assert.equal(manifest.productionAdmission.slice033Admitted, finalD0);
  assert.equal(manifest.productionAdmission.slice034MayStart, finalD0);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextTask, "P03F_W3DirectProductVerticalSlice034Implementation");
});

test("P03F33 R00 trigger reconciliation is scope-bounded", () => {
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.triggerPath, "tests/curriculum/pgc-r00-public-generation-scope.test.js");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});

test("P03F33 closeout state machine accepts candidate or final reconciled D0 only", () => {
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice033Admitted, false);
    assert.equal(manifest.productionAdmission.slice034MayStart, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice033_D0PostMergeReconciliation");
    return;
  }

  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.equal(claim.canonical793Evidence.executedRouteCount, 793);
  assert.equal(claim.canonical793Evidence.passRouteCount, 793);
  assert.equal(claim.canonical793Evidence.failRouteCount, 0);
  assert.equal(manifest.canonical793Evidence.executed, 793);
  assert.equal(manifest.canonical793Evidence.pass, 793);
  assert.equal(manifest.canonical793Evidence.fail, 0);
  assert.equal(manifest.productionAdmission.slice033Admitted, true);
  assert.equal(manifest.productionAdmission.slice034MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice034Implementation");
});
