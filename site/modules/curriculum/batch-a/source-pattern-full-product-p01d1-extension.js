import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-submiddle-extension.js";
import {
  G5B_U05_PATTERN_GROUPS,
  G5B_U05_PATTERN_SPEC_IDS,
  G5B_U05_SOURCE_ID,
} from "../registry/g5b-u05-selector-projection.js";

const groupBySpecId = new Map(G5B_U05_PATTERN_GROUPS.flatMap((group) => (
  group.patternSpecIds.map((patternSpecId) => [patternSpecId, group])
)));

const operationBySpecId = Object.freeze({
  ps_g5b_u05a_large_number_digit_value: "digit_value",
  ps_g5b_u05a_large_number_place_composition: "place_composition",
  ps_g5b_u05a_large_number_to_chinese: "numeric_to_chinese",
  ps_g5b_u05a_chinese_to_large_number: "chinese_to_numeric",
  ps_g5b_u05a_multiply_power_of_ten: "multiply_power_of_ten",
  ps_g5b_u05a_divide_power_of_ten_exact: "divide_power_of_ten_exact",
  ps_g5b_u05a_large_number_expanded_form: "expanded_form",
  ps_g5b_u05a_large_number_compare: "comparison",
});

const titleBySpecId = Object.freeze({
  ps_g5b_u05a_large_number_digit_value: "億以上大數指定數字的位值",
  ps_g5b_u05a_large_number_place_composition: "億以上大數位值組成",
  ps_g5b_u05a_large_number_to_chinese: "億以上大數寫成中文數字",
  ps_g5b_u05a_chinese_to_large_number: "中文億以上大數寫成數字",
  ps_g5b_u05a_multiply_power_of_ten: "乘10的次方與位值移動",
  ps_g5b_u05a_divide_power_of_ten_exact: "除以10的次方與位值移動",
  ps_g5b_u05a_large_number_expanded_form: "億以上大數位值展開",
  ps_g5b_u05a_large_number_compare: "億以上大數比較",
});

const definitions = Object.freeze(Object.fromEntries(G5B_U05_PATTERN_SPEC_IDS.map((patternSpecId) => {
  const group = groupBySpecId.get(patternSpecId);
  return [patternSpecId, Object.freeze({
    patternSpecId,
    sourceId: G5B_U05_SOURCE_ID,
    title: titleBySpecId[patternSpecId],
    kind: "g5bU05LargeNumber",
    operation: operationBySpecId[patternSpecId],
    knowledgePointId: group.primaryKnowledgePointId,
    patternGroupId: group.patternGroupId,
    canonicalSkillIds: Object.freeze([group.primaryKnowledgePointId]),
    skillTags: Object.freeze([
      "large_number_structure",
      group.representationTag,
      G5B_U05_SOURCE_ID,
    ]),
    difficultyTags: Object.freeze([
      "full_product_w1",
      operationBySpecId[patternSpecId],
      "hundred_million_and_above",
    ]),
    numericDomain: Object.freeze({
      minimum: 100000000,
      maximum: 999999999999999,
      requireSafeInteger: true,
    }),
  })];
})));

export { G5B_U05_PATTERN_SPEC_IDS, G5B_U05_SOURCE_ID };

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId === G5B_U05_SOURCE_ID) return [...G5B_U05_PATTERN_SPEC_IDS];
  return baseGetPatternIds(sourceId);
}

export function validateP01D1PatternDefinitions() {
  const errors = [];
  if (Object.keys(definitions).length !== 8) errors.push("P01D1_PATTERN_DEFINITION_COUNT_INVALID");
  for (const patternSpecId of G5B_U05_PATTERN_SPEC_IDS) {
    const definition = definitions[patternSpecId];
    if (!definition || definition.sourceId !== G5B_U05_SOURCE_ID) errors.push(`P01D1_PATTERN_DEFINITION_MISSING:${patternSpecId}`);
    if (!definition?.knowledgePointId || !definition?.patternGroupId || !definition?.operation) errors.push(`P01D1_PATTERN_BINDING_INCOMPLETE:${patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: G5B_U05_PATTERN_SPEC_IDS.length });
}
