import test from "node:test";
import assert from "node:assert/strict";

import { getR05DeliveryWaveAssignment } from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import { listP03EW3DirectProductVerticalSlices } from "../../src/curriculum/full-product/p03e-w3-direct-product-vertical-slice-queue.mjs";

const TARGET_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g6a_u04_decimal_divided_by_decimal",
  "kp_g6a_u04_decimal_division_decimal_shift",
  "kp_g6a_u04_decimal_division_quotient_precision",
  "kp_g6a_u04_decimal_division_rate_application",
  "kp_g6a_u04_decimal_division_rounding",
]);

const EXPECTED_R05_ASSIGNMENTS = Object.freeze([
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_divided_by_decimal",
    intraWavePrerequisiteRank: 11,
    primaryRuntimeProfileId: "profile_decimal",
    sourceNodeIds: Object.freeze(["g6a_u04_6a04"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_decimal_shift",
    intraWavePrerequisiteRank: 12,
    primaryRuntimeProfileId: "profile_decimal",
    sourceNodeIds: Object.freeze(["g6a_u04_6a04"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_quotient_precision",
    intraWavePrerequisiteRank: 12,
    primaryRuntimeProfileId: "profile_decimal",
    sourceNodeIds: Object.freeze(["g6a_u04_6a04"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_rate_application",
    intraWavePrerequisiteRank: 12,
    primaryRuntimeProfileId: "profile_decimal",
    sourceNodeIds: Object.freeze(["g6a_u04_6a04"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_rounding",
    intraWavePrerequisiteRank: 13,
    primaryRuntimeProfileId: "profile_decimal",
    sourceNodeIds: Object.freeze(["g6a_u04_6a04"]),
  }),
]);

const EXPECTED_TARGET_QUEUE_MEMBERSHIP = Object.freeze([
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_divided_by_decimal",
    queuePosition: 51,
    intraWavePrerequisiteRank: 11,
    sliceId: "p03e_q051_r11_g6a_u04_6a04_profile_decimal_c1",
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_decimal_shift",
    queuePosition: 52,
    intraWavePrerequisiteRank: 12,
    sliceId: "p03e_q052_r12_g6a_u04_6a04_profile_decimal_c1",
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_quotient_precision",
    queuePosition: 52,
    intraWavePrerequisiteRank: 12,
    sliceId: "p03e_q052_r12_g6a_u04_6a04_profile_decimal_c1",
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_rate_application",
    queuePosition: 52,
    intraWavePrerequisiteRank: 12,
    sliceId: "p03e_q052_r12_g6a_u04_6a04_profile_decimal_c1",
  }),
  Object.freeze({
    knowledgePointId: "kp_g6a_u04_decimal_division_rounding",
    queuePosition: 53,
    intraWavePrerequisiteRank: 13,
    sliceId: "p03e_q053_r13_g6a_u04_6a04_profile_decimal_c1",
  }),
]);

test("P03F51 locks exact R05 G6A-U04 ranks and frozen Slice051 membership", () => {
  const rows = TARGET_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => {
    const row = getR05DeliveryWaveAssignment(knowledgePointId);
    assert.ok(row, `missing R05 assignment: ${knowledgePointId}`);
    return {
      knowledgePointId: row.knowledgePointId,
      intraWavePrerequisiteRank: row.intraWavePrerequisiteRank,
      primaryRuntimeProfileId: row.primaryRuntimeProfileId,
      sourceNodeIds: [...row.sourceNodeIds],
    };
  });

  assert.deepEqual(rows, EXPECTED_R05_ASSIGNMENTS.map((row) => ({
    ...row,
    sourceNodeIds: [...row.sourceNodeIds],
  })));

  const queueEntries = listP03EW3DirectProductVerticalSlices();
  const q051 = queueEntries.find((entry) => entry.queuePosition === 51);
  assert.ok(q051, "missing frozen q051 queue entry");
  assert.deepEqual({
    queuePosition: q051.queuePosition,
    sliceId: q051.sliceId,
    implementationTaskId: q051.implementationTaskId,
    primarySourceNodeId: q051.primarySourceNodeId,
    intraWavePrerequisiteRank: q051.intraWavePrerequisiteRank,
    primaryRuntimeProfileId: q051.primaryRuntimeProfileId,
    chunkIndex: q051.chunkIndex,
    knowledgePointIds: [...q051.knowledgePointIds],
  }, {
    queuePosition: 51,
    sliceId: "p03e_q051_r11_g6a_u04_6a04_profile_decimal_c1",
    implementationTaskId: "P03F_W3DirectProductVerticalSlice051Implementation",
    primarySourceNodeId: "g6a_u04_6a04",
    intraWavePrerequisiteRank: 11,
    primaryRuntimeProfileId: "profile_decimal",
    chunkIndex: 1,
    knowledgePointIds: ["kp_g6a_u04_decimal_divided_by_decimal"],
  });

  const targetQueueMembership = TARGET_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => {
    const matches = queueEntries.filter((entry) => entry.knowledgePointIds.includes(knowledgePointId));
    assert.equal(matches.length, 1, `expected one frozen queue assignment: ${knowledgePointId}`);
    const [entry] = matches;
    return {
      knowledgePointId,
      queuePosition: entry.queuePosition,
      intraWavePrerequisiteRank: entry.intraWavePrerequisiteRank,
      sliceId: entry.sliceId,
    };
  });

  assert.deepEqual(targetQueueMembership, EXPECTED_TARGET_QUEUE_MEMBERSHIP.map((row) => ({ ...row })));
});
