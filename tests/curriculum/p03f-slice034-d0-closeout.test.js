import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { BATCH_A_SELECTOR_AVAILABILITY, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-p03f34-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice034-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice034-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");
const sourceId = "g4a_u09_4a09";

test("P03F34 final D0 binds implementation, candidate and canonical evidence", () => {
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.authority.queuePosition, 34);
  assert.equal(claim.authority.sourceRef, sourceId);
  assert.deepEqual(claim.authority.knowledgePointIds, ["kp_g4a_u09_missing_digit_inequality"]);
  assert.deepEqual(claim.authority.patternSpecIds, ["ps_g4a_u09_missing_digit_inequality_possible_digits_numeric"]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_decimal_domain_validator", "cap_decimal_number_system"]);
  assert.equal(claim.implementationEvidence.prNumber, 585);
  assert.equal(claim.implementationEvidence.headSha, "da14347e0b7f16c0ff2ffb4758a2f478e971a855");
  assert.equal(claim.implementationEvidence.mergeSha, "190b809fb45606a85102d0027a00082efcde4cb4");
  assert.deepEqual([claim.implementationEvidence.node.tests, claim.implementationEvidence.node.pass, claim.implementationEvidence.node.fail], [3083, 3083, 0]);
  assert.equal(claim.implementationEvidence.productAcceptance.manualVisualReview.status, "PASS");
  assert.equal(claim.closeoutEvidence.candidatePrNumber, 586);
  assert.equal(claim.closeoutEvidence.candidateHeadSha, "3aed81f8ed9744b0189f91e878d1f228b54ed970");
  assert.equal(claim.closeoutEvidence.candidateMergeSha, "5010947e06a86c2c651c58b6bffd3d77e1dc714d");
  assert.deepEqual([claim.closeoutEvidence.candidateNodeTests, claim.closeoutEvidence.candidateNodePass, claim.closeoutEvidence.candidateNodeFail], [3088, 3088, 0]);
  assert.equal(claim.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([claim.canonical793Evidence.executedRouteCount, claim.canonical793Evidence.terminalRouteCount, claim.canonical793Evidence.passRouteCount, claim.canonical793Evidence.failRouteCount], [793, 793, 793, 0]);
  assert.equal(claim.canonical793Evidence.browserConsoleErrorCount, 0);
  assert.equal(claim.canonical793Evidence.browserPageErrorCount, 0);
  assert.equal(claim.canonical793Evidence.exitCode, 0);
});

test("P03F34 historical selector stays exactly 32 sources / 230 KPs while current Pixel advances through Slice050 to 254 KPs", () => {
  assert.deepEqual([BATCH_A_SELECTOR_AVAILABILITY.sourceCount, BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, BATCH_A_SELECTOR_AVAILABILITY.visibleCount], [32, 32, 230]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [7, 1, 0]);
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 33);
  assert.equal(pixel.visibleKnowledgePointCount, 254);
  assert.equal(pixel.bySourceId[sourceId].visibleKnowledgePoints.length, 7);
});

test("P03F34 final manifest admits only Slice034 and releases Slice035", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.goalDistance, "D0");
  assert.deepEqual([manifest.currentAuthority.publicSources, manifest.currentAuthority.visibleKnowledgePoints, manifest.currentAuthority.sourceVisibleKnowledgePoints, manifest.currentAuthority.sourceHiddenKnowledgePoints, manifest.currentAuthority.gaps], [32, 230, 7, 1, 0]);
  assert.equal(manifest.closeoutPr.number, 586);
  assert.equal(manifest.closeoutPr.mergeSha, "5010947e06a86c2c651c58b6bffd3d77e1dc714d");
  assert.equal(manifest.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([manifest.canonical793Evidence.executed, manifest.canonical793Evidence.terminal, manifest.canonical793Evidence.pass, manifest.canonical793Evidence.fail], [793, 793, 793, 0]);
  assert.equal(manifest.productionAdmission.slice034Admitted, true);
  assert.equal(manifest.productionAdmission.slice035MayStart, true);
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice035Implementation");
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice035Implementation");
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
});

test("P03F34 final R00 replay keeps a current trigger while preserving historical wording", () => {
  assert.match(r00Test, /P03F\d+ D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.artifactId, 9214954655);
  assert.equal(claim.canonical793Evidence.artifactDigest, "sha256:8f8a49c042041246196a24fe48eb78bcb2e7454b0e4c56f8dc23266f3df04988");
});