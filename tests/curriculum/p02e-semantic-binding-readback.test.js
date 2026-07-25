import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02EQuantitySemanticRoleBindingConsumer } from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";

test("P02E emits the complete semantic binding map for exact-head review", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const mapping = runtime.bindings.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    relationFamilyId: row.relationFamilyId,
    targetRoleId: row.targetRoleId,
    targetRoleMode: row.targetRoleMode,
    dimensionId: row.dimensionId,
  }));
  assert.equal(mapping.length, 26);
  process.stdout.write(`P02E_BINDING_READBACK ${JSON.stringify(mapping)}\n`);
});
