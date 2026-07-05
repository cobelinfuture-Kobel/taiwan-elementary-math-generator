import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-extension.js";

const sourceId = "g3a_u02_3a02";
const specId = "ps_g3a_u02_sub_middle_missing_digit";

const definition = Object.freeze({
  patternSpecId: specId,
  sourceId,
  title: "減法中間缺位填空",
  kind: "missingDigitEquation",
  operator: "subtract",
  leftRange: [1000, 9999],
  rightDigitCoverage: Object.freeze([3, 4]),
  blankPolicy: "sub_middle_place",
  resultBlankRequired: true,
  samePlaceValueDoubleBlankAllowed: false,
  middlePlaceRequired: true,
  answerOrder: "prompt_left_to_right",
  placeholder: "□",
  canonicalSkillIds: ["integer_add_sub_mixed"],
  skillTags: ["integer_add_sub_mixed", "missing_digit", "equation_reasoning", "subtraction", "middle_place"],
  difficultyTags: ["batch_a_browser_bridge", "sub_middle_missing_digit"]
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  if (patternSpecId === specId) return definition;
  return baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(id) {
  return baseGetPatternIds(id);
}
