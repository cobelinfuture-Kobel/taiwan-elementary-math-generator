import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f13-extension.js";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_KP_ID,
  G5B_U05_DECIMAL_BASE10_GROUP_ID,
  G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
} from "../registry/g5b-u05-decimal-base10-selector-projection.js";

export const P03F14_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);

function definition(patternSpecId, requestedUnknownRole, title, boundaryMode) {
  return Object.freeze({
    sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
    title,
    kind: "g5bU05DecimalBase10Structure",
    operation: "decimal_place_relation",
    operationFamilyId: "decimal_place_relation",
    operationModelId: "op_g5b_u05a_decimal_base10_structure",
    knowledgePointId: G5B_U05_DECIMAL_BASE10_KP_ID,
    patternGroupId: G5B_U05_DECIMAL_BASE10_GROUP_ID,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole,
    givenRoles: Object.freeze(["leftPlaceValue", "rightPlaceValue"]),
    answerType: "decimal_place_relation",
    canonicalExpressions: Object.freeze([
      "leftPlaceValue = rightPlaceValue * 10",
      "rightPlaceValue = leftPlaceValue / 10",
    ]),
    canonicalSkillIds: Object.freeze([G5B_U05_DECIMAL_BASE10_KP_ID]),
    skillTags: Object.freeze(["decimal", "place_value", "base10_structure", G5B_U05_DECIMAL_BASE10_SOURCE_ID]),
    difficultyTags: Object.freeze([boundaryMode, "adjacent_place_value", "full_product_w3_slice014"]),
    requiredCapabilityIds: P03F14_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ exactDecimal: true, adjacentPlacesOnly: true, base: 10, boundaryMode }),
  });
}

export const G5B_U05_DECIMAL_BASE10_PATTERN_DEFINITIONS = Object.freeze([
  definition(G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS[0], "adjacentRelation", "相鄰位值的10倍關係", "same_side_or_general"),
  definition(G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS[1], "crossDecimalPointRelation", "個位與十分位的10倍關係", "cross_decimal_point"),
]);
const BY_ID = new Map(G5B_U05_DECIMAL_BASE10_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId !== G5B_U05_DECIMAL_BASE10_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS])];
}
export function validateP03F14PatternDefinitions() {
  const errors = [];
  if (G5B_U05_DECIMAL_BASE10_PATTERN_DEFINITIONS.length !== 2) errors.push("P03F14_PATTERN_COUNT_INVALID");
  for (const row of G5B_U05_DECIMAL_BASE10_PATTERN_DEFINITIONS) {
    if (row.operationModelId !== "op_g5b_u05a_decimal_base10_structure"
      || row.operationFamilyId !== "decimal_place_relation"
      || JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F14_REQUIRED_CAPABILITY_IDS)
      || row.globalContextRequired
      || row.applicationClassification !== "APPLICATION_NOT_APPLICABLE") {
      errors.push(`P03F14_PATTERN_INVALID:${row.patternSpecId}`);
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 2 });
}
