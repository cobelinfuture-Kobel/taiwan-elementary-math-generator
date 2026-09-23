import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));

const authority = readJson("data/curriculum/full-product/p03f/slice029-g5a-u04-rank8-fraction-authority.json");
const queue = readJson("data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const predecessor = readJson("data/curriculum/final-milestone-claims/p03f-w3-slice028-e6-d0-v1.json");
const knowledge = readJson("data/curriculum/knowledge/units/g5a_u04_5a04.knowledge-operation.json");
const operations = readJson("data/curriculum/application/operations/w02/g5a_u04_5a04.canonical-operation.json");
const hiddenSpecs = readJson("data/curriculum/application/pattern-specs/w02/g5a_u04_5a04.hidden-pattern-spec.json");

const TARGET_KP = "kp_g5a_u04_unlike_fraction_compare";
const TARGET_SPEC = "ps_g5a_u04_unlike_fraction_compare_comparison_numeric";
const HIDDEN_APPLICATION_SPEC = "ps_g5a_u04_unlike_fraction_compare_comparison_application";
const CAPS = ["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"];

test("P03F29 freezes exact queue position 29 after Slice028 D0", () => {
  assert.equal(queue.queueDigest, authority.queueAuthority.queueDigest);
  assert.equal(queue.orderedSliceIds[28], "p03e_q029_r8_g5a_u04_5a04_profile_fraction_c1");
  assert.equal(queue.orderedImplementationTaskIds[28], "P03F_W3DirectProductVerticalSlice029Implementation");
  assert.equal(authority.queueAuthority.queuePosition, 29);
  assert.equal(authority.queueAuthority.previousSliceId, queue.orderedSliceIds[27]);
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
});

test("P03F29 source evidence and canonical operation identify exactly one rank8 comparison KP", () => {
  const sourceKp = knowledge.knowledgePoints.find((row) => row.candidateId === TARGET_KP);
  const operationKp = operations.knowledgePoints.find((row) => row.knowledgePointId === TARGET_KP);
  assert.ok(sourceKp);
  assert.equal(sourceKp.applicationClassification, "APPLICATION_COMPATIBLE");
  assert.ok(operationKp);
  assert.equal(operationKp.operationModels.length, 1);
  assert.equal(operationKp.operationModels[0].operationFamilyId, "fraction_compare");
  assert.deepEqual(operationKp.operationModels[0].canonicalExpressions, [
    "comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)",
  ]);
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), [TARGET_KP]);
  assert.deepEqual(authority.knowledgePoints[0].requiredW3CapabilityIds, CAPS);
});

test("P03F29 admits only numeric PatternSpec and preserves application surface hidden", () => {
  const hiddenKp = hiddenSpecs.knowledgePoints.find((row) => row.knowledgePointId === TARGET_KP);
  assert.ok(hiddenKp);
  assert.ok(hiddenKp.patternSpecs.some((row) => row.patternSpecId === TARGET_SPEC && row.mode === "NUMERIC"));
  assert.ok(hiddenKp.patternSpecs.some((row) => row.patternSpecId === HIDDEN_APPLICATION_SPEC && row.mode === "APPLICATION"));
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId), [TARGET_SPEC]);
  assert.deepEqual(authority.hiddenApplicationSurfaces.map((row) => row.patternSpecId), [HIDDEN_APPLICATION_SPEC]);
  assert.equal(authority.productBoundary.applicationExpansionAllowed, false);
  assert.equal(authority.productBoundary.globalContextExpansionAllowed, false);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
});

test("P03F29 freezes current public projection at 29 sources / 220 KPs and G5A-U04 5 visible / 2 hidden", () => {
  assert.equal(authority.productBoundary.expectedPublicSourceCountAfterAdmission, 29);
  assert.equal(authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission, 220);
  assert.equal(authority.productBoundary.expectedSourceVisibleCountAfterAdmission, 5);
  assert.equal(authority.productBoundary.expectedSourceHiddenCountAfterAdmission, 2);
  assert.equal(authority.productBoundary.nextTask, "P03F_W3DirectProductVerticalSlice030Implementation");
});
