export const P09_A03B_TASK_ID = "P09_UI_A03B_PublicCurriculumUnitCompletenessImplementation";

export const P09_A03B_SOURCE_ROUTE_ALIASES = Object.freeze([
  Object.freeze({
    sourceId: "g4b_u03_4b03",
    semanticOwnerSourceId: "g4a_u06_4a06",
    grade: 4,
    semester: "lower",
    unitCode: "4B-U03",
    title: "假分數與帶分數",
    domain: "fractional_quantity",
    knowledgePointIds: Object.freeze([
      "kp_fraction_true_improper_mixed_classification",
      "kp_fraction_improper_mixed_integer_conversion",
      "kp_fraction_improper_mixed_compare_order",
      "kp_fraction_improper_mixed_number_line",
      "kp_fraction_same_denominator_mixed_add_sub",
      "kp_fraction_times_integer_quantity",
    ]),
    sourceAuthorityPolicy: "CANONICAL_KP_ALIAS_SET_SHARED_SEMANTIC_IDENTITY",
  }),
  Object.freeze({
    sourceId: "g6b_u02_6b02",
    semanticOwnerSourceId: "g6a_u08_6a08",
    grade: 6,
    semester: "lower",
    unitCode: "6B-U02",
    title: "認識速率",
    domain: "speed_rate",
    knowledgePointIds: Object.freeze([
      "kp_speed_distance_time_relation",
      "kp_speed_unit_conversion",
      "kp_average_speed_total_distance_time",
      "kp_relative_speed_meeting_chasing",
      "kp_effective_speed_current_wind",
    ]),
    sourceAuthorityPolicy: "MERGE_SOURCE_REFS_KEEP_ONE_SEMANTIC_IDENTITY",
  }),
]);

export function getP09A03BSourceRouteAlias(sourceId) {
  return P09_A03B_SOURCE_ROUTE_ALIASES.find((row) => row.sourceId === sourceId) ?? null;
}

export function isP09A03BSourceRouteAlias(sourceId) {
  return getP09A03BSourceRouteAlias(sourceId) !== null;
}

export function projectP09A03BSourceUnit(alias) {
  if (!alias) return null;
  return Object.freeze({
    sourceId: alias.sourceId,
    grade: alias.grade,
    semester: alias.semester,
    unitCode: alias.unitCode,
    title: alias.title,
    domain: alias.domain,
    lifecycle: "public_full_product_p09_a03b_source_route_alias",
    semanticOwnerSourceId: alias.semanticOwnerSourceId,
    sourceAuthorityPolicy: alias.sourceAuthorityPolicy,
  });
}
