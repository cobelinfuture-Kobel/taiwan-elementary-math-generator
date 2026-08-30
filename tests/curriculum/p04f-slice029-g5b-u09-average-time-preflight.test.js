import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const queue = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json", import.meta.url), "utf8"));
const authority = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p04f/slice029-g5b-u09-average-time-preflight-authority.json", import.meta.url), "utf8"));
const overrides = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p02e/quantity-semantic-role-overrides.json", import.meta.url), "utf8"));

const KP_ID = "kp_g5b_u09_average_time";
const SLICE_ID = "p04e_q029_r6_g5b_u09_5b09_profile_number_representation_c1";

test("P04F29 q029 exact frozen queue identity is rank 6 number-representation profile", () => {
  assert.equal(queue.orderedSliceIds[28], SLICE_ID);
  assert.equal(queue.orderedKnowledgePointIds[39], KP_ID);
  assert.equal(authority.queue.sliceId, SLICE_ID);
  assert.equal(authority.queue.queuePosition, 29);
  assert.equal(authority.queue.primaryRuntimeProfileId, "profile_number_representation");
  assert.equal(authority.reconciliation.frozenQueueProfileTime, false);
  assert.equal(authority.reconciliation.frozenQueueProfileNumberRepresentation, true);
});

test("P04F29 source witness locks number-line interval derivation before average-time division", () => {
  assert.deepEqual(authority.source.reviewedPages, [1, 2, 3]);
  assert.deepEqual(authority.source.primaryWitnessPages, [2]);
  assert.equal(authority.source.reviewMethod, "FULL_PAGE_VISUAL_READBACK");
  assert.ok(authority.source.page2Witness.some((row) => row.includes("座標相減")));
  assert.ok(authority.source.page2Witness.some((row) => row.includes("經過時間 ÷ 間隔數量")));
  assert.ok(authority.source.page2Witness.some((row) => row.includes("座標4") && row.includes("座標14") && row.includes("76分40秒")));
});

test("P04F29 FormalMapping candidate distinguishes derived interval count from q025 direct group count", () => {
  const mapping = authority.formalMappingCandidate;
  assert.equal(authority.knowledgePoints.length, 1);
  assert.equal(authority.knowledgePoints[0].knowledgePointId, KP_ID);
  assert.equal(mapping.relationFamilyId, "AVERAGE_TIME_PER_NUMBER_LINE_INTERVAL");
  assert.deepEqual(mapping.knownRoleIds, ["TOTAL_ELAPSED_TIME", "START_COORDINATE", "END_COORDINATE"]);
  assert.deepEqual(mapping.derivedRole, {
    roleId: "INTERVAL_COUNT",
    derivation: "END_COORDINATE - START_COORDINATE",
    mustBePositiveInteger: true,
  });
  assert.equal(mapping.targetRoleId, "AVERAGE_INTERVAL_TIME");
  assert.equal(mapping.arithmeticInvariant, "averageIntervalSeconds = totalElapsedSeconds / intervalCount");
  assert.equal(mapping.exactDivisionRequired, true);
  assert.equal(mapping.roundingAllowed, false);
  assert.equal(authority.reconciliation.q025RelationReusedDirectly, false);
  assert.equal(overrides.bindings.some((row) => row.knowledgePointId === KP_ID), false);
});

test("P04F29 remains planning-only and does not cross into q030 or implementation", () => {
  assert.equal(authority.boundary.patternSpecMaterialized, false);
  assert.equal(authority.boundary.generatorMaterialized, false);
  assert.equal(authority.boundary.validatorMaterialized, false);
  assert.equal(authority.boundary.selectorPromoted, false);
  assert.equal(authority.boundary.worksheetEnabled, false);
  assert.equal(authority.boundary.q030Touched, false);
  assert.equal(authority.boundary.implementationApprovalRequired, true);
});
