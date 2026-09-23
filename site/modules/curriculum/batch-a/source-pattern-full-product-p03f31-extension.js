import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f30-extension.js";
import {
  G5B_U04_P03F31_GROUP_ID,
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SOURCE_ID,
  G5B_U04_P03F31_SPEC_ID,
  P03F31_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";

export const G5B_U04_P03F31_PATTERN_DEFINITION = Object.freeze({
  sourceId: G5B_U04_P03F31_SOURCE_ID,
  title: "三位小數乘以整數",
  kind: "g5bU04Rank8DecimalTimesInteger",
  operation: "decimal_multiplication",
  operationFamilyId: "decimal_multiplication",
  operationModelId: "op_g5b_u04_decimal_times_integer",
  knowledgePointId: G5B_U04_P03F31_KP_ID,
  patternGroupId: G5B_U04_P03F31_GROUP_ID,
  patternSpecId: G5B_U04_P03F31_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "product",
  givenRoles: Object.freeze(["decimalFactor", "integerFactor"]),
  answerType: "decimal",
  canonicalExpressions: Object.freeze(["productCoefficient = decimalCoefficient * integerFactor", "productScale = decimalScale"]),
  canonicalSkillIds: Object.freeze([G5B_U04_P03F31_KP_ID]),
  skillTags: Object.freeze(["decimal", "multiplication", "decimal_times_integer", G5B_U04_P03F31_SOURCE_ID]),
  difficultyTags: Object.freeze(["three_decimal_places", "exact_decimal", "full_product_w3_slice031"]),
  requiredCapabilityIds: P03F31_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain: Object.freeze({
    allowedDecimalScales: Object.freeze([3]),
    integerFactorMin: 2,
    integerFactorMax: 20,
    exactCoefficientProductRequired: true,
    decimalArithmeticRequired: true,
    decimalNumberSystemRequired: true,
    applicationRequired: false,
    applicationExpansionAllowed: false,
    integerTimesDecimalRequired: false,
    decimalTimesDecimalRequired: false,
    estimationRequired: false,
  }),
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G5B_U04_P03F31_SPEC_ID ? G5B_U04_P03F31_PATTERN_DEFINITION : baseGetDefinition(id);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const prior = baseGetPatternIds(sourceId);
  return sourceId === G5B_U04_P03F31_SOURCE_ID ? [...new Set([...prior, G5B_U04_P03F31_SPEC_ID])] : prior;
}

export function validateP03F31PatternDefinitions() {
  const errors = [];
  const row = G5B_U04_P03F31_PATTERN_DEFINITION;
  if (row.sourceId !== G5B_U04_P03F31_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push("P03F31_PATTERN_BOUNDARY_INVALID");
  if (JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F31_REQUIRED_CAPABILITY_IDS)) errors.push("P03F31_CAPABILITY_SET_INVALID");
  if (!row.numericDomain.decimalArithmeticRequired || !row.numericDomain.decimalNumberSystemRequired || row.numericDomain.applicationRequired || row.numericDomain.applicationExpansionAllowed || row.numericDomain.integerTimesDecimalRequired || row.numericDomain.decimalTimesDecimalRequired || row.numericDomain.estimationRequired) errors.push("P03F31_DOMAIN_SCOPE_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
