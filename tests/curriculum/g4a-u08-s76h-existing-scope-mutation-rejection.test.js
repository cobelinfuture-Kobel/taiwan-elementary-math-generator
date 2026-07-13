import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  adaptG4AU08LegacyItem,
  getG4AU08AdapterContracts
} from "../../src/curriculum/g4a-u08/canonical-generated-item-adapter.js";
import {
  validateG4AU08CanonicalItem
} from "../../src/curriculum/g4a-u08/canonical-validator-contract.js";

const matrix = JSON.parse(fs.readFileSync(
  "data/curriculum/validation/S76H_G4A_U08_ExistingScopeMutationMatrix.json",
  "utf8"
));

const templateIds = Object.keys(getG4AU08AdapterContracts());

function makeCanonical(templateId) {
  return adaptG4AU08LegacyItem({
    templateFamilyId: templateId,
    knowledgePointId: "legacy-compatible-kp",
    prompt: `S76H fixture for ${templateId}`,
    answer: 42,
    operands: [6, 7, 8],
    operations: ["+", "-"],
    intermediateValues: { fixture: 1 },
    unitFlow: { input: "unit", output: "unit" },
    semanticRelations: ["fixture_relation"],
    context: { scene: "fixture" },
    seed: 7608
  });
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function hasCode(result, code) {
  return result.errors.some((entry) => entry.code === code);
}

const mutationDefinitions = [
  ["schema_identity", "G4AU08_VALIDATOR_SCHEMA_INVALID", (item) => { item.schemaVersion = 999; }],
  ["source_identity", "G4AU08_VALIDATOR_SOURCE_MISMATCH", (item) => { item.sourceId = "wrong_source"; }],
  ["unit_identity", "G4AU08_VALIDATOR_UNIT_MISMATCH", (item) => { item.unitCode = "wrong-unit"; }],
  ["knowledge_point_identity", "G4AU08_VALIDATOR_KP_MISMATCH", (item) => { item.knowledgePointId = "kp_wrong"; }],
  ["pattern_group_identity", "G4AU08_VALIDATOR_PATTERN_GROUP_MISMATCH", (item) => { item.patternGroupId = "pg_wrong"; }],
  ["pattern_spec_identity", "G4AU08_VALIDATOR_PATTERN_SPEC_MISMATCH", (item) => { item.patternSpecId = "ps_wrong"; }],
  ["reasoning_role", "G4AU08_VALIDATOR_REASONING_ROLE_MISMATCH", (item) => { item.reasoningRole = "wrong_role"; }],
  ["known_quantity_roles", "G4AU08_VALIDATOR_KNOWN_ROLES_MISMATCH", (item) => { item.knownQuantityRoles = [...item.knownQuantityRoles].reverse(); }],
  ["unknown_quantity_role", "G4AU08_VALIDATOR_UNKNOWN_ROLE_MISMATCH", (item) => { item.unknownQuantityRole = "wrong_unknown"; }],
  ["operation_sequence", "G4AU08_VALIDATOR_OPERATION_SEQUENCE_MISMATCH", (item) => { item.requiredOperationSequence = ["wrong_operation"]; }],
  ["intermediate_requirement", "G4AU08_VALIDATOR_INTERMEDIATE_REQUIREMENT_MISMATCH", (item) => { item.requiredIntermediateQuantities = ["wrong_intermediate"]; }],
  ["prompt_presence", "G4AU08_VALIDATOR_PROMPT_MISSING", (item) => { item.prompt = " "; }],
  ["answer_model_presence", "G4AU08_VALIDATOR_ANSWER_MODEL_MISSING", (item) => { delete item.answerModel; }],
  ["hidden_lifecycle", "G4AU08_VALIDATOR_LIFECYCLE_INVALID", (item) => { item.lifecycle.selectorVisibility = "visible"; }],
  ["canonical_routing", "G4AU08_VALIDATOR_PUBLIC_ROUTING_FORBIDDEN", (item) => { item.lifecycle.canonicalRouting = "enabled"; }],
  ["production_use", "G4AU08_VALIDATOR_PRODUCTION_USE_FORBIDDEN", (item) => { item.lifecycle.productionUse = "allowed"; }]
];

test("S76H matrix and executable mutation definitions are synchronized", () => {
  assert.equal(templateIds.length, matrix.templateCount);
  assert.equal(mutationDefinitions.length, matrix.expectedPerTemplateMutationCount);
  assert.deepEqual(
    mutationDefinitions.map(([name, code]) => [name, code]),
    matrix.mutationClasses
  );
  assert.equal(
    templateIds.length * mutationDefinitions.length,
    matrix.expectedTemplateMutationCount
  );
  assert.equal(
    matrix.expectedTemplateMutationCount + matrix.globalMutations.length,
    matrix.expectedTotalMutationCount
  );
});

test("all 12 positive canonical application items pass before mutation", () => {
  for (const templateId of templateIds) {
    const result = validateG4AU08CanonicalItem(makeCanonical(templateId));
    assert.equal(result.valid, true, `${templateId}: ${JSON.stringify(result.errors)}`);
  }
});

test("all 192 per-template mutations are rejected with their required blocking code", () => {
  let executed = 0;
  let rejected = 0;

  for (const templateId of templateIds) {
    const original = makeCanonical(templateId);
    for (const [name, expectedCode, mutate] of mutationDefinitions) {
      const mutated = clone(original);
      mutate(mutated);
      const result = validateG4AU08CanonicalItem(mutated);
      executed += 1;
      if (!result.valid && hasCode(result, expectedCode)) rejected += 1;
      assert.equal(result.valid, false, `${templateId}/${name} unexpectedly passed`);
      assert.equal(hasCode(result, expectedCode), true, `${templateId}/${name} missing ${expectedCode}`);
    }
  }

  assert.equal(executed, matrix.expectedTemplateMutationCount);
  assert.equal(rejected, executed);
  assert.equal(rejected / executed, matrix.acceptance.mutationRejectionRate);
});

test("unmapped template identity is globally rejected without fallback", () => {
  const item = clone(makeCanonical(templateIds[0]));
  item.legacyTemplateId = "tpl_unmapped_s76h";
  const result = validateG4AU08CanonicalItem(item);
  assert.equal(result.valid, false);
  assert.equal(hasCode(result, "G4AU08_VALIDATOR_TEMPLATE_UNMAPPED"), true);
  assert.equal(matrix.acceptance.genericFallbackAllowed, false);
});

test("S76H remains within existing application scope", () => {
  assert.equal(matrix.acceptance.extensionPatternGroupsIncluded, false);
  assert.equal(matrix.acceptance.arithmeticRecomputationIncluded, false);
  assert.equal(matrix.acceptance.deepUnitFlowIncluded, false);
  assert.equal(matrix.acceptance.deepSemanticRelationIncluded, false);
  for (const changed of Object.values(matrix.scopeBoundary)) assert.equal(changed, false);
});
