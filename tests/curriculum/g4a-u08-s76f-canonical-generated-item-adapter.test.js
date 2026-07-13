import test from "node:test";
import assert from "node:assert/strict";
import {
  adaptG4AU08LegacyItem,
  getG4AU08AdapterContracts
} from "../../src/curriculum/g4a-u08/canonical-generated-item-adapter.js";

const TEMPLATE_IDS = [
  "tpl_app_add_three_quantities",
  "tpl_app_add_then_subtract_state_change",
  "tpl_app_subtract_then_add_state_change",
  "tpl_app_subtract_twice_state_change",
  "tpl_app_adjusted_amount_then_subtract",
  "tpl_app_divide_by_group_product",
  "tpl_app_multiply_after_difference_then_add_sub",
  "tpl_app_multiply_then_share",
  "tpl_app_unit_rate_then_scale",
  "tpl_app_divide_then_divide",
  "tpl_app_payment_minus_unit_cost_times_quantity",
  "tpl_app_subtract_divided_amount_or_add_divided_amount"
];

function fixture(templateFamilyId, overrides = {}) {
  return {
    templateFamilyId,
    knowledgePointId: "legacy_kp",
    prompt: "測試題目",
    operands: [120, 6, 4],
    operations: ["÷", "×"],
    intermediateValues: { first: 20 },
    unitFlow: ["個", "組", "個"],
    semanticRelations: ["same_unit"],
    expression: "120 ÷ 6 × 4",
    answer: 80,
    context: { domain: "school" },
    seed: 7,
    ...overrides
  };
}

test("S76F exposes exactly 12 deterministic existing-scope adapter contracts", () => {
  const contracts = getG4AU08AdapterContracts();
  assert.deepEqual(Object.keys(contracts), TEMPLATE_IDS);
  assert.equal(Object.isFrozen(contracts), true);
  for (const contract of Object.values(contracts)) {
    assert.match(contract.knowledgePointId, /^kp_g4a_u08_/);
    assert.match(contract.patternGroupId, /^pg_g4a_u08_/);
    assert.match(contract.patternSpecId, /^ps_g4a_u08_/);
    assert.ok(contract.knownQuantityRoles.length >= 3);
    assert.ok(contract.requiredOperationSequence.length >= 2);
  }
});

test("all 12 existing templates adapt to the canonical item shape", () => {
  for (const templateFamilyId of TEMPLATE_IDS) {
    const item = adaptG4AU08LegacyItem(fixture(templateFamilyId));
    assert.equal(item.schemaName, "G4AU08CanonicalGeneratedItem");
    assert.equal(item.schemaVersion, 1);
    assert.equal(item.sourceId, "g4a_u08_4a08");
    assert.equal(item.unitCode, "4A-U08");
    assert.equal(item.legacyTemplateId, templateFamilyId);
    assert.equal(item.mode, "application");
    assert.match(item.knowledgePointId, /^kp_g4a_u08_/);
    assert.match(item.patternGroupId, /^pg_g4a_u08_/);
    assert.match(item.patternSpecId, /^ps_g4a_u08_/);
    assert.equal(typeof item.unknownQuantityRole, "string");
    assert.equal(item.lifecycle.adapterStatus, "implemented_hidden");
    assert.equal(item.lifecycle.validatorStatus, "implemented_hidden");
    assert.equal(item.lifecycle.canonicalRouting, "disabled");
    assert.equal(item.lifecycle.productionUse, "forbidden");
    assert.equal(Object.isFrozen(item), true);
    assert.equal(Object.isFrozen(item.lifecycle), true);
  }
});

test("adapter preserves legacy evidence while assigning canonical identity", () => {
  const item = adaptG4AU08LegacyItem(fixture("tpl_app_unit_rate_then_scale", {
    knowledgePointId: "kp_g4a_u08_app_mul_div_sequence",
    answerModel: { shape: "numeric", value: 80 },
    answer: undefined
  }));
  assert.equal(item.legacyKnowledgePointId, "kp_g4a_u08_app_mul_div_sequence");
  assert.equal(item.knowledgePointId, "kp_g4a_u08_app_mul_div_sequence");
  assert.equal(item.patternGroupId, "pg_g4a_u08_app_unit_rate_then_scale");
  assert.equal(item.patternSpecId, "ps_g4a_u08_app_unit_rate_then_scale");
  assert.deepEqual(item.answerModel, { shape: "numeric", value: 80 });
  assert.deepEqual(item.operands, [120, 6, 4]);
  assert.deepEqual(item.intermediateValues, { first: 20 });
  assert.deepEqual(item.unitFlow, ["個", "組", "個"]);
});

test("adapter blocks absent or unknown template identity", () => {
  assert.throws(() => adaptG4AU08LegacyItem(fixture(undefined, { templateFamilyId: undefined })), /G4AU08_ADAPTER_TEMPLATE_ID_MISSING/);
  assert.throws(() => adaptG4AU08LegacyItem(fixture("tpl_unknown")), /G4AU08_ADAPTER_TEMPLATE_UNMAPPED:tpl_unknown/);
});

test("adapter blocks missing prompt or answer instead of silently fabricating them", () => {
  assert.throws(() => adaptG4AU08LegacyItem(fixture("tpl_app_multiply_then_share", { prompt: "" })), /G4AU08_ADAPTER_PROMPT_MISSING/);
  assert.throws(() => adaptG4AU08LegacyItem(fixture("tpl_app_multiply_then_share", { answer: undefined, answerModel: undefined })), /G4AU08_ADAPTER_ANSWER_MISSING/);
});

test("canonical output is detached from mutable legacy input", () => {
  const legacy = fixture("tpl_app_payment_minus_unit_cost_times_quantity");
  const item = adaptG4AU08LegacyItem(legacy);
  legacy.operands[0] = 999;
  legacy.context.domain = "mutated";
  assert.equal(item.operands[0], 120);
  assert.equal(item.context.domain, "school");
});
