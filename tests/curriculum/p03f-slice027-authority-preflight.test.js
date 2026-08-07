import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readJson = (relative) => JSON.parse(readFileSync(new URL(`../../${relative}`, import.meta.url), "utf8"));

const authority = readJson("data/curriculum/full-product/p03f/slice027-g4b-u08-rank8-fraction-authority.json");
const queue = readJson("data/curriculum/full-product/p03e/w3-direct-product-vertical-slice-queue.json");
const predecessor = readJson("data/curriculum/final-milestone-claims/p03f-w3-slice026-e6-d0-v1.json");
const canonical = readJson("data/curriculum/application/operations/w02/g4b_u08_4b08.canonical-operation.json");
const hidden = readJson("data/curriculum/application/pattern-specs/w02/g4b_u08_4b08.hidden-pattern-spec.json");

const TARGET_KPS = [
  "kp_g4b_u08_fraction_compare_cross_product",
  "kp_g4b_u08_unlike_denominator_add_sub",
];
const NUMERIC_SPECS = [
  "ps_g4b_u08_fraction_compare_cross_product_comparison_numeric",
  "ps_g4b_u08_unlike_denominator_add_sub_result_numeric",
];
const APPLICATION_SPECS = [
  "ps_g4b_u08_fraction_compare_cross_product_comparison_application",
  "ps_g4b_u08_unlike_denominator_add_sub_result_application",
];
const CAPS = [
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
];

function patternSpecsFor(kpId) {
  const row = hidden.knowledgePoints.find((candidate) => candidate.knowledgePointId === kpId);
  return row?.patternSpecs ?? [];
}

test("P03F27 frozen queue identity and predecessor D0 are exact", () => {
  assert.equal(queue.orderedSliceIds[26], "p03e_q027_r8_g4b_u08_4b08_profile_fraction_c1");
  assert.equal(queue.orderedImplementationTaskIds[26], "P03F_W3DirectProductVerticalSlice027Implementation");
  assert.equal(authority.queueAuthority.queuePosition, 27);
  assert.equal(authority.queueAuthority.sliceId, queue.orderedSliceIds[26]);
  assert.equal(authority.queueAuthority.previousSliceId, queue.orderedSliceIds[25]);
  assert.equal(authority.queueAuthority.queueDigest, queue.queueDigest);
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
  assert.equal(predecessor.productResult.productAdmissionState, "PRODUCTION_ADMITTED_D0");
  assert.equal(predecessor.closeoutEvidence.mergeSha, "f2cdbedfd57acd9fde8aa4b6d03c73750cb03cc5");
});

test("P03F27 exact two-KP rank-8 chunk is source-evidenced and canonically modeled", () => {
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), TARGET_KPS);
  const canonicalRows = canonical.knowledgePoints.filter((row) => TARGET_KPS.includes(row.knowledgePointId));
  assert.equal(canonicalRows.length, 2);
  assert.deepEqual(canonicalRows.map((row) => row.knowledgePointId), TARGET_KPS);
  assert.deepEqual(canonicalRows.map((row) => row.operationModels[0].operationFamilyId), ["fraction_compare", "fraction_add_sub"]);
  for (const row of authority.knowledgePoints) {
    assert.equal(row.applicationClassification, "APPLICATION_COMPATIBLE");
    assert.deepEqual(row.publicModes, ["numeric"]);
    assert.deepEqual(row.requiredW3CapabilityIds, CAPS);
  }
});

test("P03F27 admits numeric PatternSpecs only and preserves both application PatternSpecs hidden", () => {
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId), NUMERIC_SPECS);
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternGroupId), [
    "pg_g4b_u08_fraction_compare_cross_product_numeric",
    "pg_g4b_u08_unlike_denominator_add_sub_numeric",
  ]);
  assert.deepEqual(authority.hiddenApplicationLineage.map((row) => row.patternSpecId), APPLICATION_SPECS);
  for (const kpId of TARGET_KPS) {
    const specs = patternSpecsFor(kpId);
    const numeric = specs.find((row) => row.mode === "NUMERIC");
    const application = specs.find((row) => row.mode === "APPLICATION");
    assert.ok(numeric);
    assert.ok(application);
    assert.equal(numeric.lifecycle.productionUse, "forbidden");
    assert.equal(application.lifecycle.productionUse, "forbidden");
    assert.equal(application.presentationContract.contextRequired, true);
    assert.equal(application.presentationContract.contextBindingState, "PENDING_GLOBAL_ATOMIC_EPISODE_BINDING");
  }
  assert.equal(authority.productBoundary.applicationExpansionAllowed, false);
  assert.equal(authority.productBoundary.globalContextExpansionAllowed, false);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
});

test("P03F27 current product boundary expands existing G4B-U08 without adding a source", () => {
  assert.equal(authority.productBoundary.publicSourceAlreadyExists, true);
  assert.equal(authority.productBoundary.newPublicSourceAllowed, false);
  assert.equal(authority.productBoundary.reuseSlice005G4BU08Source, true);
  assert.equal(authority.productBoundary.reuseSlice012G4BU08Source, true);
  assert.equal(authority.productBoundary.reuseSlice020G4BU08Source, true);
  assert.equal(authority.productBoundary.expectedSourceVisibleCountAfterAdmission, 5);
  assert.equal(authority.productBoundary.expectedSourceHiddenCountAfterAdmission, 2);
  assert.equal(authority.productBoundary.expectedPublicSourceCountAfterAdmission, 29);
  assert.equal(authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission, 218);
  assert.equal(authority.productBoundary.nextTask, "P03F_W3DirectProductVerticalSlice028Implementation");
});
