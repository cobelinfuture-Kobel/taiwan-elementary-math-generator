import test from "node:test";
import assert from "node:assert/strict";

import { getR05DeliveryWaveAssignment } from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";

const TARGET_KNOWLEDGE_POINT_IDS = Object.freeze([
  "kp_g6a_u04_decimal_divided_by_decimal",
  "kp_g6a_u04_decimal_division_decimal_shift",
  "kp_g6a_u04_decimal_division_quotient_precision",
  "kp_g6a_u04_decimal_division_rate_application",
  "kp_g6a_u04_decimal_division_rounding",
]);

test("P03F51 recovers canonical R05 G6A-U04 assignment rows before Slice051 implementation", () => {
  const rows = TARGET_KNOWLEDGE_POINT_IDS.map((knowledgePointId) => {
    const row = getR05DeliveryWaveAssignment(knowledgePointId);
    assert.ok(row, `missing R05 assignment: ${knowledgePointId}`);
    assert.equal(row.primaryRuntimeProfileId, "profile_decimal");
    assert.ok(row.sourceNodeIds.includes("g6a_u04_6a04"));
    assert.equal(Number.isInteger(row.intraWavePrerequisiteRank), true);
    return {
      knowledgePointId: row.knowledgePointId,
      intraWavePrerequisiteRank: row.intraWavePrerequisiteRank,
      primaryRuntimeProfileId: row.primaryRuntimeProfileId,
      sourceNodeIds: row.sourceNodeIds,
    };
  });

  assert.equal(rows.length, 5);
  console.log(`P03F51_R05_G6A_U04_ASSIGNMENTS=${JSON.stringify(rows)}`);
});
