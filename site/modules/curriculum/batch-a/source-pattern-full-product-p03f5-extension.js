import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f4-extension.js";
import {
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
} from "../registry/g4b-u08-equivalent-fraction-selector-projection.js";

const REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
const unknownRoles = Object.freeze(["factor", "equivalentNumerator", "equivalentDenominator"]);
const definitions = Object.freeze(Object.fromEntries(G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS.map((patternSpecId, index) => {
  const requestedUnknownRole = unknownRoles[index];
  const givenRoles = ["numerator", "denominator", "factor", "equivalentNumerator", "equivalentDenominator"]
    .filter((role) => role !== requestedUnknownRole);
  return [patternSpecId, Object.freeze({
    patternSpecId,
    sourceId: G4B_U08_SOURCE_ID,
    title: "擴分與約分產生等值分數",
    kind: "g4bU08EquivalentFraction",
    operation: "equivalent_fraction",
    operationFamilyId: "equivalent_fraction",
    knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID,
    patternGroupId: G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole,
    givenRoles: Object.freeze(givenRoles),
    canonicalSkillIds: Object.freeze([G4B_U08_EQUIVALENT_FRACTION_KP_ID]),
    skillTags: Object.freeze(["fraction", "equivalent_fraction", "expansion", "reduction", G4B_U08_SOURCE_ID]),
    difficultyTags: Object.freeze(["full_product_w3_slice005", requestedUnknownRole, "application_not_applicable"]),
    requiredCapabilityIds: REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    numericDomain: Object.freeze({ denominatorMin: 2, factorMin: 2, factorMax: 5, exactRationalIdentity: true }),
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  })];
})));

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G4B_U08_SOURCE_ID
    ? [...G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS]
    : baseGetPatternIds(sourceId);
}
export function validateP03F5PatternDefinitions() {
  const errors = [];
  if (Object.keys(definitions).length !== 3) errors.push("P03F5_PATTERN_COUNT_INVALID");
  for (const patternSpecId of G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS) {
    const definition = definitions[patternSpecId];
    if (!definition || definition.knowledgePointId !== G4B_U08_EQUIVALENT_FRACTION_KP_ID) errors.push(`P03F5_KP_BINDING_INVALID:${patternSpecId}`);
    if (definition?.patternGroupId !== G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID) errors.push(`P03F5_GROUP_BINDING_INVALID:${patternSpecId}`);
    if (definition?.questionMode !== "numeric" || definition?.applicationClassification !== "APPLICATION_NOT_APPLICABLE") errors.push(`P03F5_MODE_INVALID:${patternSpecId}`);
    if (JSON.stringify(definition?.requiredCapabilityIds) !== JSON.stringify(REQUIRED_CAPABILITY_IDS)) errors.push(`P03F5_CAPABILITY_SET_INVALID:${patternSpecId}`);
    if (definition?.sharedGeneratorAdapterId !== "SHARED_OPERATION_FAMILY_GENERATOR_V1" || definition?.sharedValidatorAdapterId !== "SHARED_OPERATION_FAMILY_VALIDATOR_V1") errors.push(`P03F5_SHARED_ADAPTER_INVALID:${patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length });
}
