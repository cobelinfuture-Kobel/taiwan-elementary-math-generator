import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f12-extension.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  G5A_U04_QUOTIENT_CONTEXT_KP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID,
  G5A_U04_SLICE013_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

export const P03F13_SIMPLEST_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
export const P03F13_QUOTIENT_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
export const P03F13_REQUIRED_CAPABILITY_IDS = P03F13_QUOTIENT_CAPABILITY_IDS;
const [COMMON_FACTOR_SPEC, SIMPLEST_NUMERATOR_SPEC, SIMPLEST_DENOMINATOR_SPEC] = G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS;

function simplestDefinition(patternSpecId, requestedUnknownRole, givenRoles, title) {
  return Object.freeze({
    sourceId: G5A_U04_SOURCE_ID, title, kind: "g5aU04ExpandReduceSimplest",
    operation: "simplify_fraction", operationFamilyId: "simplify_fraction",
    operationModelId: "op_g5a_u04_expand_reduce_simplest",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    patternGroupId: G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
    patternSpecId, mode: "NUMERIC", questionMode: "numeric", requestedUnknownRole,
    givenRoles: Object.freeze(givenRoles), answerType: "fraction",
    canonicalExpressions: Object.freeze([
      "simplestNumerator = numerator / gcd(numerator, denominator)",
      "simplestDenominator = denominator / gcd(numerator, denominator)",
    ]),
    canonicalSkillIds: Object.freeze([G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID]),
    skillTags: Object.freeze(["fraction", "reduction", "simplest_fraction", G5A_U04_SOURCE_ID]),
    difficultyTags: Object.freeze(["gcd_reduction", "coprime_final_form", "full_product_w3_slice013"]),
    requiredCapabilityIds: P03F13_SIMPLEST_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE", globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ denominatorMin: 2, denominatorMax: 60, positiveTerms: true }),
  });
}

function quotientDefinition(patternSpecId, questionMode) {
  const application = questionMode === "application";
  return Object.freeze({
    sourceId: G5A_U04_SOURCE_ID,
    title: application ? "平均分配的分數商｜應用題" : "整數相除的分數商｜數字題",
    kind: "g5aU04QuotientAsFractionContext", operation: "quotient_fraction_context",
    operationFamilyId: "quotient_fraction_context", operationModelId: "op_g5a_u04_quotient_as_fraction_context",
    knowledgePointId: G5A_U04_QUOTIENT_CONTEXT_KP_ID,
    patternGroupId: application ? G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID : G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID,
    patternSpecId, mode: application ? "APPLICATION" : "NUMERIC", questionMode,
    requestedUnknownRole: "sharePerRecipient", givenRoles: Object.freeze(["totalQuantity", "recipientCount"]),
    answerType: "fraction_measure", canonicalExpressions: Object.freeze(["sharePerRecipient = totalQuantity / recipientCount"]),
    canonicalSkillIds: Object.freeze([G5A_U04_QUOTIENT_CONTEXT_KP_ID]),
    skillTags: Object.freeze(["fraction", "integer_division", "equal_sharing", G5A_U04_SOURCE_ID]),
    difficultyTags: Object.freeze(["reduced_fraction_quotient", "full_product_w3_slice013"]),
    requiredCapabilityIds: P03F13_QUOTIENT_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_REQUIRED", globalContextRequired: application,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ totalQuantityMin: 1, recipientCountMin: 2, denominatorMax: 60 }),
  });
}

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS = Object.freeze([
  simplestDefinition(COMMON_FACTOR_SPEC, "commonFactor", ["numerator", "denominator", "simplestNumerator", "simplestDenominator"], "最簡分數｜最大公因數"),
  simplestDefinition(SIMPLEST_NUMERATOR_SPEC, "simplestNumerator", ["numerator", "denominator", "commonFactor", "simplestDenominator"], "最簡分數｜最簡分子"),
  simplestDefinition(SIMPLEST_DENOMINATOR_SPEC, "simplestDenominator", ["numerator", "denominator", "commonFactor", "simplestNumerator"], "最簡分數｜最簡分母"),
]);
export const G5A_U04_QUOTIENT_CONTEXT_PATTERN_DEFINITIONS = Object.freeze([
  quotientDefinition(G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID, "numeric"),
  quotientDefinition(G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID, "application"),
]);
export const G5A_U04_SLICE013_PATTERN_DEFINITIONS = Object.freeze([
  ...G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS,
  ...G5A_U04_QUOTIENT_CONTEXT_PATTERN_DEFINITIONS,
]);
const BY_ID = new Map(G5A_U04_SLICE013_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) { return sourceId === G5A_U04_SOURCE_ID ? [...G5A_U04_SLICE013_PATTERN_SPEC_IDS] : baseGetPatternIds(sourceId); }
export function validateP03F13PatternDefinitions() {
  const errors = [];
  if (G5A_U04_SLICE013_PATTERN_DEFINITIONS.length !== 5) errors.push("P03F13_PATTERN_COUNT_INVALID");
  const simplestRoles = G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS.map((row) => row.requestedUnknownRole);
  if (JSON.stringify(simplestRoles) !== JSON.stringify(["commonFactor", "simplestNumerator", "simplestDenominator"])) errors.push("P03F13_UNKNOWN_ROLE_PARITY_INVALID");
  for (const row of G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS) {
    if (row.operationModelId !== "op_g5a_u04_expand_reduce_simplest" || row.operationFamilyId !== "simplify_fraction"
      || JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F13_SIMPLEST_CAPABILITY_IDS)
      || row.globalContextRequired || row.applicationClassification !== "APPLICATION_NOT_APPLICABLE") {
      errors.push(`P03F13_SIMPLEST_PATTERN_INVALID:${row.patternSpecId}`);
    }
  }
  for (const row of G5A_U04_QUOTIENT_CONTEXT_PATTERN_DEFINITIONS) {
    if (row.operationModelId !== "op_g5a_u04_quotient_as_fraction_context" || row.operationFamilyId !== "quotient_fraction_context"
      || JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F13_QUOTIENT_CAPABILITY_IDS)
      || row.applicationClassification !== "APPLICATION_REQUIRED"
      || row.globalContextRequired !== (row.questionMode === "application")) {
      errors.push(`P03F13_QUOTIENT_PATTERN_INVALID:${row.patternSpecId}`);
    }
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: G5A_U04_SLICE013_PATTERN_DEFINITIONS.length });
}
