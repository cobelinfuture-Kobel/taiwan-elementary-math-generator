import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f12-extension.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

export const P03F13_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
const [COMMON_FACTOR_SPEC, SIMPLEST_NUMERATOR_SPEC, SIMPLEST_DENOMINATOR_SPEC] =
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS;

function definition(patternSpecId, requestedUnknownRole, givenRoles, title) {
  return Object.freeze({
    sourceId: G5A_U04_SOURCE_ID,
    title,
    kind: "g5aU04ExpandReduceSimplest",
    operation: "simplify_fraction",
    operationFamilyId: "simplify_fraction",
    operationModelId: "op_g5a_u04_expand_reduce_simplest",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    patternGroupId: G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole,
    givenRoles: Object.freeze(givenRoles),
    answerType: "fraction",
    canonicalExpressions: Object.freeze([
      "simplestNumerator = numerator / gcd(numerator, denominator)",
      "simplestDenominator = denominator / gcd(numerator, denominator)",
    ]),
    canonicalSkillIds: Object.freeze([G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID]),
    skillTags: Object.freeze(["fraction", "reduction", "simplest_fraction", G5A_U04_SOURCE_ID]),
    difficultyTags: Object.freeze([
      "gcd_reduction",
      "coprime_final_form",
      "full_product_w3_slice013",
    ]),
    requiredCapabilityIds: P03F13_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({ denominatorMin: 2, denominatorMax: 60, positiveTerms: true }),
  });
}

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS = Object.freeze([
  definition(
    COMMON_FACTOR_SPEC,
    "commonFactor",
    ["numerator", "denominator", "simplestNumerator", "simplestDenominator"],
    "最簡分數｜最大公因數",
  ),
  definition(
    SIMPLEST_NUMERATOR_SPEC,
    "simplestNumerator",
    ["numerator", "denominator", "commonFactor", "simplestDenominator"],
    "最簡分數｜最簡分子",
  ),
  definition(
    SIMPLEST_DENOMINATOR_SPEC,
    "simplestDenominator",
    ["numerator", "denominator", "commonFactor", "simplestNumerator"],
    "最簡分數｜最簡分母",
  ),
]);
const BY_ID = new Map(G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) {
  return BY_ID.get(id) ?? baseGetDefinition(id);
}
export function getBatchAPatternSpecIdsForSource(sourceId) {
  return sourceId === G5A_U04_SOURCE_ID
    ? [...G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS]
    : baseGetPatternIds(sourceId);
}
export function validateP03F13PatternDefinitions() {
  const errors = [];
  if (G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS.length !== 3) errors.push("P03F13_PATTERN_COUNT_INVALID");
  const roles = G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS.map((row) => row.requestedUnknownRole);
  if (JSON.stringify(roles) !== JSON.stringify(["commonFactor", "simplestNumerator", "simplestDenominator"])) {
    errors.push("P03F13_UNKNOWN_ROLE_PARITY_INVALID");
  }
  for (const row of G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS) {
    if (row.operationModelId !== "op_g5a_u04_expand_reduce_simplest"
      || row.operationFamilyId !== "simplify_fraction"
      || JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F13_REQUIRED_CAPABILITY_IDS)) {
      errors.push(`P03F13_PATTERN_DEFINITION_INVALID:${row.patternSpecId}`);
    }
    if (row.globalContextRequired || row.applicationClassification !== "APPLICATION_NOT_APPLICABLE") {
      errors.push(`P03F13_APPLICATION_SCOPE_INVALID:${row.patternSpecId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    patternSpecCount: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_DEFINITIONS.length,
  });
}
