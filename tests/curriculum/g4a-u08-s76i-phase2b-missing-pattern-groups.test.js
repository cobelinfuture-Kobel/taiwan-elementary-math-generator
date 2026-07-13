import test from "node:test";
import assert from "node:assert/strict";
import {
  generateG4AU08Phase2BBatch,
  generateG4AU08Phase2BItem,
  getG4AU08Phase2BTemplateIds
} from "../../src/curriculum/g4a-u08/phase2b-extension-generator.js";
import { getG4AU08ExtensionAdapterContracts } from "../../src/curriculum/g4a-u08/canonical-generated-item-adapter.js";
import {
  getG4AU08ExtensionValidatorContracts,
  getG4AU08ValidatorErrorCodes,
  validateG4AU08CanonicalItem
} from "../../src/curriculum/g4a-u08/canonical-validator-contract.js";

const TEMPLATE_IDS = [
  "tpl_ext_comparison_chain",
  "tpl_ext_equal_value_unit_price",
  "tpl_ext_relative_difference",
  "tpl_ext_two_cost_component_payment"
];

function clone(value) { return JSON.parse(JSON.stringify(value)); }

function recompute(item) {
  const o = item.operands;
  switch (item.legacyTemplateId) {
    case "tpl_ext_comparison_chain": return o[0] + o[1] - o[2];
    case "tpl_ext_equal_value_unit_price": return o[0] * o[1] / o[2];
    case "tpl_ext_relative_difference": return (o[1] - o[0]) * o[2];
    case "tpl_ext_two_cost_component_payment": return o[0] - (o[1] * o[2] + o[3] * o[4]);
    default: throw new Error(item.legacyTemplateId);
  }
}

test("S76I materializes exactly four hidden Phase2B PatternSpecs", () => {
  assert.deepEqual(getG4AU08Phase2BTemplateIds(), TEMPLATE_IDS);
  assert.deepEqual(Object.keys(getG4AU08ExtensionAdapterContracts()), TEMPLATE_IDS);
  assert.deepEqual(Object.keys(getG4AU08ExtensionValidatorContracts()), TEMPLATE_IDS);
  for (const contract of Object.values(getG4AU08ExtensionAdapterContracts())) {
    assert.match(contract.patternGroupId, /^pg_g4a_u08_ext_/);
    assert.match(contract.patternSpecId, /^ps_g4a_u08_ext_/);
    assert.ok(contract.requiredSemanticRelations.length >= 2);
  }
});

test("all four generators emit deterministic valid canonical items", () => {
  for (const templateId of TEMPLATE_IDS) {
    const a = generateG4AU08Phase2BItem({ templateId, seed: 7601 });
    const b = generateG4AU08Phase2BItem({ templateId, seed: 7601 });
    assert.deepEqual(a, b);
    assert.equal(validateG4AU08CanonicalItem(a).valid, true);
    assert.equal(a.answerModel.value, recompute(a));
    assert.equal(a.lifecycle.selectorVisibility, "hidden");
    assert.equal(a.lifecycle.canonicalRouting, "disabled");
    assert.equal(a.lifecycle.productionUse, "forbidden");
  }
});

test("comparison chain preserves more/less direction", () => {
  const item = generateG4AU08Phase2BItem({ templateId: "tpl_ext_comparison_chain", seed: 11 });
  assert.ok(item.intermediateValues.middleAmount > item.operands[0]);
  assert.ok(item.answerModel.value < item.intermediateValues.middleAmount);
  assert.deepEqual(item.semanticRelations, ["more_than", "less_than"]);
});

test("equal-value unit-price uses equal total value rather than equal unit price", () => {
  const item = generateG4AU08Phase2BItem({ templateId: "tpl_ext_equal_value_unit_price", seed: 12 });
  const [knownUnitPrice, knownQuantity, targetQuantity] = item.operands;
  assert.equal(knownUnitPrice * knownQuantity, item.answerModel.value * targetQuantity);
  assert.notEqual(knownQuantity, targetQuantity);
});

test("relative-difference uses difference, not sum", () => {
  const item = generateG4AU08Phase2BItem({ templateId: "tpl_ext_relative_difference", seed: 13 });
  assert.equal(item.answerModel.value, (item.operands[1] - item.operands[0]) * item.operands[2]);
  assert.notEqual(item.answerModel.value, (item.operands[1] + item.operands[0]) * item.operands[2]);
});

test("two-cost payment includes both cost components and stays nonnegative", () => {
  const item = generateG4AU08Phase2BItem({ templateId: "tpl_ext_two_cost_component_payment", seed: 14 });
  assert.equal(item.intermediateValues.totalCost, item.intermediateValues.componentCostA + item.intermediateValues.componentCostB);
  assert.ok(item.answerModel.value >= 0);
});

test("Phase2B semantic and reasoning mutations are blocking", () => {
  const codes = getG4AU08ValidatorErrorCodes();
  for (const templateId of TEMPLATE_IDS) {
    const item = clone(generateG4AU08Phase2BItem({ templateId, seed: 99 }));
    item.semanticRelations.reverse();
    item.unknownQuantityRole = "wrongUnknown";
    item.requiredOperationSequence = [...item.requiredOperationSequence].reverse();
    const resultCodes = new Set(validateG4AU08CanonicalItem(item).errors.map((entry) => entry.code));
    assert.ok(resultCodes.has(codes.SEMANTIC_RELATION_MISMATCH), templateId);
    assert.ok(resultCodes.has(codes.UNKNOWN_ROLE_MISMATCH), templateId);
    assert.ok(resultCodes.has(codes.OPERATION_SEQUENCE_MISMATCH), templateId);
  }
});

test("batch generation cycles all four PatternGroups without public routing", () => {
  const batch = generateG4AU08Phase2BBatch({ count: 12, seed: 200 });
  assert.equal(batch.length, 12);
  assert.deepEqual(new Set(batch.map((item) => item.legacyTemplateId)), new Set(TEMPLATE_IDS));
  assert.ok(batch.every((item) => item.lifecycle.canonicalRouting === "disabled"));
  assert.throws(() => generateG4AU08Phase2BBatch({ count: 0 }), /G4AU08_PHASE2B_COUNT_INVALID/);
  assert.throws(() => generateG4AU08Phase2BItem({ templateId: "unknown" }), /G4AU08_PHASE2B_TEMPLATE_UNMAPPED/);
});
