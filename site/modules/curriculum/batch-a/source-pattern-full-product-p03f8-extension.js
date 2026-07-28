import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f7-extension.js";
import {
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID,
  G3B_U09_SOURCE_ID,
} from "../registry/g3b-u09-decimal-compose-decompose-selector-projection.js";

export const P03F8_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

const definition = Object.freeze({
  sourceId: G3B_U09_SOURCE_ID,
  title: "個位與十分位組成分解",
  kind: "g3bU09DecimalComposeDecompose",
  operation: "decimal_representation",
  operationFamilyId: "decimal_representation",
  operationModelId: "op_g3b_u09_decimal_compose_decompose",
  knowledgePointId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  patternGroupId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID,
  patternSpecId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "decimal",
  givenRoles: Object.freeze(["whole", "fractionalUnits", "placeUnit"]),
  answerType: "decimal",
  canonicalExpressions: Object.freeze(["decimal = whole + fractionalUnits * placeUnit"]),
  canonicalSkillIds: Object.freeze([G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID]),
  skillTags: Object.freeze([
    "decimal",
    "place_value",
    "whole_units",
    "tenths_units",
    "compose_decompose",
    G3B_U09_SOURCE_ID,
  ]),
  difficultyTags: Object.freeze(["one_decimal_place", "whole_plus_tenths", "full_product_w3_slice008"]),
  requiredCapabilityIds: P03F8_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  numericDomain: Object.freeze({ wholeMin: 0, wholeMax: 9, fractionalUnitsMin: 1, fractionalUnitsMax: 9, decimalScale: 1 }),
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID ? definition : baseGetDefinition(id);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3B_U09_SOURCE_ID
    ? [...new Set([...baseGetPatternIds(sourceId), G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID])]
    : baseGetPatternIds(sourceId);
}
export function validateP03F8PatternDefinition() {
  const errors = [];
  if (definition.knowledgePointId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID) errors.push("P03F8_KP_BINDING_INVALID");
  if (definition.patternGroupId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID) errors.push("P03F8_GROUP_BINDING_INVALID");
  if (JSON.stringify(definition.requiredCapabilityIds) !== JSON.stringify(P03F8_REQUIRED_CAPABILITY_IDS)) errors.push("P03F8_CAPABILITY_SET_INVALID");
  if (definition.questionMode !== "numeric" || definition.applicationClassification !== "APPLICATION_NOT_APPLICABLE") errors.push("P03F8_APPLICATION_SCOPE_VIOLATION");
  if (definition.requestedUnknownRole !== "decimal") errors.push("P03F8_UNKNOWN_ROLE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
