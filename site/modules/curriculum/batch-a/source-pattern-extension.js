import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-index.js";

const BRIDGE_SOURCE_ID = "g3a_u02_3a02_context_estimate_runtime";
const WORD_SPEC_ID = "ps_g3a_u02_word_problem_estimation_add_sub";

const WORD_PROBLEM_DEFINITION = Object.freeze({
  patternSpecId: WORD_SPEC_ID,
  sourceId: BRIDGE_SOURCE_ID,
  title: "加減應用題估算",
  kind: "wordProblemEstimation",
  min: 1000,
  max: 9999,
  unit: 1000,
  operators: ["add", "subtract"],
  canonicalSkillIds: ["integer_add_sub_mixed"],
  skillTags: ["integer_add_sub_mixed", "rounding_approximation", "word_problem"],
  difficultyTags: ["batch_a_browser_bridge", "word_problem_estimation"],
  contextTags: ["fixed_template"]
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (patternSpecId === WORD_SPEC_ID) return WORD_PROBLEM_DEFINITION;
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId === BRIDGE_SOURCE_ID) return [WORD_SPEC_ID];
  return baseGetPatternIds(sourceId);
}
