import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const authority = readJson("data/curriculum/full-product/p03f/slice030-g5a-u06-rank8-fraction-authority.json");
const queue = readJson("data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const predecessor = readJson("data/curriculum/final-milestone-claims/p03f-w3-slice029-e6-d0-v1.json");
const knowledge = readJson("data/curriculum/knowledge/units/g5a_u06_5a06.knowledge-operation.json");
const operations = readJson("data/curriculum/application/operations/w02/g5a_u06_5a06.canonical-operation.json");
const hiddenSpecs = readJson("data/curriculum/application/pattern-specs/w02/g5a_u06_5a06.hidden-pattern-spec.json");

const TARGET_KPS = [
  "kp_g5a_u06_reciprocal_unit_fraction_sum",
  "kp_g5a_u06_unlike_fraction_add",
  "kp_g5a_u06_unlike_fraction_compare",
  "kp_g5a_u06_unlike_fraction_sub",
];
const TARGET_SPECS = [
  "ps_g5a_u06_reciprocal_unit_fraction_sum_sum_numeric",
  "ps_g5a_u06_unlike_fraction_add_result_numeric",
  "ps_g5a_u06_unlike_fraction_compare_comparison_numeric",
  "ps_g5a_u06_unlike_fraction_sub_result_numeric",
];
const CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];

test("P03F30 freezes queue position 30 only after Slice029 final D0", () => {
  assert.equal(queue.queueDigest, authority.queueAuthority.queueDigest);
  assert.equal(queue.orderedSliceIds[29], "p03e_q030_r8_g5a_u06_5a06_profile_fraction_c1");
  assert.equal(queue.orderedImplementationTaskIds[29], "P03F_W3DirectProductVerticalSlice030Implementation");
  assert.equal(authority.queueAuthority.queuePosition, 30);
  assert.equal(authority.queueAuthority.previousSliceId, queue.orderedSliceIds[28]);
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.postMergeReconciliationPr, 571);
});

test("P03F30 admits exactly the four rank8 G5A-U06 direct W3 KPs", () => {
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), TARGET_KPS);
  for (const kpId of TARGET_KPS) {
    assert.ok(knowledge.knowledgePoints.some((row) => row.candidateId === kpId));
    const op = operations.knowledgePoints.find((row) => row.knowledgePointId === kpId);
    assert.ok(op);
    assert.equal(op.operationModels.length, 1);
    assert.deepEqual(authority.knowledgePoints.find((row) => row.knowledgePointId === kpId).requiredW3CapabilityIds, CAPS);
  }
  assert.equal(authority.knowledgePoints.some((row) => row.knowledgePointId === "kp_g5a_u06_mixed_improper_add_sub"), false);
  assert.equal(authority.knowledgePoints.some((row) => row.knowledgePointId === "kp_g5a_u06_measurement_difference_context"), false);
  assert.equal(authority.knowledgePoints.some((row) => row.knowledgePointId === "kp_g5a_u06_missing_addend_structure"), false);
});

test("P03F30 admits four numeric specs and keeps compatible application specs hidden", () => {
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId), TARGET_SPECS);
  for (const specId of TARGET_SPECS) {
    assert.ok(hiddenSpecs.knowledgePoints.some((kp) => kp.patternSpecs.some((row) => row.patternSpecId === specId && row.mode === "NUMERIC")));
  }
  assert.deepEqual(authority.hiddenApplicationLineage.map((row) => row.patternSpecId).sort(), [
    "ps_g5a_u06_unlike_fraction_add_result_application",
    "ps_g5a_u06_unlike_fraction_compare_comparison_application",
    "ps_g5a_u06_unlike_fraction_sub_result_application",
  ].sort());
  assert.equal(authority.productBoundary.applicationExpansionAllowed, false);
  assert.equal(authority.productBoundary.globalContextExpansionAllowed, false);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
});

test("P03F30 freezes new-source projection at 30 sources / 224 KPs and G5A-U06 4 visible / 3 hidden", () => {
  assert.equal(authority.productBoundary.publicSourceAlreadyExists, false);
  assert.equal(authority.productBoundary.newPublicSourceAllowed, true);
  assert.equal(authority.productBoundary.expectedPublicSourceCountAfterAdmission, 30);
  assert.equal(authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission, 224);
  assert.equal(authority.productBoundary.expectedSourceVisibleCountAfterAdmission, 4);
  assert.equal(authority.productBoundary.expectedSourceHiddenCountAfterAdmission, 3);
  assert.equal(authority.productBoundary.nextTask, "P03F_W3DirectProductVerticalSlice031Implementation");
});
