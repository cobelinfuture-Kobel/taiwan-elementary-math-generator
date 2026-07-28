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
import {
  G3B_U09_DECIMAL_READ_WRITE_KP_ID,
  G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID,
  G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-decimal-read-write-selector-projection.js";

export const P03F8_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

const definitions = Object.freeze({
  [G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID]: Object.freeze({
    sourceId: G3B_U09_SOURCE_ID,
    title: "一位小數讀寫",
    kind: "g3bU09DecimalReadWrite",
    operation: "decimal_read_write",
    operationFamilyId: "decimal_read_write",
    operationModelId: "op_g3b_u09_decimal_read_write",
    knowledgePointId: G3B_U09_DECIMAL_READ_WRITE_KP_ID,
    patternGroupId: G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID,
    patternSpecId: G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole: "decimalText",
    givenRoles: Object.freeze(["digitsByPlace"]),
    answerType: "decimal_or_reading",
    canonicalExpressions: Object.freeze(["decimalText = encodePlaceValue(digitsByPlace)"]),
    canonicalSkillIds: Object.freeze([G3B_U09_DECIMAL_READ_WRITE_KP_ID]),
    skillTags: Object.freeze(["decimal", "place_value", "read_write", "spoken_decimal", "standard_decimal_notation", G3B_U09_SOURCE_ID]),
    difficultyTags: Object.freeze(["one_decimal_place", "bidirectional_read_write", "full_product_w3_slice008"]),
    requiredCapabilityIds: P03F8_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    numericDomain: Object.freeze({ wholeMin: 0, wholeMax: 9, tenthsDigitMin: 0, tenthsDigitMax: 9, decimalScale: 1 }),
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  }),
  [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID]: Object.freeze({
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
    skillTags: Object.freeze(["decimal", "place_value", "whole_units", "tenths_units", "compose_decompose", G3B_U09_SOURCE_ID]),
    difficultyTags: Object.freeze(["one_decimal_place", "whole_plus_tenths", "full_product_w3_slice008"]),
    requiredCapabilityIds: P03F8_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    numericDomain: Object.freeze({ wholeMin: 0, wholeMax: 9, fractionalUnitsMin: 1, fractionalUnitsMax: 9, decimalScale: 1 }),
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  }),
});

export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3B_U09_SOURCE_ID
    ? [...new Set([...baseGetPatternIds(sourceId), ...Object.keys(definitions)])]
    : baseGetPatternIds(sourceId);
}
export function validateP03F8PatternDefinition() {
  const errors = [];
  const readWrite = definitions[G3B_U09_DECIMAL_READ_WRITE_PATTERN_SPEC_ID];
  const compose = definitions[G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID];
  if (readWrite.knowledgePointId !== G3B_U09_DECIMAL_READ_WRITE_KP_ID || readWrite.patternGroupId !== G3B_U09_DECIMAL_READ_WRITE_PATTERN_GROUP_ID || readWrite.requestedUnknownRole !== "decimalText") errors.push("P03F8_READ_WRITE_BINDING_INVALID");
  if (compose.knowledgePointId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID || compose.patternGroupId !== G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID || compose.requestedUnknownRole !== "decimal") errors.push("P03F8_COMPOSE_BINDING_INVALID");
  for (const definition of Object.values(definitions)) {
    if (JSON.stringify(definition.requiredCapabilityIds) !== JSON.stringify(P03F8_REQUIRED_CAPABILITY_IDS)) errors.push(`P03F8_CAPABILITY_SET_INVALID:${definition.patternSpecId}`);
    if (definition.questionMode !== "numeric" || definition.applicationClassification !== "APPLICATION_NOT_APPLICABLE") errors.push(`P03F8_APPLICATION_SCOPE_VIOLATION:${definition.patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 2 });
}
