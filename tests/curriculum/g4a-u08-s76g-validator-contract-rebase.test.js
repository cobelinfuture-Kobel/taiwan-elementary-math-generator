import test from "node:test";
import assert from "node:assert/strict";
import { adaptG4AU08LegacyItem, getG4AU08AdapterContracts } from "../../src/curriculum/g4a-u08/canonical-generated-item-adapter.js";
import {
  assertValidG4AU08CanonicalItem,
  getG4AU08ValidatorContracts,
  getG4AU08ValidatorErrorCodes,
  validateG4AU08CanonicalItem
} from "../../src/curriculum/g4a-u08/canonical-validator-contract.js";

function legacy(templateId) {
  return {
    templateFamilyId: templateId,
    knowledgePointId: "legacy_anchor",
    prompt: "測試題目",
    answer: 42,
    operands: [6, 7],
    intermediateValues: {},
    unitFlow: { input: "個", output: "個" },
    semanticRelations: ["controlled"],
    seed: 76
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const contracts = getG4AU08AdapterContracts();
const errorCodes = getG4AU08ValidatorErrorCodes();

test("S76G exposes exactly the 12 S76F validator contracts", () => {
  assert.equal(Object.keys(getG4AU08ValidatorContracts()).length, 12);
  assert.deepEqual(Object.keys(getG4AU08ValidatorContracts()).sort(), Object.keys(contracts).sort());
});

test("all 12 canonical adapter outputs pass the rebased contract", () => {
  for (const templateId of Object.keys(contracts)) {
    const item = adaptG4AU08LegacyItem(legacy(templateId));
    const result = validateG4AU08CanonicalItem(item);
    assert.equal(result.valid, true, `${templateId}: ${JSON.stringify(result.errors)}`);
    assert.equal(assertValidG4AU08CanonicalItem(item), item);
  }
});

test("identity mutations are blocking", () => {
  const item = clone(adaptG4AU08LegacyItem(legacy("tpl_app_unit_rate_then_scale")));
  item.knowledgePointId = "kp_wrong";
  item.patternGroupId = "pg_wrong";
  item.patternSpecId = "ps_wrong";
  item.reasoningRole = "wrong_role";
  const codes = new Set(validateG4AU08CanonicalItem(item).errors.map((entry) => entry.code));
  assert.ok(codes.has(errorCodes.KP_MISMATCH));
  assert.ok(codes.has(errorCodes.PATTERN_GROUP_MISMATCH));
  assert.ok(codes.has(errorCodes.PATTERN_SPEC_MISMATCH));
  assert.ok(codes.has(errorCodes.REASONING_ROLE_MISMATCH));
});

test("known, unknown, operation and intermediate role mutations are blocking", () => {
  const item = clone(adaptG4AU08LegacyItem(legacy("tpl_app_multiply_then_share")));
  item.knownQuantityRoles.reverse();
  item.unknownQuantityRole = "totalAmount";
  item.requiredOperationSequence = ["÷", "×"];
  item.requiredIntermediateQuantities = [];
  const codes = new Set(validateG4AU08CanonicalItem(item).errors.map((entry) => entry.code));
  assert.ok(codes.has(errorCodes.KNOWN_ROLES_MISMATCH));
  assert.ok(codes.has(errorCodes.UNKNOWN_ROLE_MISMATCH));
  assert.ok(codes.has(errorCodes.OPERATION_SEQUENCE_MISMATCH));
  assert.ok(codes.has(errorCodes.INTERMEDIATE_REQUIREMENT_MISMATCH));
});

test("schema, source, prompt, answer and lifecycle failures are blocking", () => {
  const item = clone(adaptG4AU08LegacyItem(legacy("tpl_app_add_three_quantities")));
  item.schemaVersion = 99;
  item.sourceId = "wrong_source";
  item.prompt = "";
  item.answerModel = null;
  item.lifecycle.selectorVisibility = "visible";
  item.lifecycle.canonicalRouting = "enabled";
  item.lifecycle.productionUse = "allowed";
  const codes = new Set(validateG4AU08CanonicalItem(item).errors.map((entry) => entry.code));
  assert.ok(codes.has(errorCodes.SCHEMA_INVALID));
  assert.ok(codes.has(errorCodes.SOURCE_MISMATCH));
  assert.ok(codes.has(errorCodes.PROMPT_MISSING));
  assert.ok(codes.has(errorCodes.ANSWER_MODEL_MISSING));
  assert.ok(codes.has(errorCodes.LIFECYCLE_INVALID));
  assert.ok(codes.has(errorCodes.PUBLIC_ROUTING_FORBIDDEN));
  assert.ok(codes.has(errorCodes.PRODUCTION_USE_FORBIDDEN));
});

test("unknown template identity is blocking and assert API throws", () => {
  const item = clone(adaptG4AU08LegacyItem(legacy("tpl_app_divide_then_divide")));
  item.legacyTemplateId = "tpl_unknown";
  const result = validateG4AU08CanonicalItem(item);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((entry) => entry.code === errorCodes.TEMPLATE_UNMAPPED));
  assert.throws(() => assertValidG4AU08CanonicalItem(item), /G4AU08_VALIDATOR_TEMPLATE_UNMAPPED/);
});
