import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f16-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_GROUP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";

export const P03F17_FRACTION_CLASSIFICATION_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const TYPE_BY_SPEC = Object.freeze({
  [G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS[0]]: "proper_fraction",
  [G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS[1]]: "improper_fraction",
  [G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS[2]]: "mixed_number",
});
const TITLE_BY_TYPE = Object.freeze({
  proper_fraction: "辨認真分數",
  improper_fraction: "辨認假分數",
  mixed_number: "辨認帶分數",
});

function definition(patternSpecId) {
  const targetType = TYPE_BY_SPEC[patternSpecId];
  return Object.freeze({
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    title: TITLE_BY_TYPE[targetType],
    kind: "g4aU06FractionTypeClassification",
    operation: "classify",
    operationFamilyId: "fraction_type_classification",
    operationModelId: "op_g4a_u06_fraction_type_classification",
    knowledgePointId: G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
    patternGroupId: G4A_U06_FRACTION_CLASSIFICATION_GROUP_ID,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole: "fractionType",
    givenRoles: Object.freeze(targetType === "mixed_number" ? ["whole", "numerator", "denominator"] : ["numerator", "denominator"]),
    answerType: "fraction_type_label",
    canonicalExpressions: Object.freeze(targetType === "proper_fraction"
      ? ["0 < numerator < denominator"]
      : targetType === "improper_fraction"
        ? ["numerator >= denominator", "denominator > 0"]
        : ["whole > 0", "0 < numerator < denominator"]),
    canonicalSkillIds: Object.freeze([G4A_U06_FRACTION_CLASSIFICATION_KP_ID]),
    skillTags: Object.freeze(["fraction", "classification", targetType, G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID]),
    difficultyTags: Object.freeze([targetType, "full_product_w3_slice017"]),
    requiredCapabilityIds: P03F17_FRACTION_CLASSIFICATION_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({
      targetType,
      positiveDenominator: true,
      conversionRequired: false,
      comparisonRequired: false,
      numberLineRequired: false,
      arithmeticRequired: false,
    }),
  });
}

export const G4A_U06_FRACTION_CLASSIFICATION_PATTERN_DEFINITIONS = Object.freeze(
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS.map(definition),
);
const BY_ID = new Map(G4A_U06_FRACTION_CLASSIFICATION_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...BY_ID.keys()])];
}
export function validateP03F17PatternDefinitions() {
  const errors = [];
  if (G4A_U06_FRACTION_CLASSIFICATION_PATTERN_DEFINITIONS.length !== 3) errors.push("P03F17_PATTERN_COUNT_INVALID");
  for (const row of G4A_U06_FRACTION_CLASSIFICATION_PATTERN_DEFINITIONS) {
    if (row.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push(`P03F17_PATTERN_BOUNDARY_INVALID:${row.patternSpecId}`);
    if (row.numericDomain.conversionRequired || row.numericDomain.comparisonRequired || row.numericDomain.numberLineRequired || row.numericDomain.arithmeticRequired) errors.push(`P03F17_DOMAIN_EXPANSION_INVALID:${row.patternSpecId}`);
    if (row.requiredCapabilityIds.includes("cap_fraction_arithmetic")) errors.push(`P03F17_ARITHMETIC_CAPABILITY_LEAK:${row.patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 3 });
}
