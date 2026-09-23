import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f28-extension.js";
import {
  G5A_U04_P03F29_GROUP_ID,
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_SOURCE_ID,
  G5A_U04_P03F29_SPEC_ID,
  P03F29_REQUIRED_CAPABILITY_IDS,
} from "../registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";

export const G5A_U04_P03F29_PATTERN_DEFINITION = Object.freeze({
  sourceId: G5A_U04_P03F29_SOURCE_ID,
  title: "通分後比較異分母分數",
  kind: "g5aU04Rank8UnlikeFractionCompare",
  operation: "fraction_compare",
  operationFamilyId: "fraction_compare",
  operationModelId: "op_g5a_u04_unlike_fraction_compare",
  knowledgePointId: G5A_U04_P03F29_KP_ID,
  patternGroupId: G5A_U04_P03F29_GROUP_ID,
  patternSpecId: G5A_U04_P03F29_SPEC_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  requestedUnknownRole: "comparison",
  givenRoles: Object.freeze(["leftNumerator", "leftDenominator", "rightNumerator", "rightDenominator"]),
  answerType: "comparison_symbol_or_order",
  canonicalExpressions: Object.freeze([
    "comparison = compare(leftNumerator * rightDenominator, rightNumerator * leftDenominator)",
  ]),
  canonicalSkillIds: Object.freeze([G5A_U04_P03F29_KP_ID]),
  skillTags: Object.freeze(["fraction", "common_denominator", "cross_product", "fraction_compare", G5A_U04_P03F29_SOURCE_ID]),
  difficultyTags: Object.freeze(["unlike_denominator", "exact_rational", "full_product_w3_slice029"]),
  requiredCapabilityIds: P03F29_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_COMPATIBLE",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  numericDomain: Object.freeze({
    leftDenominatorPositive: true,
    rightDenominatorPositive: true,
    exactRationalRelationRequired: true,
    applicationRequired: false,
    applicationExpansionAllowed: false,
  }),
});

export function getBatchABrowserPatternDefinition(id) {
  return id === G5A_U04_P03F29_SPEC_ID ? G5A_U04_P03F29_PATTERN_DEFINITION : baseGetDefinition(id);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const prior = baseGetPatternIds(sourceId);
  return sourceId === G5A_U04_P03F29_SOURCE_ID
    ? [...new Set([...prior, G5A_U04_P03F29_SPEC_ID])]
    : prior;
}

export function validateP03F29PatternDefinitions() {
  const errors = [];
  const row = G5A_U04_P03F29_PATTERN_DEFINITION;
  if (row.sourceId !== G5A_U04_P03F29_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push("P03F29_PATTERN_BOUNDARY_INVALID");
  if (JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F29_REQUIRED_CAPABILITY_IDS)) errors.push("P03F29_CAPABILITY_SET_INVALID");
  if (row.numericDomain.applicationRequired || row.numericDomain.applicationExpansionAllowed) errors.push("P03F29_APPLICATION_EXPANSION_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 1 });
}
