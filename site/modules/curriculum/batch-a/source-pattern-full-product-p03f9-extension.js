import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f8-extension.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";

export const P03F9_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const definition = Object.freeze({
  sourceId: G3B_U09_SOURCE_ID,
  title: "十分之幾與一位小數互換",
  kind: "g3bU09TenthsFractionDecimalConversion",
  operation: "fraction_decimal_conversion",
  operationFamilyId: "fraction_decimal_conversion",
  operationModelId: "op_g3b_u09_tenths_fraction_decimal",
  knowledgePointId: G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  patternGroupId: G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
  patternSpecId: G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "equivalentRepresentation",
  givenRoles: Object.freeze(["sourceRepresentation", "numerator", "denominator", "decimalScale"]),
  answerType: "fraction_or_decimal",
  canonicalExpressions: Object.freeze(["numerator / 10 = decimalTenths"]),
  canonicalSkillIds: Object.freeze([G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID]),
  skillTags: Object.freeze(["fraction", "decimal", "denominator_10", "one_decimal_place", "representation_transfer", G3B_U09_SOURCE_ID]),
  difficultyTags: Object.freeze(["proper_tenths_only", "bidirectional_conversion", "full_product_w3_slice009"]),
  requiredCapabilityIds: P03F9_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  numericDomain: Object.freeze({ numeratorMin: 1, numeratorMax: 9, denominator: 10, decimalScale: 1 }),
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID ? definition : baseGetDefinition(id);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3B_U09_SOURCE_ID
    ? [...new Set([...baseGetPatternIds(sourceId), G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_SPEC_ID])]
    : baseGetPatternIds(sourceId);
}
export function validateP03F9PatternDefinition() {
  const errors = [];
  if (definition.knowledgePointId !== G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID) errors.push("P03F9_KP_BINDING_INVALID");
  if (definition.patternGroupId !== G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID) errors.push("P03F9_GROUP_BINDING_INVALID");
  if (definition.requestedUnknownRole !== "equivalentRepresentation") errors.push("P03F9_UNKNOWN_ROLE_INVALID");
  if (JSON.stringify(definition.requiredCapabilityIds) !== JSON.stringify(P03F9_REQUIRED_CAPABILITY_IDS)) errors.push("P03F9_CAPABILITY_SET_INVALID");
  if (definition.questionMode !== "numeric" || definition.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || definition.globalContextRequired !== false) errors.push("P03F9_APPLICATION_SCOPE_VIOLATION");
  if (definition.numericDomain.denominator !== 10 || definition.numericDomain.decimalScale !== 1) errors.push("P03F9_NUMERIC_DOMAIN_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1, definition });
}
