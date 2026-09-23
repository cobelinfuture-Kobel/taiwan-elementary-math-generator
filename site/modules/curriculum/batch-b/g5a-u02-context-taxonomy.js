import { getG5AU02HiddenPatternSpecs } from "./source-pattern-g5a-u02-extension.js";

export const G5A_U02_CONTEXT_TYPES = Object.freeze({
  MIXED: "mixed",
  ABSTRACT_MATH: "abstract_math",
  DAILY_LIFE: "daily_life",
  GEOMETRY_CONTEXT: "geometry_context",
});

export const G5A_U02_CONTEXT_OPTIONS = Object.freeze([
  Object.freeze({ value: "mixed", label: "數學與生活情境混合" }),
  Object.freeze({ value: "abstract_math", label: "純數學" }),
  Object.freeze({ value: "daily_life", label: "一般生活" }),
  Object.freeze({ value: "geometry_context", label: "幾何情境" }),
]);

const DAILY_LIFE_PATTERN_IDS = Object.freeze(new Set([
  "ps_g5a_u02_equal_partition_all_segment_counts",
  "ps_g5a_u02_equal_partition_range_constrained_recipients",
  "ps_g5a_u02_maximum_equal_grouping",
  "ps_g5a_u02_possible_equal_packaging_counts",
]));

const GEOMETRY_PATTERN_IDS = Object.freeze(new Set([
  "ps_g5a_u02_rectangle_square_side_lengths",
  "ps_g5a_u02_square_tile_area_possibilities",
]));

const specs = Object.freeze(getG5AU02HiddenPatternSpecs().map((spec) => {
  let contextType = G5A_U02_CONTEXT_TYPES.ABSTRACT_MATH;
  if (DAILY_LIFE_PATTERN_IDS.has(spec.patternSpecId)) contextType = G5A_U02_CONTEXT_TYPES.DAILY_LIFE;
  if (GEOMETRY_PATTERN_IDS.has(spec.patternSpecId)) contextType = G5A_U02_CONTEXT_TYPES.GEOMETRY_CONTEXT;
  return Object.freeze({ patternSpecId: spec.patternSpecId, contextType });
}));
const rowById = new Map(specs.map((row) => [row.patternSpecId, row]));
const allowedTypes = new Set(Object.values(G5A_U02_CONTEXT_TYPES));

export const G5A_U02_CONTEXT_TAXONOMY = Object.freeze({
  task: "S96M_G5A_U02_ContextTaxonomy",
  sourceId: "g5a_u02_5a02",
  status: "evidence_backed_context_taxonomy_complete_pending_ui_integration",
  defaultValue: G5A_U02_CONTEXT_TYPES.MIXED,
  options: G5A_U02_CONTEXT_OPTIONS,
  patternSpecCount: specs.length,
  classificationMethod: "explicit_existing_pattern_and_template_evidence",
  sdgSupported: false,
  contextRewriteAllowed: false,
  genericFallback: false,
  freeFormAI: false,
});

export function normalizeG5AU02ContextType(value) {
  return allowedTypes.has(value) ? value : G5A_U02_CONTEXT_TYPES.MIXED;
}

export function getG5AU02PatternContextType(patternSpecId) {
  return rowById.get(patternSpecId)?.contextType ?? null;
}

export function filterG5AU02PatternSpecIdsByContext(patternSpecIds = [], contextType = "mixed") {
  const normalized = normalizeG5AU02ContextType(contextType);
  const uniqueIds = [...new Set(Array.isArray(patternSpecIds) ? patternSpecIds : [])];
  if (normalized === G5A_U02_CONTEXT_TYPES.MIXED) return Object.freeze(uniqueIds);
  return Object.freeze(uniqueIds.filter((patternSpecId) => getG5AU02PatternContextType(patternSpecId) === normalized));
}

export function auditG5AU02ContextTaxonomy() {
  const errors = [];
  if (specs.length !== 22) errors.push("G5AU02_CONTEXT_PATTERN_COUNT_MISMATCH");
  if (specs.some((row) => !row.contextType)) errors.push("G5AU02_CONTEXT_MAPPING_MISSING");
  if (new Set(specs.map((row) => row.patternSpecId)).size !== specs.length) errors.push("G5AU02_CONTEXT_PATTERN_DUPLICATE");
  const countsByContext = Object.fromEntries(
    ["abstract_math", "daily_life", "geometry_context"].map((type) => [
      type,
      specs.filter((row) => row.contextType === type).length,
    ]),
  );
  if (Object.values(countsByContext).some((count) => count === 0)) errors.push("G5AU02_CONTEXT_CATEGORY_EMPTY");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    patternSpecCount: specs.length,
    mappedPatternSpecCount: specs.filter((row) => row.contextType).length,
    countsByContext: Object.freeze(countsByContext),
  });
}
