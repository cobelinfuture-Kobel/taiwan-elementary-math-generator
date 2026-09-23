import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f3-extension.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTH_DECIMAL_KP_ID,
  G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID,
  G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g3b-u09-tenth-decimal-selector-projection.js";

export const G3B_U09_TENTH_DECIMAL_PATTERN_DEFINITION = Object.freeze({
  patternSpecId: G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID,
  sourceId: G3B_U09_SOURCE_ID,
  title: "十分位與 0.1",
  kind: "g3bU09TenthDecimalRepresentation",
  operation: "decimal_representation",
  operationFamilyId: "decimal_representation",
  knowledgePointId: G3B_U09_TENTH_DECIMAL_KP_ID,
  patternGroupId: G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "decimal",
  givenRoles: Object.freeze(["whole", "fractionalUnits", "placeUnit"]),
  canonicalSkillIds: Object.freeze([G3B_U09_TENTH_DECIMAL_KP_ID]),
  skillTags: Object.freeze(["decimal", "tenths", "place_value", "decimal_representation", G3B_U09_SOURCE_ID]),
  difficultyTags: Object.freeze(["full_product_w3_slice004", "grade_3_tenth_representation", "application_not_applicable"]),
  requiredCapabilityIds: Object.freeze(["cap_decimal_domain_validator", "cap_decimal_number_system"]),
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  numericDomain: Object.freeze({ whole: 0, fractionalUnits: 1, placeUnit: "0.1", canonicalDecimal: "0.1", exactScale: 1 }),
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return patternSpecId === G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID
    ? G3B_U09_TENTH_DECIMAL_PATTERN_DEFINITION
    : baseGetDefinition(patternSpecId);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3B_U09_SOURCE_ID
    ? [G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID]
    : baseGetPatternIds(sourceId);
}
export function validateP03F4PatternDefinition() {
  const definition = G3B_U09_TENTH_DECIMAL_PATTERN_DEFINITION;
  const errors = [];
  if (definition.patternSpecId !== G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID) errors.push("P03F4_PATTERN_ID_INVALID");
  if (definition.knowledgePointId !== G3B_U09_TENTH_DECIMAL_KP_ID) errors.push("P03F4_KP_BINDING_INVALID");
  if (definition.patternGroupId !== G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID) errors.push("P03F4_GROUP_BINDING_INVALID");
  if (definition.questionMode !== "numeric" || definition.applicationClassification !== "APPLICATION_NOT_APPLICABLE") errors.push("P03F4_MODE_INVALID");
  const expected = ["cap_decimal_domain_validator", "cap_decimal_number_system"];
  if (JSON.stringify(definition.requiredCapabilityIds) !== JSON.stringify(expected)
    || definition.sharedGeneratorAdapterId !== "SHARED_OPERATION_FAMILY_GENERATOR_V1"
    || definition.sharedValidatorAdapterId !== "SHARED_OPERATION_FAMILY_VALIDATOR_V1") errors.push("P03F4_SHARED_ADAPTER_OR_CAPABILITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
