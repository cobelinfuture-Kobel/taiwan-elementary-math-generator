export * from "./source-pattern-full-product-p03f21-extension.js";
import { getBatchABrowserPatternDefinition as baseGet, getBatchAPatternSpecIdsForSource as baseIds } from "./source-pattern-full-product-p03f21-extension.js";
import {
  G5A_U04_SOURCE_ID, G5A_U04_COMMON_DENOMINATOR_KP_ID, G5A_U04_DIVISIBILITY_REDUCTION_KP_ID,
  G5A_U04_COMMON_DENOMINATOR_GROUP_ID, G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
  G5A_U04_COMMON_DENOMINATOR_SPEC_IDS, G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS, G5A_U04_SLICE022_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-rank7-fraction-selector-projection.js";
import { P03F22_REQUIRED_CAPABILITY_IDS } from "./g5a-u04-rank7-fraction-runtime-p03f22.js";

const definitions = Object.freeze(Object.fromEntries(G5A_U04_SLICE022_PATTERN_SPEC_IDS.map((patternSpecId) => {
  const common = G5A_U04_COMMON_DENOMINATOR_SPEC_IDS.includes(patternSpecId);
  const requestedUnknownRole = patternSpecId.includes("common_denominator_common") ? "commonDenominator"
    : patternSpecId.includes("left_equivalent") ? "leftEquivalent"
      : patternSpecId.includes("right_equivalent") ? "rightEquivalent"
        : patternSpecId.includes("common_factor") ? "commonFactor"
          : patternSpecId.includes("simplest_numerator") ? "simplestNumerator" : "simplestDenominator";
  return [patternSpecId, Object.freeze({
    sourceId: G5A_U04_SOURCE_ID,
    title: common ? "通分" : "利用整除規則約分",
    kind: common ? "g5aU04CommonDenominatorSlice022" : "g5aU04DivisibilityReductionSlice022",
    operation: common ? "common_denominator" : "simplify_fraction",
    operationFamilyId: common ? "common_denominator" : "simplify_fraction",
    operationModelId: common ? "op_g5a_u04_common_denominator" : "op_g5a_u04_divisibility_supported_reduction",
    knowledgePointId: common ? G5A_U04_COMMON_DENOMINATOR_KP_ID : G5A_U04_DIVISIBILITY_REDUCTION_KP_ID,
    patternGroupId: common ? G5A_U04_COMMON_DENOMINATOR_GROUP_ID : G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
    patternSpecId, mode: "NUMERIC", questionMode: "numeric", requestedUnknownRole,
    answerType: common && requestedUnknownRole !== "commonDenominator" ? "fraction" : "integer",
    canonicalSkillIds: Object.freeze([common ? G5A_U04_COMMON_DENOMINATOR_KP_ID : G5A_U04_DIVISIBILITY_REDUCTION_KP_ID]),
    requiredCapabilityIds: P03F22_REQUIRED_CAPABILITY_IDS,
    applicationClassification: "APPLICATION_NOT_APPLICABLE", globalContextRequired: false,
    sharedGeneratorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", sharedValidatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
  })];
})));

export function getBatchABrowserPatternDefinition(id) { return definitions[id] ?? baseGet(id); }
export function getBatchAPatternSpecIdsForSource(id) { const prior = baseIds(id); return id === G5A_U04_SOURCE_ID ? [...new Set([...prior, ...G5A_U04_SLICE022_PATTERN_SPEC_IDS])] : prior; }
export function validateP03F22PatternDefinitions() {
  const errors = [];
  for (const id of G5A_U04_SLICE022_PATTERN_SPEC_IDS) {
    if (!definitions[id]) errors.push("P03F22_PATTERN_DEFINITION_MISSING");
    if (definitions[id]?.globalContextRequired) errors.push("P03F22_CONTEXT_SCOPE_INVALID");
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: Object.keys(definitions).length });
}
