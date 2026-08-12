import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p03f31-extension.js";
import {
  G6B_U01_P03F32_DECIMAL_SPEC_ID,
  G6B_U01_P03F32_FRACTION_SPEC_ID,
  G6B_U01_P03F32_GROUP_ID,
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  G6B_U01_P03F32_SPEC_IDS,
  P03F32_REQUIRED_CAPABILITY_IDS,
} from "../registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

const common = Object.freeze({
  sourceId: G6B_U01_P03F32_SOURCE_ID,
  title: "小數與分數互換",
  kind: "g6bU01Rank8MixedDomainConversion",
  operation: "mixed_domain_conversion",
  operationFamilyId: "mixed_domain_conversion",
  operationModelId: "op_g6b_u01_decimal_fraction_conversion",
  knowledgePointId: G6B_U01_P03F32_KP_ID,
  patternGroupId: G6B_U01_P03F32_GROUP_ID,
  mode: "NUMERIC",
  questionMode: "numeric",
  canonicalSkillIds: Object.freeze([G6B_U01_P03F32_KP_ID]),
  skillTags: Object.freeze(["decimal", "fraction", "mixed_domain", "exact_conversion", G6B_U01_P03F32_SOURCE_ID]),
  difficultyTags: Object.freeze(["rank8", "terminating_decimal", "reduced_fraction", "full_product_w3_slice032"]),
  requiredCapabilityIds: P03F32_REQUIRED_CAPABILITY_IDS,
  applicationClassification: "APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED",
  globalContextRequired: false,
  sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
  sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  mixedDomainNormalizerId: "shared-mixed-domain-normalizer-p03f32-v1",
});

export const G6B_U01_P03F32_FRACTION_PATTERN_DEFINITION = Object.freeze({
  ...common,
  patternSpecId: G6B_U01_P03F32_FRACTION_SPEC_ID,
  action: "TO_FRACTION",
  requestedUnknownRole: "fraction",
  givenRoles: Object.freeze(["decimal"]),
  answerType: "fraction",
  canonicalExpressions: Object.freeze(["fraction = reduce(decimalCoefficient / 10^decimalScale)"]),
  numericDomain: Object.freeze({
    sourceDomain: "DECIMAL",
    targetDomain: "FRACTION",
    exactRationalIdentityRequired: true,
    reducedFractionRequired: true,
    negativeValuesAllowed: false,
    floatingPointApproximationAllowed: false,
    applicationRequired: false,
  }),
});

export const G6B_U01_P03F32_DECIMAL_PATTERN_DEFINITION = Object.freeze({
  ...common,
  patternSpecId: G6B_U01_P03F32_DECIMAL_SPEC_ID,
  action: "TO_DECIMAL",
  requestedUnknownRole: "decimal",
  givenRoles: Object.freeze(["numerator", "denominator"]),
  answerType: "decimal",
  canonicalExpressions: Object.freeze(["decimal = exactBase10(numerator / denominator)"]),
  numericDomain: Object.freeze({
    sourceDomain: "FRACTION",
    targetDomain: "DECIMAL",
    exactRationalIdentityRequired: true,
    terminatingBase10Only: true,
    recurringDecimalApproximationAllowed: false,
    negativeValuesAllowed: false,
    floatingPointApproximationAllowed: false,
    applicationRequired: false,
  }),
});

const byId = new Map([
  [G6B_U01_P03F32_FRACTION_SPEC_ID, G6B_U01_P03F32_FRACTION_PATTERN_DEFINITION],
  [G6B_U01_P03F32_DECIMAL_SPEC_ID, G6B_U01_P03F32_DECIMAL_PATTERN_DEFINITION],
]);

export function getBatchABrowserPatternDefinition(id) {
  return byId.get(id) ?? baseGetDefinition(id);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const prior = baseGetPatternIds(sourceId);
  return sourceId === G6B_U01_P03F32_SOURCE_ID ? [...new Set([...prior, ...G6B_U01_P03F32_SPEC_IDS])] : prior;
}

export function validateP03F32PatternDefinitions() {
  const errors = [];
  for (const row of byId.values()) {
    if (row.sourceId !== G6B_U01_P03F32_SOURCE_ID || row.questionMode !== "numeric" || row.globalContextRequired) errors.push("P03F32_PATTERN_BOUNDARY_INVALID");
    if (JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F32_REQUIRED_CAPABILITY_IDS)) errors.push("P03F32_CAPABILITY_SET_INVALID");
    if (row.numericDomain.floatingPointApproximationAllowed !== false || row.numericDomain.applicationRequired !== false) errors.push("P03F32_DOMAIN_SCOPE_INVALID");
  }
  if (!G6B_U01_P03F32_DECIMAL_PATTERN_DEFINITION.numericDomain.terminatingBase10Only) errors.push("P03F32_TERMINATING_ONLY_REQUIRED");
  return Object.freeze({ ok:errors.length===0, errors:Object.freeze(errors), patternSpecCount:2 });
}
