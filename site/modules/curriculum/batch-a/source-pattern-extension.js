import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-index.js";

const SOURCE_ID = "g3a_u02_3a02";
const BRIDGE_SOURCE_ID = "g3a_u02_3a02_context_estimate_runtime";
const WORD_SPEC_ID = "ps_g3a_u02_word_problem_estimation_add_sub";
const ROUND_SPEC_ID = "ps_g3a_u02_estimate_nearest_thousand";
const ADD_MISSING_SPEC_ID = "ps_g3a_u02_add_missing_digit_operand";
const SUB_MISSING_SPEC_ID = "ps_g3a_u02_sub_missing_digit_operand";
const ADD_EQUATION_SPEC_ID = "ps_g3a_u02_add_missing_digit_equation";
const SUB_EQUATION_SPEC_ID = "ps_g3a_u02_sub_missing_digit_equation";

const WORD_PROBLEM_DEFINITION = Object.freeze({
  patternSpecId: WORD_SPEC_ID,
  sourceId: SOURCE_ID,
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

function missingDigitDefinition(patternSpecId, title, operator) {
  return Object.freeze({
    patternSpecId,
    sourceId: SOURCE_ID,
    title,
    kind: "missingDigit",
    operator,
    leftRange: [1000, 9999],
    rightDigitCoverage: Object.freeze([1, 2, 3, 4]),
    blankPolicy: "operand_single_digit",
    resultBlankRequired: false,
    placeholder: "□",
    canonicalSkillIds: ["integer_add_sub_mixed"],
    skillTags: ["integer_add_sub_mixed", "missing_digit", operator === "add" ? "addition" : "subtraction"],
    difficultyTags: ["batch_a_browser_bridge", "missing_digit_operand"]
  });
}

function missingDigitEquationDefinition(patternSpecId, title, operator) {
  return Object.freeze({
    patternSpecId,
    sourceId: SOURCE_ID,
    title,
    kind: "missingDigitEquation",
    operator,
    leftRange: [1000, 9999],
    rightDigitCoverage: Object.freeze([1, 2, 3, 4]),
    blankPolicy: "equation_multi_digit_distinct_place",
    resultBlankRequired: true,
    samePlaceValueDoubleBlankAllowed: false,
    answerOrder: "prompt_left_to_right",
    placeholder: "□",
    canonicalSkillIds: ["integer_add_sub_mixed"],
    skillTags: ["integer_add_sub_mixed", "missing_digit", "equation_reasoning", operator === "add" ? "addition" : "subtraction"],
    difficultyTags: ["batch_a_browser_bridge", "missing_digit_equation"]
  });
}

const ADD_MISSING_DEFINITION = missingDigitDefinition(ADD_MISSING_SPEC_ID, "加法缺位填空", "add");
const SUB_MISSING_DEFINITION = missingDigitDefinition(SUB_MISSING_SPEC_ID, "減法缺位填空", "subtract");
const ADD_EQUATION_DEFINITION = missingDigitEquationDefinition(ADD_EQUATION_SPEC_ID, "加法等式缺位填空", "add");
const SUB_EQUATION_DEFINITION = missingDigitEquationDefinition(SUB_EQUATION_SPEC_ID, "減法等式缺位填空", "subtract");

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (patternSpecId === WORD_SPEC_ID) return WORD_PROBLEM_DEFINITION;
  if (patternSpecId === ADD_MISSING_SPEC_ID) return ADD_MISSING_DEFINITION;
  if (patternSpecId === SUB_MISSING_SPEC_ID) return SUB_MISSING_DEFINITION;
  if (patternSpecId === ADD_EQUATION_SPEC_ID) return ADD_EQUATION_DEFINITION;
  if (patternSpecId === SUB_EQUATION_SPEC_ID) return SUB_EQUATION_DEFINITION;
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (sourceId === BRIDGE_SOURCE_ID) return [WORD_SPEC_ID];
  const patternSpecIds = baseGetPatternIds(sourceId);
  if (sourceId === SOURCE_ID) {
    return patternSpecIds.filter((patternSpecId) => ![
      ROUND_SPEC_ID,
      WORD_SPEC_ID,
      ADD_MISSING_SPEC_ID,
      SUB_MISSING_SPEC_ID,
      ADD_EQUATION_SPEC_ID,
      SUB_EQUATION_SPEC_ID
    ].includes(patternSpecId));
  }
  return patternSpecIds;
}
