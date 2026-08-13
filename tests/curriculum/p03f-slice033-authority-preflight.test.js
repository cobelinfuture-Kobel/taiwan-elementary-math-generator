import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const authority = readJson("data/curriculum/full-product/p03f/slice033-g4a-u06-rank9-fraction-authority.json");
const queue = readJson("data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const predecessor = readJson("data/curriculum/final-milestone-claims/p03f-w3-slice032-e6-d0-v1.json");
const knowledge = readJson("data/curriculum/knowledge/units/g4a_u06_4a06.knowledge-operation.json");
const operations = readJson("data/curriculum/application/operations/w02/g4a_u06_4a06.canonical-operation.json");
const hiddenSpecs = readJson("data/curriculum/application/pattern-specs/w02/g4a_u06_4a06.hidden-pattern-spec.json");

const TARGET_KPS = [
  "kp_g4a_u06_fraction_compare_order",
  "kp_g4a_u06_fraction_number_line",
  "kp_g4a_u06_mixed_fraction_add_sub",
];
const QUEUE_ALIASES = [
  "kp_fraction_improper_mixed_compare_order",
  "kp_fraction_improper_mixed_number_line",
  "kp_fraction_same_denominator_mixed_add_sub",
];
const NUMERIC_SPECS = [
  "ps_g4a_u06_fraction_compare_order_comparison_numeric",
  "ps_g4a_u06_fraction_number_line_coordinate_numeric",
  "ps_g4a_u06_fraction_number_line_distance_numeric",
  "ps_g4a_u06_mixed_fraction_add_sub_result_numeric",
];
const HIDDEN_APPLICATION_SPECS = [
  "ps_g4a_u06_fraction_compare_order_comparison_application",
  "ps_g4a_u06_mixed_fraction_add_sub_result_application",
];
const CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];

function allHiddenSpecs() {
  return hiddenSpecs.knowledgePoints.flatMap((row) => row.patternSpecs);
}

test("P03F33 freezes queue position 33 only after Slice032 final D0", () => {
  assert.equal(queue.queueDigest, authority.queueAuthority.queueDigest);
  assert.equal(queue.orderedSliceIds[32], "p03e_q033_r9_g4a_u06_4a06_profile_fraction_c1");
  assert.equal(queue.orderedImplementationTaskIds[32], "P03F_W3DirectProductVerticalSlice033Implementation");
  assert.equal(authority.queueAuthority.queuePosition, 33);
  assert.equal(authority.queueAuthority.previousSliceId, queue.orderedSliceIds[31]);
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
  assert.equal(predecessor.progression.nextTask, "P03F_W3DirectProductVerticalSlice033Implementation");
  assert.ok(QUEUE_ALIASES.every((id) => queue.orderedKnowledgePointIds.includes(id)));
  assert.deepEqual(authority.queueAuthority.queueKnowledgePointAliases, QUEUE_ALIASES);
});

test("P03F33 maps the three rank9 queue aliases to the canonical G4A-U06 KPs", () => {
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), TARGET_KPS);
  assert.deepEqual(authority.knowledgePoints.map((row) => row.queueAliasId), QUEUE_ALIASES);
  for (const kpId of TARGET_KPS) {
    assert.ok(knowledge.knowledgePoints.some((row) => row.candidateId === kpId));
    const operation = operations.knowledgePoints.find((row) => row.knowledgePointId === kpId);
    assert.ok(operation);
    assert.equal(operation.operationModels.length, 1);
  }
  assert.equal(authority.knowledgePoints.some((row) => row.knowledgePointId === "kp_g4a_u06_fraction_times_integer_quantity"), false);
});

test("P03F33 freezes three shared fraction capabilities and four numeric PatternSpecs", () => {
  assert.deepEqual(authority.requiredW3CapabilityUnion, CAPS);
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId), NUMERIC_SPECS);
  const specs = allHiddenSpecs();
  for (const specId of NUMERIC_SPECS) {
    const spec = specs.find((row) => row.patternSpecId === specId);
    assert.ok(spec, specId);
    assert.equal(spec.mode, "NUMERIC");
  }
  assert.deepEqual(authority.hiddenApplicationLineage.map((row) => row.patternSpecId), HIDDEN_APPLICATION_SPECS);
  for (const specId of HIDDEN_APPLICATION_SPECS) {
    const spec = specs.find((row) => row.patternSpecId === specId);
    assert.ok(spec, specId);
    assert.equal(spec.mode, "APPLICATION");
    assert.equal(spec.lifecycle.productionUse, "forbidden");
  }
});

test("P03F33 keeps Global Context and fraction-times-integer outside the rank9 product boundary", () => {
  assert.equal(authority.productBoundary.applicationExpansionAllowed, false);
  assert.equal(authority.productBoundary.globalContextExpansionAllowed, false);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
  assert.equal(authority.formalMappingBoundary.fractionTimesIntegerQuantityRequired, false);
  assert.equal(authority.formalMappingBoundary.compareOrderRequired, true);
  assert.equal(authority.formalMappingBoundary.fractionNumberLineRequired, true);
  assert.equal(authority.formalMappingBoundary.sameDenominatorMixedAddSubRequired, true);
});

test("P03F33 is an additive existing-source projection targeting 32 sources / 229 KPs", () => {
  assert.equal(authority.productBoundary.publicSourceAlreadyExists, true);
  assert.equal(authority.productBoundary.newPublicSourceAllowed, false);
  assert.deepEqual([
    authority.productBoundary.expectedSourceVisibleCountBeforeAdmission,
    authority.productBoundary.expectedSourceVisibleCountAfterAdmission,
    authority.productBoundary.expectedSourceHiddenCountBeforeAdmission,
    authority.productBoundary.expectedSourceHiddenCountAfterAdmission,
  ], [2, 5, 4, 1]);
  assert.deepEqual([
    authority.productBoundary.expectedPublicSourceCountBeforeAdmission,
    authority.productBoundary.expectedPublicSourceCountAfterAdmission,
    authority.productBoundary.expectedCurrentPublicKnowledgePointCountBeforeAdmission,
    authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission,
  ], [32, 32, 226, 229]);
  assert.equal(authority.productBoundary.nextSliceMayStartBeforeD0Closeout, false);
  assert.equal(authority.productBoundary.nextTask, "P03F_W3DirectProductVerticalSlice034Implementation");
});
