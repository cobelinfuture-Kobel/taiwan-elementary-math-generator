import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeW02AtomicContextSingleApplicationCandidatePack } from "../../src/curriculum/application/w02-atomic-context-single-application-candidate-pack.mjs";

const expectedKpIds = [
  "kp_g4a_u09_decimal_compare",
  "kp_g4a_u09_decimal_sequence",
  "kp_g4a_u09_missing_digit_column_operation",
  "kp_g4a_u09_place_value_factor_relation",
];

const expectedNumericPatternSpecIds = [
  "ps_g4a_u09_decimal_compare_comparison_numeric",
  "ps_g4a_u09_decimal_sequence_term_numeric",
  "ps_g4a_u09_missing_digit_column_operation_missing_digits_numeric",
  "ps_g4a_u09_place_value_factor_relation_higher_place_value_numeric",
  "ps_g4a_u09_place_value_factor_relation_lower_place_value_numeric",
];

const slice025Claim = JSON.parse(readFileSync(
  new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice025-e6-d0-v1.json", import.meta.url),
  "utf8",
));
const hidden = JSON.parse(readFileSync(
  new URL("../../data/curriculum/application/pattern-specs/w02/g4a_u09_4a09.hidden-pattern-spec.json", import.meta.url),
  "utf8",
));

test("P03F26 frozen queue position 26 is exact G4A-U09 rank-8 decimal cohort", () => {
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[25];

  assert.equal(slice.queuePosition, 26);
  assert.equal(slice.sliceId, "p03e_q026_r8_g4a_u09_4a09_profile_decimal_c1");
  assert.equal(slice.previousSliceId, "p03e_q025_r8_g4a_u06_4a06_profile_fraction_c1");
  assert.equal(slice.primarySourceNodeId, "g4a_u09_4a09");
  assert.equal(slice.intraWavePrerequisiteRank, 8);
  assert.equal(slice.primaryRuntimeProfileId, "profile_decimal");
  assert.deepEqual([...slice.knowledgePointIds].sort(), [...expectedKpIds].sort());
  assert.equal(slice.knowledgePointCount, 4);
  assert.equal(slice025Claim.status, "PASS_D0_CLOSED");
  assert.equal(slice025Claim.goalDistance, "D0");

  console.log(`P03F26_QUEUE=${JSON.stringify({
    queuePosition: slice.queuePosition,
    sliceId: slice.sliceId,
    previousSliceId: slice.previousSliceId,
    knowledgePointIds: slice.knowledgePointIds,
    requiredW3CapabilityIds: slice.requiredW3CapabilityIds,
    supportingSourceNodeIds: slice.supportingSourceNodeIds,
  })}`);
});

test("P03F26 source authority exposes exactly five numeric W02 PatternSpecs for the frozen cohort", () => {
  const rows = hidden.knowledgePoints.filter((row) => expectedKpIds.includes(row.knowledgePointId));
  assert.equal(rows.length, 4);

  const specs = rows.flatMap((row) => row.patternSpecs ?? []);
  const numericSpecs = specs.filter((row) => row.mode === "NUMERIC");
  assert.deepEqual(
    numericSpecs.map((row) => row.patternSpecId).sort(),
    [...expectedNumericPatternSpecIds].sort(),
  );
  assert.ok(numericSpecs.every((row) => row.lifecycle?.productionUse === "forbidden"));

  console.log(`P03F26_W02_PATTERN_AUTHORITY=${JSON.stringify({
    knowledgePointCount: rows.length,
    numericPatternSpecIds: numericSpecs.map((row) => row.patternSpecId),
    applicationPatternSpecIds: specs.filter((row) => row.mode === "APPLICATION").map((row) => row.patternSpecId),
  })}`);
});

test("P03F26 reports any existing W02 atomic application candidates without expanding context scope", () => {
  const pack = materializeW02AtomicContextSingleApplicationCandidatePack();
  const rows = pack.candidates
    .filter((row) => row.sourceId === "g4a_u09_4a09" && expectedKpIds.includes(row.knowledgePointId))
    .sort((a, b) => a.patternSpecId.localeCompare(b.patternSpecId));

  assert.ok(rows.every((row) => row.productionAdmissionAllowed === false));
  console.log(`P03F26_CONTEXTS=${JSON.stringify(rows.map((row) => ({
    bindingCandidateId: row.bindingCandidateId,
    itemCandidateId: row.itemCandidateId,
    knowledgePointId: row.knowledgePointId,
    patternSpecId: row.patternSpecId,
    requestedUnknownRole: row.requestedUnknownRole,
    contextSelection: row.contextSelection,
    roleBindingCandidates: row.roleBindingCandidates,
    targetRoleCandidate: row.targetRoleCandidate,
  })))}`);
});
