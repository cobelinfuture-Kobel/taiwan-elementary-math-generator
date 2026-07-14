import { getG5AU02HiddenPatternSpecs } from "./source-pattern-g5a-u02-extension.js";

export const G5A_U02_REASONING_DEPTHS = Object.freeze({
  MIXED: "mixed",
  BASIC: "basic",
  EXTENDED: "extended",
});

export const G5A_U02_REASONING_DEPTH_OPTIONS = Object.freeze([
  Object.freeze({ value: "mixed", label: "基礎與進階混合" }),
  Object.freeze({ value: "basic", label: "基礎" }),
  Object.freeze({ value: "extended", label: "進階" }),
]);

// Explicit pedagogical classification. This list must not be inferred from
// implementationClass C/D because implementation complexity is not cognitive depth.
const EXTENDED_PATTERN_IDS = Object.freeze(new Set([
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_equal_partition_range_constrained_recipients",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_remainder_transfer",
  "ps_g5a_u02_possible_equal_packaging_counts",
  "ps_g5a_u02_square_tile_area_possibilities",
  "ps_g5a_u02_multi_constraint_digit_code",
]));

const specs = Object.freeze(getG5AU02HiddenPatternSpecs().map((spec) => Object.freeze({
  patternSpecId: spec.patternSpecId,
  reasoningDepth: EXTENDED_PATTERN_IDS.has(spec.patternSpecId)
    ? G5A_U02_REASONING_DEPTHS.EXTENDED
    : G5A_U02_REASONING_DEPTHS.BASIC,
})));
const rowById = new Map(specs.map((row) => [row.patternSpecId, row]));
const allowedDepths = new Set(Object.values(G5A_U02_REASONING_DEPTHS));

export const G5A_U02_REASONING_DEPTH_CONTRACT = Object.freeze({
  task: "S96L_G5A_U02_ReasoningDepthContract",
  sourceId: "g5a_u02_5a02",
  status: "explicit_depth_contract_complete_pending_ui_integration",
  defaultValue: G5A_U02_REASONING_DEPTHS.MIXED,
  options: G5A_U02_REASONING_DEPTH_OPTIONS,
  patternSpecCount: specs.length,
  classificationMethod: "explicit_pattern_spec_allowlist",
  implementationClassInference: false,
  genericFallback: false,
  freeFormAI: false,
});

export function normalizeG5AU02ReasoningDepth(value) {
  return allowedDepths.has(value) ? value : G5A_U02_REASONING_DEPTHS.MIXED;
}

export function getG5AU02PatternReasoningDepth(patternSpecId) {
  return rowById.get(patternSpecId)?.reasoningDepth ?? null;
}

export function filterG5AU02PatternSpecIdsByReasoningDepth(patternSpecIds = [], depth = "mixed") {
  const normalized = normalizeG5AU02ReasoningDepth(depth);
  const uniqueIds = [...new Set(Array.isArray(patternSpecIds) ? patternSpecIds : [])];
  if (normalized === G5A_U02_REASONING_DEPTHS.MIXED) return Object.freeze(uniqueIds);
  return Object.freeze(uniqueIds.filter((patternSpecId) => getG5AU02PatternReasoningDepth(patternSpecId) === normalized));
}

export function auditG5AU02ReasoningDepthContract() {
  const errors = [];
  if (specs.length !== 22) errors.push("G5AU02_DEPTH_PATTERN_COUNT_MISMATCH");
  if (specs.some((row) => !row.reasoningDepth)) errors.push("G5AU02_DEPTH_MAPPING_MISSING");
  if (new Set(specs.map((row) => row.patternSpecId)).size !== specs.length) errors.push("G5AU02_DEPTH_PATTERN_DUPLICATE");
  const basicCount = specs.filter((row) => row.reasoningDepth === "basic").length;
  const extendedCount = specs.filter((row) => row.reasoningDepth === "extended").length;
  if (basicCount === 0) errors.push("G5AU02_DEPTH_BASIC_EMPTY");
  if (extendedCount === 0) errors.push("G5AU02_DEPTH_EXTENDED_EMPTY");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    patternSpecCount: specs.length,
    mappedPatternSpecCount: specs.filter((row) => row.reasoningDepth).length,
    countsByDepth: Object.freeze({ basic: basicCount, extended: extendedCount }),
  });
}
