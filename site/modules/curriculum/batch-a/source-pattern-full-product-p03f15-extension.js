import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f14-extension.js";
import {
  G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID,
  G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID,
  G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
  G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-same-denominator-selector-projection.js";

export const P03F15_FRACTION_BASE_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
export const P03F15_FRACTION_ARITHMETIC_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  ...P03F15_FRACTION_BASE_CAPABILITY_IDS,
]);

function definition({ patternSpecId, knowledgePointId, patternGroupId, operation, title, requestedUnknownRole, requiredCapabilityIds, wholeOneRewrite = false }) {
  return Object.freeze({
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
    title,
    kind: "g3bU07SameDenominatorFraction",
    operation,
    operationFamilyId: operation === "compare" ? "fraction_compare" : "fraction_add_sub",
    operationModelId: knowledgePointId === G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID
      ? "op_g3b_u07_same_denominator_compare"
      : "op_g3b_u07_same_denominator_add_sub",
    knowledgePointId,
    patternGroupId,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole,
    givenRoles: Object.freeze(["leftNumerator", "rightNumerator", "denominator"]),
    answerType: operation === "compare" ? "comparison_relation" : "fraction",
    canonicalExpressions: Object.freeze(operation === "add"
      ? ["resultNumerator = leftNumerator + rightNumerator", "resultDenominator = denominator"]
      : operation === "sub"
        ? ["resultNumerator = leftNumerator - rightNumerator", "resultDenominator = denominator"]
        : ["compare leftNumerator and rightNumerator when denominators are equal"]),
    canonicalSkillIds: Object.freeze([knowledgePointId]),
    skillTags: Object.freeze(["fraction", "same_denominator", operation, G3B_U07_SAME_DENOMINATOR_SOURCE_ID]),
    difficultyTags: Object.freeze([wholeOneRewrite ? "whole_one_rewrite" : "same_denominator", "full_product_w3_slice015"]),
    requiredCapabilityIds,
    applicationClassification: knowledgePointId === G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID ? "APPLICATION_COMPATIBLE" : "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ positiveDenominator: true, sameDenominatorOnly: true, wholeOneRewrite, unlikeDenominatorConversion: false, mixedNumberNormalization: false }),
  });
}

export const G3B_U07_SAME_DENOMINATOR_PATTERN_DEFINITIONS = Object.freeze([
  definition({ patternSpecId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS[0], knowledgePointId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID, patternGroupId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID, operation: "add", title: "同分母分數加法", requestedUnknownRole: "sum", requiredCapabilityIds: P03F15_FRACTION_ARITHMETIC_CAPABILITY_IDS }),
  definition({ patternSpecId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS[1], knowledgePointId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID, patternGroupId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID, operation: "sub", title: "同分母分數減法", requestedUnknownRole: "difference", requiredCapabilityIds: P03F15_FRACTION_ARITHMETIC_CAPABILITY_IDS }),
  definition({ patternSpecId: G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS[0], knowledgePointId: G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID, patternGroupId: G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID, operation: "compare", title: "同分母分數比較", requestedUnknownRole: "relation", requiredCapabilityIds: P03F15_FRACTION_BASE_CAPABILITY_IDS }),
  definition({ patternSpecId: G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS[1], knowledgePointId: G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID, patternGroupId: G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID, operation: "compare", title: "分數與整數1比較", requestedUnknownRole: "relationToWholeOne", requiredCapabilityIds: P03F15_FRACTION_BASE_CAPABILITY_IDS, wholeOneRewrite: true }),
]);
const BY_ID = new Map(G3B_U07_SAME_DENOMINATOR_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId !== G3B_U07_SAME_DENOMINATOR_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...BY_ID.keys()])];
}
export function validateP03F15PatternDefinitions() {
  const errors = [];
  if (G3B_U07_SAME_DENOMINATOR_PATTERN_DEFINITIONS.length !== 4) errors.push("P03F15_PATTERN_COUNT_INVALID");
  for (const row of G3B_U07_SAME_DENOMINATOR_PATTERN_DEFINITIONS) {
    if (row.sourceId !== G3B_U07_SAME_DENOMINATOR_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push(`P03F15_PATTERN_BOUNDARY_INVALID:${row.patternSpecId}`);
    if (row.numericDomain.unlikeDenominatorConversion || row.numericDomain.mixedNumberNormalization) errors.push(`P03F15_DOMAIN_EXPANSION_INVALID:${row.patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 4 });
}
