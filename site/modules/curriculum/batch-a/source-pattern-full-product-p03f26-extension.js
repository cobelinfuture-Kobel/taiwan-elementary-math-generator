import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f25-extension.js";
import {
  G4A_U09_P03F26_KP_IDS,
  G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U09_P03F26_PATTERN_GROUPS,
  G4A_U09_P03F26_SOURCE_ID,
} from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";

export const P03F26_DECIMAL_BASE_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
]);
export const P03F26_DECIMAL_ARITHMETIC_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_arithmetic",
  ...P03F26_DECIMAL_BASE_CAPABILITY_IDS,
]);

const groupBySpec = new Map(G4A_U09_P03F26_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds.map((id) => [id, group])));
const metaBySpec = Object.freeze({
  ps_g4a_u09_decimal_compare_comparison_numeric: Object.freeze({
    kp: "kp_g4a_u09_decimal_compare", op: "compare", family: "decimal_compare", model: "op_g4a_u09_decimal_compare", unknown: "comparison", roles: ["left", "right"], answerType: "comparison_symbol_or_order", caps: P03F26_DECIMAL_BASE_CAPABILITY_IDS, title: "二位小數比較",
  }),
  ps_g4a_u09_decimal_sequence_term_numeric: Object.freeze({
    kp: "kp_g4a_u09_decimal_sequence", op: "sequence", family: "decimal_sequence", model: "op_g4a_u09_decimal_sequence", unknown: "term", roles: ["start", "step"], answerType: "decimal_sequence", caps: P03F26_DECIMAL_BASE_CAPABILITY_IDS, title: "小數數列規律",
  }),
  ps_g4a_u09_missing_digit_column_operation_missing_digits_numeric: Object.freeze({
    kp: "kp_g4a_u09_missing_digit_column_operation", op: "missing_digit", family: "missing_column_digit", model: "op_g4a_u09_missing_digit_column_operation", unknown: "missingDigits", roles: ["addendsOrMinuend", "result"], answerType: "digit_map", caps: P03F26_DECIMAL_ARITHMETIC_CAPABILITY_IDS, title: "小數直式缺位推理",
  }),
  ps_g4a_u09_place_value_factor_relation_higher_place_value_numeric: Object.freeze({
    kp: "kp_g4a_u09_place_value_factor_relation", op: "place_factor_higher", family: "place_factor", model: "op_g4a_u09_place_value_factor_relation", unknown: "higherPlaceValue", roles: ["lowerPlaceValue"], answerType: "numeric_relation", caps: P03F26_DECIMAL_BASE_CAPABILITY_IDS, title: "相鄰位值｜往高一位",
  }),
  ps_g4a_u09_place_value_factor_relation_lower_place_value_numeric: Object.freeze({
    kp: "kp_g4a_u09_place_value_factor_relation", op: "place_factor_lower", family: "place_factor", model: "op_g4a_u09_place_value_factor_relation", unknown: "lowerPlaceValue", roles: ["higherPlaceValue"], answerType: "numeric_relation", caps: P03F26_DECIMAL_BASE_CAPABILITY_IDS, title: "相鄰位值｜往低一位",
  }),
});

function canonicalExpressions(operation) {
  if (operation === "compare") return ["comparison = compare(normalizeScale(left), normalizeScale(right))"];
  if (operation === "sequence") return ["term[n] = start + n * step"];
  if (operation === "missing_digit") return ["possibleDigits = digits satisfying aligned column arithmetic"];
  return ["higherPlaceValue = lowerPlaceValue * 10", "lowerPlaceValue = higherPlaceValue / 10"];
}

function definition(patternSpecId) {
  const meta = metaBySpec[patternSpecId];
  const group = groupBySpec.get(patternSpecId);
  if (!meta || !group) return null;
  return Object.freeze({
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    title: meta.title,
    kind: "g4aU09Rank8Decimal",
    operation: meta.op,
    operationFamilyId: meta.family,
    operationModelId: meta.model,
    knowledgePointId: meta.kp,
    patternGroupId: group.patternGroupId,
    patternSpecId,
    mode: "NUMERIC",
    questionMode: "numeric",
    requestedUnknownRole: meta.unknown,
    givenRoles: Object.freeze([...meta.roles]),
    answerType: meta.answerType,
    canonicalExpressions: Object.freeze(canonicalExpressions(meta.op)),
    canonicalSkillIds: Object.freeze([meta.kp]),
    skillTags: Object.freeze(["decimal", "hundredths", meta.family, G4A_U09_P03F26_SOURCE_ID]),
    difficultyTags: Object.freeze([meta.op, "full_product_w3_slice026"]),
    requiredCapabilityIds: meta.caps,
    applicationClassification: meta.kp === "kp_g4a_u09_decimal_compare" ? "APPLICATION_COMPATIBLE" : "APPLICATION_NOT_APPLICABLE",
    globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    numericDomain: Object.freeze({
      decimalScale: 2,
      nonNegative: true,
      comparisonRequired: meta.op === "compare",
      sequenceRequired: meta.op === "sequence",
      missingColumnDigitRequired: meta.op === "missing_digit",
      placeValueFactorRequired: meta.op.startsWith("place_factor"),
      decimalArithmeticRequired: meta.op === "missing_digit",
      applicationRequired: false,
      lengthUnitConversionAllowed: false,
      missingDigitInequalityAllowed: false,
    }),
  });
}

export const G4A_U09_P03F26_PATTERN_DEFINITIONS = Object.freeze(G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS.map(definition));
const BY_ID = new Map(G4A_U09_P03F26_PATTERN_DEFINITIONS.map((row) => [row.patternSpecId, row]));

export function getBatchABrowserPatternDefinition(id) { return BY_ID.get(id) ?? baseGetDefinition(id); }
export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId !== G4A_U09_P03F26_SOURCE_ID) return baseGetPatternIds(sourceId);
  return [...new Set([...baseGetPatternIds(sourceId), ...BY_ID.keys()])];
}
export function validateP03F26PatternDefinitions() {
  const errors = [];
  if (G4A_U09_P03F26_PATTERN_DEFINITIONS.length !== 5) errors.push("P03F26_PATTERN_COUNT_INVALID");
  if (new Set(G4A_U09_P03F26_PATTERN_DEFINITIONS.map((row) => row.knowledgePointId)).size !== G4A_U09_P03F26_KP_IDS.length) errors.push("P03F26_KP_PATTERN_COVERAGE_INVALID");
  for (const row of G4A_U09_P03F26_PATTERN_DEFINITIONS) {
    if (row.sourceId !== G4A_U09_P03F26_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push(`P03F26_PATTERN_BOUNDARY_INVALID:${row.patternSpecId}`);
    if (!row.requiredCapabilityIds.includes("cap_decimal_domain_validator") || !row.requiredCapabilityIds.includes("cap_decimal_number_system")) errors.push(`P03F26_DECIMAL_CAPABILITY_MISSING:${row.patternSpecId}`);
    const arithmeticExpected = row.operation === "missing_digit";
    if (row.requiredCapabilityIds.includes("cap_decimal_arithmetic") !== arithmeticExpected) errors.push(`P03F26_ARITHMETIC_CAPABILITY_SCOPE_INVALID:${row.patternSpecId}`);
    if (row.numericDomain.applicationRequired || row.numericDomain.lengthUnitConversionAllowed || row.numericDomain.missingDigitInequalityAllowed) errors.push(`P03F26_DOMAIN_EXPANSION_INVALID:${row.patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: 5 });
}
