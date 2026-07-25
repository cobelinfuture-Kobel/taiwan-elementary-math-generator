import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p01d1-extension.js";
import {
  G6A_U01_PATTERN_GROUPS,
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
} from "../registry/g6a-u01-selector-projection.js";

const groupBySpecId = new Map(G6A_U01_PATTERN_GROUPS.flatMap((group) => (
  group.patternSpecIds.map((patternSpecId) => [patternSpecId, group])
)));

const operationBySpecId = Object.freeze({
  ps_g6a_u01_classify_prime_composite_neither: "classify_prime_composite_neither",
  ps_g6a_u01_list_primes_in_interval: "list_primes_in_interval",
  ps_g6a_u01_prime_factorization_product: "prime_factorization_product",
  ps_g6a_u01_prime_factorization_exponents: "prime_factorization_exponents",
  ps_g6a_u01_short_division_trace: "short_division_trace",
  ps_g6a_u01_short_division_common_product: "short_division_common_product",
  ps_g6a_u01_gcf_direct: "gcf_direct",
  ps_g6a_u01_gcf_from_prime_exponents: "gcf_from_prime_exponents",
  ps_g6a_u01_lcm_direct: "lcm_direct",
  ps_g6a_u01_lcm_from_prime_exponents: "lcm_from_prime_exponents",
});

const titleBySpecId = Object.freeze({
  ps_g6a_u01_classify_prime_composite_neither: "質數、合數與1的分類",
  ps_g6a_u01_list_primes_in_interval: "列出指定範圍內的質數",
  ps_g6a_u01_prime_factorization_product: "質因數分解乘積式",
  ps_g6a_u01_prime_factorization_exponents: "質因數分解指數式",
  ps_g6a_u01_short_division_trace: "短除法共同質因數步驟",
  ps_g6a_u01_short_division_common_product: "短除法共同因數乘積與互質末端商",
  ps_g6a_u01_gcf_direct: "直接求最大公因數",
  ps_g6a_u01_gcf_from_prime_exponents: "由質因數指數求最大公因數",
  ps_g6a_u01_lcm_direct: "直接求最小公倍數",
  ps_g6a_u01_lcm_from_prime_exponents: "由質因數指數求最小公倍數",
});

const definitions = Object.freeze(Object.fromEntries(G6A_U01_PATTERN_SPEC_IDS.map((patternSpecId) => {
  const group = groupBySpecId.get(patternSpecId);
  const operation = operationBySpecId[patternSpecId];
  return [patternSpecId, Object.freeze({
    patternSpecId,
    sourceId: G6A_U01_SOURCE_ID,
    title: titleBySpecId[patternSpecId],
    kind: "g6aU01NumberTheory",
    operation,
    knowledgePointId: group.primaryKnowledgePointId,
    patternGroupId: group.patternGroupId,
    canonicalSkillIds: Object.freeze([group.primaryKnowledgePointId]),
    skillTags: Object.freeze(["number_theory", group.representationTag, G6A_U01_SOURCE_ID]),
    difficultyTags: Object.freeze(["full_product_w1", operation, "grade_6_number_theory"]),
    numericDomain: Object.freeze({ minimum: 1, maximum: 1200, requireSafeInteger: true }),
  })];
})));

export { G6A_U01_PATTERN_SPEC_IDS, G6A_U01_SOURCE_ID };

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId === G6A_U01_SOURCE_ID) return [...G6A_U01_PATTERN_SPEC_IDS];
  return baseGetPatternIds(sourceId);
}

export function validateP01D2PatternDefinitions() {
  const errors = [];
  if (Object.keys(definitions).length !== 10) errors.push("P01D2_PATTERN_DEFINITION_COUNT_INVALID");
  for (const patternSpecId of G6A_U01_PATTERN_SPEC_IDS) {
    const definition = definitions[patternSpecId];
    if (!definition || definition.sourceId !== G6A_U01_SOURCE_ID) errors.push(`P01D2_PATTERN_DEFINITION_MISSING:${patternSpecId}`);
    if (!definition?.knowledgePointId || !definition?.patternGroupId || !definition?.operation) errors.push(`P01D2_PATTERN_BINDING_INCOMPLETE:${patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: G6A_U01_PATTERN_SPEC_IDS.length });
}
