import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f15-extension.js";
import {
  G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
  G3B_U09_DECIMAL_ADD_SUB_KP_ID,
  G3B_U09_DECIMAL_COMPARE_KP_ID,
  G3B_U09_DECIMAL_ADD_SUB_GROUP_ID,
  G3B_U09_DECIMAL_COMPARE_GROUP_ID,
  G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u09-decimal-add-sub-compare-selector-projection.js";

export const P03F16_DECIMAL_BASE_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);
export const P03F16_DECIMAL_ARITHMETIC_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_arithmetic",
  ...P03F16_DECIMAL_BASE_CAPABILITY_IDS,
]);

function definition({ patternSpecId, knowledgePointId, patternGroupId, operation, title, requiredCapabilityIds }) {
  return Object.freeze({
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    title,
    kind: "g3bU09OneDecimalArithmeticCompare",
    operation,
    operationFamilyId: operation === "compare" ? "decimal_compare" : "decimal_add_sub",
    operationModelId: knowledgePointId === G3B_U09_DECIMAL_COMPARE_KP_ID
      ? "op_g3b_u09_decimal_compare"
      : "op_g3b_u09_decimal_add_sub",
    knowledgePointId,
    patternGroupId,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole: operation === "add" ? "sum" : operation === "sub" ? "difference" : "relation",
    givenRoles: Object.freeze(["leftTenths", "rightTenths"]),
    answerType: operation === "compare" ? "comparison_relation" : "one_decimal",
    canonicalExpressions: Object.freeze(operation === "add"
      ? ["resultTenths = leftTenths + rightTenths", "decimalPlaces = 1"]
      : operation === "sub"
        ? ["resultTenths = leftTenths - rightTenths", "resultTenths >= 0", "decimalPlaces = 1"]
        : ["compare integer tenths after canonical one-decimal normalization"]),
    canonicalSkillIds: Object.freeze([knowledgePointId]),
    skillTags: Object.freeze(["decimal", "tenths", operation, G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID]),
    difficultyTags: Object.freeze(["one_decimal", "full_product_w3_slice016"]),
    requiredCapabilityIds,
    applicationClassification: "APPLICATION_COMPATIBLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ decimalPlaces: 1, nonNegative: true, hundredthsAllowed: false, lengthUnitConversionAllowed: false }),
  });
}

export const G3B_U09_DECIMAL_ARITHMETIC_PATTERN_DEFINITIONS = Object.freeze([
  definition({ patternSpecId: G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS[0], knowledgePointId: G3B_U09_DECIMAL_ADD_SUB_KP_ID, patternGroupId: G3B_U09_DECIMAL_ADD_SUB_GROUP_ID, operation: "add", title: "一位小數加法", requiredCapabilityIds: P03F16_DECIMAL_ARITHMETIC_CAPABILITY_IDS }),
  definition({ patternSpecId: G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS[1], knowledgePointId: G3B_U09_DECIMAL_ADD_SUB_KP_ID, patternGroupId: G3B_U09_DECIMAL_ADD_SUB_GROUP_ID, operation: "sub", title: "一位小數減法", requiredCapabilityIds: P03F16_DECIMAL_ARITHMETIC_CAPABILITY_IDS }),
  definition({ patternSpecId: G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS[0], knowledgePointId: G3B_U09_DECIMAL_COMPARE_KP_ID, patternGroupId: G3B_U09_DECIMAL_COMPARE_GROUP_ID, operation: "compare", title: "一位小數比較", requiredCapabilityIds: P03F16_DECIMAL_BASE_CAPABILITY_IDS }),
]);
const BY_ID = new Map(G3B_U09_DECIMAL_ARITHMETIC_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId !== G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...BY_ID.keys()])];
}
export function validateP03F16PatternDefinitions() {
  const errors = [];
  if (G3B_U09_DECIMAL_ARITHMETIC_PATTERN_DEFINITIONS.length !== 3) errors.push("P03F16_PATTERN_COUNT_INVALID");
  for (const row of G3B_U09_DECIMAL_ARITHMETIC_PATTERN_DEFINITIONS) {
    if (row.sourceId !== G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push(`P03F16_PATTERN_BOUNDARY_INVALID:${row.patternSpecId}`);
    if (row.numericDomain.decimalPlaces !== 1 || row.numericDomain.hundredthsAllowed || row.numericDomain.lengthUnitConversionAllowed) errors.push(`P03F16_DOMAIN_EXPANSION_INVALID:${row.patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 3 });
}
