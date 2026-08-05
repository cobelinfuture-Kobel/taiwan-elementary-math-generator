import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f24-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_GROUP_ID,
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
} from "../registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";

export const P03F25_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const DIRECTION_BY_SPEC = Object.freeze({
  [G4A_U06_P03F25_PATTERN_SPEC_IDS[0]]: "improper_to_mixed_or_integer",
  [G4A_U06_P03F25_PATTERN_SPEC_IDS[1]]: "mixed_to_improper_fraction",
  [G4A_U06_P03F25_PATTERN_SPEC_IDS[2]]: "integer_to_improper_fraction",
});
const TITLE_BY_DIRECTION = Object.freeze({
  improper_to_mixed_or_integer: "假分數改寫成帶分數或整數",
  mixed_to_improper_fraction: "帶分數改寫成假分數",
  integer_to_improper_fraction: "整數改寫成指定分母假分數",
});

function definition(patternSpecId) {
  const conversionDirection = DIRECTION_BY_SPEC[patternSpecId];
  return Object.freeze({
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    title: TITLE_BY_DIRECTION[conversionDirection],
    kind: "g4aU06ImproperMixedIntegerConversion",
    operation: "convert",
    operationFamilyId: "improper_mixed_integer_conversion",
    operationModelId: "op_g4a_u06_improper_mixed_conversion",
    knowledgePointId: G4A_U06_P03F25_KP_ID,
    patternGroupId: G4A_U06_P03F25_GROUP_ID,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole: conversionDirection,
    givenRoles: Object.freeze(conversionDirection === "improper_to_mixed_or_integer"
      ? ["improperNumerator", "denominator"]
      : conversionDirection === "mixed_to_improper_fraction"
        ? ["whole", "remainder", "denominator"]
        : ["whole", "denominator"]),
    answerType: "fraction_or_mixed_number_or_integer",
    canonicalExpressions: Object.freeze([
      "whole = floor(improperNumerator / denominator)",
      "remainder = improperNumerator mod denominator",
      "improperNumerator = whole * denominator + remainder",
    ]),
    canonicalSkillIds: Object.freeze([G4A_U06_P03F25_KP_ID]),
    skillTags: Object.freeze(["fraction", "improper_fraction", "mixed_number", "integer", "equivalent_representation", G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID]),
    difficultyTags: Object.freeze([conversionDirection, "full_product_w3_slice025"]),
    requiredCapabilityIds: P03F25_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({
      conversionDirection,
      positiveDenominator: true,
      properRemainderRequired: true,
      comparisonRequired: false,
      numberLineRequired: false,
      arithmeticRequired: false,
    }),
  });
}

export const G4A_U06_P03F25_PATTERN_DEFINITIONS = Object.freeze(G4A_U06_P03F25_PATTERN_SPEC_IDS.map(definition));
const BY_ID = new Map(G4A_U06_P03F25_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...BY_ID.keys()])];
}
export function validateP03F25PatternDefinitions() {
  const errors = [];
  if (G4A_U06_P03F25_PATTERN_DEFINITIONS.length !== 3) errors.push("P03F25_PATTERN_COUNT_INVALID");
  for (const row of G4A_U06_P03F25_PATTERN_DEFINITIONS) {
    if (row.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push(`P03F25_PATTERN_BOUNDARY_INVALID:${row.patternSpecId}`);
    if (row.requiredCapabilityIds.includes("cap_fraction_arithmetic")) errors.push(`P03F25_ARITHMETIC_CAPABILITY_LEAK:${row.patternSpecId}`);
    if (!row.requiredCapabilityIds.includes("cap_fraction_domain_validator") || !row.requiredCapabilityIds.includes("cap_fraction_number_system")) errors.push(`P03F25_FRACTION_CAPABILITY_MISSING:${row.patternSpecId}`);
    if (row.numericDomain.comparisonRequired || row.numericDomain.numberLineRequired || row.numericDomain.arithmeticRequired) errors.push(`P03F25_DOMAIN_EXPANSION_INVALID:${row.patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 3 });
}
