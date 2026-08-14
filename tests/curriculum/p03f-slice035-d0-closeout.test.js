import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { BATCH_A_SELECTOR_AVAILABILITY, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-p03f35-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice035-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice035-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");
const sourceId = "g4b_u06_4b06";

test("P03F35 closeout candidate binds exact implementation and product evidence", () => {
  assert.equal(claim.authority.queuePosition, 35);
  assert.equal(claim.authority.sourceRef, sourceId);
  assert.deepEqual(claim.authority.knowledgePointIds, ["kp_g4b_u06_decimal_scale_ten_hundred"]);
  assert.deepEqual(claim.authority.patternSpecIds, ["ps_g4b_u06_decimal_scale_ten_hundred_result_numeric"]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"]);
  assert.equal(claim.implementationEvidence.prNumber, 588);
  assert.equal(claim.implementationEvidence.headSha, "088d3220d4760962f046ef957c01c1d19900d6b4");
  assert.equal(claim.implementationEvidence.mergeSha, "af64cb90c5da3cf46812dd34a505255b52f7954a");
  assert.deepEqual([claim.implementationEvidence.node.tests, claim.implementationEvidence.node.pass, claim.implementationEvidence.node.fail, claim.implementationEvidence.node.skipped], [3095, 3095, 0, 0]);
  const product = claim.implementationEvidence.productAcceptance;
  assert.deepEqual([product.questionCount, product.answerKeyItemCount, product.physicalPdfPageCount, product.screenshotCount], [24, 24, 6, 6]);
  assert.deepEqual(product.factorWitnessCounts, {"10": 6, "100": 6, "0.1": 6, "0.01": 6});
  for (const key of ["exactResultMismatchCount", "crossLayerMismatchCount", "duplicatePromptFindingCount", "overflowFindingCount", "consoleErrorCount", "pageErrorCount", "semanticScopeFindingCount", "applicationLeakFindingCount"]) assert.equal(product[key], 0, key);
  assert.equal(product.hiddenApplicationLineagePreserved, true);
  assert.equal(product.sharedPagination, true);
  assert.equal(product.sharedRenderer, true);
  assert.equal(product.parallelPipeline, false);
  assert.equal(product.manualVisualReview.status, "PASS");
  assert.equal(product.manualVisualReview.pagesReviewed, 6);
});

test("P03F35 selector and current Pixel bind exactly 32 sources / 231 KPs with G4B-U06 4 visible / 2 hidden", () => {
  assert.deepEqual([BATCH_A_SELECTOR_AVAILABILITY.sourceCount, BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, BATCH_A_SELECTOR_AVAILABILITY.visibleCount], [32, 32, 231]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [4, 2, 0]);
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 32);
  assert.equal(pixel.visibleKnowledgePointCount, 231);
  assert.equal(pixel.bySourceId[sourceId].visibleKnowledgePoints.length, 4);
  assert.equal(pixel.bySourceId[sourceId].hiddenPendingCount, 2);
});

test("P03F35 manifest and main readback agree with implementation authority", () => {
  assert.equal(manifest.queuePosition, 35);
  assert.equal(manifest.sourceId, sourceId);
  assert.deepEqual([manifest.currentAuthority.publicSources, manifest.currentAuthority.visibleKnowledgePoints, manifest.currentAuthority.sourceVisibleKnowledgePoints, manifest.currentAuthority.sourceHiddenKnowledgePoints, manifest.currentAuthority.gaps], [32, 231, 4, 2, 0]);
  assert.equal(manifest.implementation.prNumber, claim.implementationEvidence.prNumber);
  assert.equal(manifest.implementation.headSha, claim.implementationEvidence.headSha);
  assert.equal(manifest.implementation.mergeSha, claim.implementationEvidence.mergeSha);
  assert.equal(manifest.runtime.mainBlobSha, claim.implementationEvidence.runtimeBlobShaOnMain);
  assert.equal(manifest.productEvidence.artifactId, claim.implementationEvidence.productAcceptance.artifactId);
  assert.equal(manifest.productEvidence.artifactDigest, claim.implementationEvidence.productAcceptance.artifactDigest);
  assert.deepEqual([claim.mainReadback.publicSources, claim.mainReadback.visibleKnowledgePoints, claim.mainReadback.g4bU06VisibleKnowledgePoints, claim.mainReadback.g4bU06HiddenKnowledgePoints], [32, 231, 4, 2]);
});

test("P03F35 R00 trigger changes replay comment only and preserves historical test wording", () => {
  assert.match(r00Test, /P03F35 D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.workflow, "PGC-R00 Public Generation Scope Freeze");
  assert.equal(claim.canonical793Evidence.triggerPath, "tests/curriculum/pgc-r00-public-generation-scope.test.js");
  assert.equal(claim.canonical793Evidence.legalRouteCount, 793);
});

test("P03F35 closeout state machine accepts candidate or final D0 only", () => {
  if (claim.status === "D0_CLOSEOUT_CANDIDATE") {
    assert.equal(claim.goalDistance, "D1");
    assert.equal(manifest.status, "D0_CLOSEOUT_CANDIDATE");
    assert.equal(manifest.admissionState, "PENDING_D0_RECONCILIATION");
    assert.equal(claim.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.canonical793Evidence.status, "PENDING_CLOSEOUT_CANDIDATE_CI");
    assert.equal(manifest.productionAdmission.slice035Admitted, false);
    assert.equal(manifest.productionAdmission.slice036MayStart, false);
    assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
    assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice035_D0PostMergeReconciliation");
    return;
  }
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(claim.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([claim.canonical793Evidence.executedRouteCount, claim.canonical793Evidence.terminalRouteCount, claim.canonical793Evidence.passRouteCount, claim.canonical793Evidence.failRouteCount], [793, 793, 793, 0]);
  assert.deepEqual([manifest.canonical793Evidence.executed, manifest.canonical793Evidence.terminal, manifest.canonical793Evidence.pass, manifest.canonical793Evidence.fail], [793, 793, 793, 0]);
  assert.equal(manifest.productionAdmission.slice035Admitted, true);
  assert.equal(manifest.productionAdmission.slice036MayStart, true);
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice036Implementation");
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice036Implementation");
});
