import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f2-extension.js";
import {
  G3B_U07_SOURCE_ID,
  G3B_U07_QUOTIENT_FRACTION_KP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
} from "../registry/g3b-u07-quotient-fraction-selector-projection.js";

export const G3B_U07_QUOTIENT_FRACTION_PATTERN_DEFINITION = Object.freeze({
  patternSpecId: G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
  sourceId: G3B_U07_SOURCE_ID,
  title: "除法結果的分數表示",
  kind: "g3bU07QuotientAsFraction",
  operation: "quotient_fraction",
  operationFamilyId: "quotient_fraction",
  knowledgePointId: G3B_U07_QUOTIENT_FRACTION_KP_ID,
  patternGroupId: G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "quotient",
  givenRoles: Object.freeze(["dividend", "divisor"]),
  canonicalSkillIds: Object.freeze([G3B_U07_QUOTIENT_FRACTION_KP_ID]),
  skillTags: Object.freeze(["fraction", "division", "quotient_fraction", G3B_U07_SOURCE_ID]),
  difficultyTags: Object.freeze(["full_product_w3_slice003", "grade_3_quotient_fraction", "application_not_applicable"]),
  requiredCapabilityIds: Object.freeze(["cap_fraction_arithmetic", "cap_fraction_domain_validator", "cap_fraction_number_system"]),
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  numericDomain: Object.freeze({ dividendMinimum: 1, dividendMaximum: 12, divisorMinimum: 2, divisorMaximum: 12, exactOrderedFractionIdentityRequired: true }),
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return patternSpecId === G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID
    ? G3B_U07_QUOTIENT_FRACTION_PATTERN_DEFINITION
    : baseGetDefinition(patternSpecId);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G3B_U07_SOURCE_ID
    ? [G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID]
    : baseGetPatternIds(sourceId);
}
export function validateP03F3PatternDefinition() {
  const definition = G3B_U07_QUOTIENT_FRACTION_PATTERN_DEFINITION;
  const errors = [];
  if (definition.patternSpecId !== G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID) errors.push("P03F3_PATTERN_ID_INVALID");
  if (definition.knowledgePointId !== G3B_U07_QUOTIENT_FRACTION_KP_ID) errors.push("P03F3_KP_BINDING_INVALID");
  if (definition.patternGroupId !== G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID) errors.push("P03F3_GROUP_BINDING_INVALID");
  if (definition.questionMode !== "numeric" || definition.applicationClassification !== "APPLICATION_NOT_APPLICABLE") errors.push("P03F3_MODE_INVALID");
  if (definition.requiredCapabilityIds.length !== 3 || !definition.requiredCapabilityIds.includes("cap_fraction_arithmetic") || definition.sharedGeneratorAdapterId !== "SHARED_OPERATION_FAMILY_GENERATOR_V1" || definition.sharedValidatorAdapterId !== "SHARED_OPERATION_FAMILY_VALIDATOR_V1") errors.push("P03F3_SHARED_ADAPTER_OR_CAPABILITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
