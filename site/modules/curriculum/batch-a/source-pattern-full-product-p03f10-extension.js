import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f9-extension.js";
import {
  G4A_U09_SOURCE_ID,
  G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-hundredth-decimal-selector-projection.js";

export const P03F10_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

export const G4A_U09_HUNDREDTH_DECIMAL_PATTERN_DEFINITION = Object.freeze({
  sourceId: G4A_U09_SOURCE_ID,
  title: "百分位與 0.01",
  kind: "g4aU09HundredthDecimalRepresentation",
  operation: "decimal_representation",
  operationFamilyId: "decimal_representation",
  operationModelId: "op_g4a_u09_hundredth_representation",
  knowledgePointId: G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  patternGroupId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  patternSpecId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "decimal",
  givenRoles: Object.freeze(["whole", "fractionalUnits", "placeUnit"]),
  answerType: "decimal",
  canonicalExpressions: Object.freeze(["decimal = whole + fractionalUnits * placeUnit"]),
  canonicalSkillIds: Object.freeze([G4A_U09_HUNDREDTH_DECIMAL_KP_ID]),
  skillTags: Object.freeze(["decimal", "hundredths", "place_value", "decimal_representation", G4A_U09_SOURCE_ID]),
  difficultyTags: Object.freeze(["one_hundredth_identity", "exact_two_decimal_places", "full_product_w3_slice010"]),
  requiredCapabilityIds: P03F10_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  numericDomain: Object.freeze({ whole: 0, fractionalUnits: 1, placeUnit: "0.01", canonicalDecimal: "0.01", exactScale: 2 }),
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID
    ? G4A_U09_HUNDREDTH_DECIMAL_PATTERN_DEFINITION
    : baseGetDefinition(id);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G4A_U09_SOURCE_ID
    ? [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID]
    : baseGetPatternIds(sourceId);
}
export function validateP03F10PatternDefinition() {
  const definition = G4A_U09_HUNDREDTH_DECIMAL_PATTERN_DEFINITION;
  const errors = [];
  if (definition.knowledgePointId !== G4A_U09_HUNDREDTH_DECIMAL_KP_ID) errors.push("P03F10_KP_BINDING_INVALID");
  if (definition.patternGroupId !== G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID) errors.push("P03F10_GROUP_BINDING_INVALID");
  if (definition.requestedUnknownRole !== "decimal") errors.push("P03F10_UNKNOWN_ROLE_INVALID");
  if (JSON.stringify(definition.givenRoles) !== JSON.stringify(["whole", "fractionalUnits", "placeUnit"])) errors.push("P03F10_GIVEN_ROLE_PARITY_INVALID");
  if (JSON.stringify(definition.requiredCapabilityIds) !== JSON.stringify(P03F10_REQUIRED_CAPABILITY_IDS)) errors.push("P03F10_CAPABILITY_SET_INVALID");
  if (definition.questionMode !== "numeric" || definition.applicationClassification !== "APPLICATION_NOT_APPLICABLE" || definition.globalContextRequired !== false) errors.push("P03F10_APPLICATION_SCOPE_VIOLATION");
  if (definition.numericDomain.fractionalUnits !== 1 || definition.numericDomain.placeUnit !== "0.01" || definition.numericDomain.canonicalDecimal !== "0.01" || definition.numericDomain.exactScale !== 2) errors.push("P03F10_NUMERIC_DOMAIN_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1, definition });
}
