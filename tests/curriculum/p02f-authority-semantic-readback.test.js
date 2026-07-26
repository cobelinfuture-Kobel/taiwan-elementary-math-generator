import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";

const TARGET_IDS = [
  "kp_fraction_times_integer_quantity",
  "kp_mass_times_integer",
];

test("P02F reads exact Global semantic authority for both arithmetic KnowledgePoints", () => {
  const authority = materializeP02BGlobalAuthorityLookupConsumer();
  const rows = TARGET_IDS.map((knowledgePointId) => authority.getKnowledgePoint(knowledgePointId));
  for (const row of rows) assert.ok(row, `missing authority: ${row?.knowledgePointId}`);
  process.stdout.write(`P02F_AUTHORITY_READBACK ${JSON.stringify(rows.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    capabilityStatement: row.capabilityStatement,
    reasoningInvariant: row.reasoningInvariant,
    sourceNodeIds: row.sourceNodeIds,
    sourceRefs: row.sourceRefs,
  })))}\n`);
});
