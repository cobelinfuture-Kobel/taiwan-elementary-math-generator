export * from "./source-pattern-full-product-p03f17-extension.js";
import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f17-extension.js";
import {
  G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
} from "../registry/g4a-u09-decimal-compose-decompose-selector-projection.js";

export const P03F18_DECIMAL_COMPOSE_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

export const G4A_U09_DECIMAL_COMPOSE_PATTERN_DEFINITION = Object.freeze({
  sourceId: G4A_U09_DECIMAL_COMPOSE_SOURCE_ID,
  title: "二位小數組成分解",
  kind: "g4aU09DecimalComposeDecompose",
  operation: "decimal_representation",
  operationFamilyId: "decimal_representation",
  operationModelId: "op_g4a_u09_decimal_compose_decompose",
  knowledgePointId: G4A_U09_DECIMAL_COMPOSE_KP_ID,
  patternGroupId: G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  patternSpecId: G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "decimal",
  givenRoles: Object.freeze(["whole", "fractionalUnits", "placeUnit"]),
  answerType: "decimal",
  canonicalExpressions: Object.freeze(["decimal = whole + tenths * 0.1 + hundredths * 0.01"]),
  canonicalSkillIds: Object.freeze([G4A_U09_DECIMAL_COMPOSE_KP_ID]),
  skillTags: Object.freeze(["decimal", "place_value", "compose_decompose", G4A_U09_DECIMAL_COMPOSE_SOURCE_ID]),
  difficultyTags: Object.freeze(["two_decimal_places", "full_product_w3_slice018"]),
  requiredCapabilityIds: P03F18_DECIMAL_COMPOSE_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain: Object.freeze({ decimalScale: 2, arithmeticRequired: false, comparisonRequired: false }),
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID ? G4A_U09_DECIMAL_COMPOSE_PATTERN_DEFINITION : baseGetDefinition(id);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const base = baseGetPatternIds(sourceId);
  if (sourceId !== G4A_U09_DECIMAL_COMPOSE_SOURCE_ID) return base;
  return [...new Set([...base, G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID])];
}

export function validateP03F18PatternDefinitions() {
  const row = G4A_U09_DECIMAL_COMPOSE_PATTERN_DEFINITION;
  const errors = [];
  if (row.questionMode !== "numeric" || row.globalContextRequired) errors.push("P03F18_APPLICATION_SCOPE_LEAK");
  if (JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F18_DECIMAL_COMPOSE_CAPABILITY_IDS)) errors.push("P03F18_CAPABILITY_SET_INVALID");
  if (row.numericDomain.arithmeticRequired || row.numericDomain.comparisonRequired) errors.push("P03F18_DOMAIN_EXPANSION_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
