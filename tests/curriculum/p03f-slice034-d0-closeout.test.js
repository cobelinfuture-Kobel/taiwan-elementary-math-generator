import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  BATCH_A_SELECTOR_AVAILABILITY,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f34-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice034-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice034-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");
const sourceId = "g4a_u09_4a09";

test("P03F34 closeout candidate binds exact implementation and accepted product evidence", () => {
  assert.equal(claim.authority.queuePosition, 34);
  assert.equal(claim.authority.sourceRef, sourceId);
  assert.deepEqual(claim.authority.knowledgePointIds, ["kp_g4a_u09_missing_digit_inequality"]);
  assert.deepEqual(claim.authority.patternGroupIds, ["pg_g4a_u09_missing_digit_inequality_numeric"]);
  assert.deepEqual(claim.authority.patternSpecIds, ["ps_g4a_u09_missing_digit_inequality_possible_digits_numeric"]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_decimal_domain_validator", "cap_decimal_number_system"]);
  assert.equal(claim.implementationEvidence.prNumber, 585);
  assert.equal(claim.implementationEvidence.headSha, "da14347e0b7f16c0ff2ffb4758a2f478e971a855");
  assert.equal(claim.implementationEvidence.mergeSha, "190b809fb45606a85102d0027a00082efcde4cb4");
  assert.deepEqual([claim.implementationEvidence.node.tests, claim.implementationEvidence.node.pass, claim.implementationEvidence.node.fail, claim.implementationEvidence.node.skipped], [3083, 3083, 0, 0]);
  const product = claim.implementationEvidence.productAcceptance;
  assert.equal(product.questionCount, 24);
  assert.equal(product.answerKeyItemCount, 24);
  assert.equal(product.uniqueQuestionCount, 24);
  assert.equal(product.patternSpecCount, 1);
  assert.equal(product.witnessesPerPatternSpec, 24);
  assert.equal(product.physicalPdfPageCount, 6);
  for (const key of ["completeDigitSetMismatchCount", "nonDiscriminatingDigitSetCount", "crossLayerMismatchCount", "duplicatePromptFindingCount", "overflowFindingCount", "consoleErrorCount", "pageErrorCount", "semanticScopeFindingCount", "applicationLeakFindingCount"]) assert.equal(product[key], 0, key);
  assert.deepEqual([product.tenthsWitnessCount, product.hundredthsWitnessCount, product.lessThanWitnessCount, product.greaterThanWitnessCount], [12, 12, 12, 12]);
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

test("P03F34 current selector is exactly 32 sources / 230 KPs with G4A-U09 at 7 visible / 1 hidden", () => {
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, 32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 230);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [7, 1, 0]);
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 32);
  assert.equal(pixel.visibleKnowledgePointCount, 230);
  assert.equal(pixel.bySourceId[sourceId].visibleKnowledgePoints.length, 7);
});

test("P03F34 candidate files agree on main authority and keep Slice035 frozen", () => {
  assert.equal(manifest.queuePosition, 34);
  assert.equal(manifest.sourceId, sourceId);
  assert.deepEqual([manifest.currentAuthority.publicSources, manifest.currentAuthority.visibleKnowledgePoints, manifest.currentAuthority.sourceVisibleKnowledgePoints, manifest.currentAuthority.sourceHiddenKnowledgePoints, manifest.currentAuthority.gaps], [32, 230, 7, 1, 0]);
  assert.equal(manifest.implementation.prNumber, claim.implementationEvidence.prNumber);
  assert.equal(manifest.implementation.headSha, claim.implementationEvidence.headSha);
  assert.equal(manifest.implementation.mergeSha, claim.implementationEvidence.mergeSha);
  assert.equal(manifest.runtime.mainBlobSha, claim.implementationEvidence.runtimeBlobShaOnMain);
  assert.equal(manifest.productEvidence.artifactId, claim.implementationEvidence.productAcceptance.artifactId);
  assert.equal(manifest.productEvidence.artifactDigest, claim.implementationEvidence.productAcceptance.artifactDigest);
  assert.equal(manifest.productionAdmission.slice034Admitted, false);
  assert.equal(manifest.productionAdmission.slice035MayStart, false);
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(claim.progression.nextTask, "P03F_W3DirectProductVerticalSlice035Implementation");
});

test("P03F34 R00 trigger reconciliation is scope-bounded", () => {
  assert.match(r00Test, /current public sources may extend through Slice034/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.triggerPath, "tests/curriculum/pgc-r00-public-generation-scope.test.js");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});

test("P03F34 closeout state machine accepts candidate or final reconciled D0 only", () => {
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice034Admitted, false);
    assert.equal(manifest.productionAdmission.slice035MayStart, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice034_D0PostMergeReconciliation");
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
  assert.equal(manifest.productionAdmission.slice034Admitted, true);
  assert.equal(manifest.productionAdmission.slice035MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice035Implementation");
});
