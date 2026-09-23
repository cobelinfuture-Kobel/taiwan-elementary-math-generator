import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { BATCH_A_SELECTOR_AVAILABILITY, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-p03f35-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const claim = JSON.parse(readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice035-e6-d0-v1.json", import.meta.url), "utf8"));
const manifest = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice035-product-admission.manifest.json", import.meta.url), "utf8"));
const r00Test = readFileSync(new URL("./pgc-r00-public-generation-scope.test.js", import.meta.url), "utf8");
const sourceId = "g4b_u06_4b06";

test("P03F35 final D0 binds implementation, candidate and canonical 793 evidence", () => {
  assert.equal(claim.status, "PASS_D0_CLOSED");
  assert.equal(claim.goalDistance, "D0");
  assert.equal(claim.authority.queuePosition, 35);
  assert.equal(claim.authority.sourceRef, sourceId);
  assert.deepEqual(claim.authority.knowledgePointIds, ["kp_g4b_u06_decimal_scale_ten_hundred"]);
  assert.deepEqual(claim.authority.patternSpecIds, ["ps_g4b_u06_decimal_scale_ten_hundred_result_numeric"]);
  assert.deepEqual(claim.authority.requiredCapabilityIds, ["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"]);
  assert.equal(claim.implementationEvidence.prNumber, 588);
  assert.equal(claim.implementationEvidence.headSha, "088d3220d4760962f046ef957c01c1d19900d6b4");
  assert.equal(claim.implementationEvidence.mergeSha, "af64cb90c5da3cf46812dd34a505255b52f7954a");
  assert.deepEqual([claim.implementationEvidence.node.tests, claim.implementationEvidence.node.pass, claim.implementationEvidence.node.fail], [3095, 3095, 0]);
  assert.equal(claim.closeoutEvidence.candidatePrNumber, 589);
  assert.equal(claim.closeoutEvidence.candidateHeadSha, "8fdfbbc1edf5f19f1d9a1bc3d6f7c7ec896e5697");
  assert.equal(claim.closeoutEvidence.candidateMergeSha, "f4a56d4fd35ed0d69cf2174b68e62ac427acfd01");
  assert.deepEqual([claim.closeoutEvidence.candidateNodeTests, claim.closeoutEvidence.candidateNodePass, claim.closeoutEvidence.candidateNodeFail], [3100, 3100, 0]);
  assert.equal(claim.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([claim.canonical793Evidence.executedRouteCount, claim.canonical793Evidence.terminalRouteCount, claim.canonical793Evidence.passRouteCount, claim.canonical793Evidence.failRouteCount], [793, 793, 793, 0]);
  assert.equal(claim.canonical793Evidence.browserConsoleErrorCount, 0);
  assert.equal(claim.canonical793Evidence.browserPageErrorCount, 0);
  assert.equal(claim.canonical793Evidence.exitCode, 0);
});

test("P03F35 final D0 binds repaired Main Pages deployment and Slice035-specific live E2E", () => {
  const repair = claim.postMergeRepairEvidence;
  assert.equal(repair.prNumber, 591);
  assert.equal(repair.headSha, "0ef2e629802489a9e756c6afb4a4791000db3d70");
  assert.equal(repair.mergeSha, "3715ac02f993f8cc5a0d09e5599c427f788a3251");
  assert.deepEqual([repair.nodeTests, repair.nodePass, repair.nodeFail, repair.nodeSkipped], [3102, 3102, 0, 0]);
  assert.equal(repair.pagesRunId, 31856970854);
  assert.equal(repair.status, "PASS_CI_SYNCED_MERGED_AND_DEPLOYED");

  const e2e = claim.livePagesE2E;
  assert.equal(e2e.prNumber, 590);
  assert.equal(e2e.headSha, "6b1694c26e0853d7cb4c01e10cc6406d57cf978c");
  assert.equal(e2e.runId, 31857211537);
  assert.equal(e2e.jobId, 94944155998);
  assert.equal(e2e.artifactId, 9239414014);
  assert.equal(e2e.artifactDigest, "sha256:2a1000d63c5737047e87f8226e2cb0fc407fa466ab1e8a7e065c19a0d21bd012");
  assert.equal(e2e.status, "PASS_P03F35_POSTMERGE_MAIN_PAGES_E2E");
  assert.equal(e2e.exactMergeSha, repair.mergeSha);
  assert.equal(e2e.exactPagesRunId, repair.pagesRunId);
  assert.deepEqual([e2e.questionCount, e2e.answerCount, e2e.questionPageCount, e2e.answerPageCount], [24, 24, 3, 3]);
  assert.deepEqual(e2e.factorCounts, {"10": 6, "100": 6, "0.1": 6, "0.01": 6});
  for (const key of ["exactAnswerMismatchCount", "consoleErrorCount", "pageErrorCount", "requestFailureCount", "serverErrorCount"]) assert.equal(e2e[key], 0, key);
  assert.equal(e2e.printInvocationCount, 1);
  assert.equal(e2e.sharedRenderer, true);
  assert.equal(e2e.applicationExpansion, false);
  assert.equal(e2e.globalContextExpansion, false);
  assert.equal(e2e.parallelPipeline, false);
  assert.equal(e2e.siblingKnowledgePointPromotion, false);
  assert.equal(e2e.slice036Started, false);
});

test("P03F35 historical selector stays exactly 32 sources / 231 KPs while current Pixel remains monotonic", () => {
  assert.deepEqual([BATCH_A_SELECTOR_AVAILABILITY.sourceCount, BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, BATCH_A_SELECTOR_AVAILABILITY.visibleCount], [32, 32, 231]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [4, 2, 0]);
  const pixel = getCurrentPixelRegistrySnapshot();
  assert.equal(pixel.sourceCount, 35);
  assert.ok(pixel.visibleKnowledgePointCount >= 231);
  assert.ok(pixel.bySourceId[sourceId].visibleKnowledgePoints.length >= 4);
});

test("P03F35 final manifest admits only Slice035 and releases Slice036", () => {
  assert.equal(manifest.status, "PASS_CI_SYNCED_AND_MERGED");
  assert.equal(manifest.admissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(manifest.goalDistance, "D0");
  assert.deepEqual([manifest.currentAuthority.publicSources, manifest.currentAuthority.visibleKnowledgePoints, manifest.currentAuthority.sourceVisibleKnowledgePoints, manifest.currentAuthority.sourceHiddenKnowledgePoints, manifest.currentAuthority.gaps], [32, 231, 4, 2, 0]);
  assert.equal(manifest.closeoutPr.number, 589);
  assert.equal(manifest.closeoutPr.mergeSha, "f4a56d4fd35ed0d69cf2174b68e62ac427acfd01");
  assert.equal(manifest.canonical793Evidence.status, "PASS_ALL_793_LEGAL_ROUTES");
  assert.deepEqual([manifest.canonical793Evidence.executed, manifest.canonical793Evidence.terminal, manifest.canonical793Evidence.pass, manifest.canonical793Evidence.fail], [793, 793, 793, 0]);
  assert.equal(manifest.postMergeRepair.prNumber, 591);
  assert.equal(manifest.livePagesE2E.runId, 31857211537);
  assert.equal(manifest.productionAdmission.slice035Admitted, true);
  assert.equal(manifest.productionAdmission.slice036MayStart, true);
  assert.equal(manifest.nextResumeTask, "P03F_W3DirectProductVerticalSlice036Implementation");
  assert.equal(claim.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice036Implementation");
  assert.equal(claim.progression.nextSliceMayStartBeforeD0Closeout, false);
});

test("P03F35 final R00 replay keeps a current trigger while preserving historical wording", () => {
  assert.match(r00Test, /P03F\d+ D0 closeout replay trigger/);
  assert.match(r00Test, /current public sources may extend through Slice033/);
  assert.equal(claim.canonical793Evidence.artifactId, 9226704544);
  assert.equal(claim.canonical793Evidence.artifactDigest, "sha256:969da834174419d164ce724bbc0ee9bca267d0d82ce2c6a484f5b0dd0938058c");
});
