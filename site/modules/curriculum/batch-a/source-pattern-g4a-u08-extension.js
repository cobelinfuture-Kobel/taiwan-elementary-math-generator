import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-g4a-u04-extension.js";

export const G4A_U08_SOURCE_ID = "g4a_u08_4a08";
export const G4A_U08_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u08_parentheses_add_sub",
  "ps_g4a_u08_parentheses_mul_div",
  "ps_g4a_u08_mul_before_add_sub",
  "ps_g4a_u08_div_before_add_sub",
  "ps_g4a_u08_add_sub_left_to_right",
  "ps_g4a_u08_mul_div_left_to_right",
  "ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses",
  "ps_g4a_u08_mixed_with_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);

function expressionDefinition({ patternSpecId, title, coreRule, expressionFamily, coverageCase, ruleTags, largeAddSubOverlay = false, hasParentheses = false, hasMulDiv = false, requiresLeftToRight = false }) {
  return Object.freeze({
    patternSpecId,
    sourceId: G4A_U08_SOURCE_ID,
    title,
    kind: "g4aU08OrderOfOperationsExpression",
    coreRule,
    expressionFamily,
    coverageCase,
    ruleTags: Object.freeze([...ruleTags]),
    largeAddSubOverlay,
    hasParentheses,
    hasMulDiv,
    requiresLeftToRight,
    answerModel: Object.freeze({ shape: "final_numeric_answer", fields: Object.freeze(["finalAnswer"]) }),
    canonicalSkillIds: Object.freeze(["integer_order_of_operations"]),
    skillTags: Object.freeze(["order_of_operations", ...ruleTags]),
    difficultyTags: Object.freeze(["batch_a_browser_bridge", largeAddSubOverlay ? "g4a_u08_large_add_sub_overlay" : "g4a_u08_order_process"])
  });
}

const definitions = Object.freeze({
  ps_g4a_u08_parentheses_add_sub: expressionDefinition({
    patternSpecId: "ps_g4a_u08_parentheses_add_sub",
    title: "括號優先：加減括號",
    coreRule: "parentheses_first",
    expressionFamily: "parentheses_add_sub",
    coverageCase: "parentheses_first_add_sub",
    ruleTags: ["parentheses_first"],
    hasParentheses: true
  }),
  ps_g4a_u08_parentheses_mul_div: expressionDefinition({
    patternSpecId: "ps_g4a_u08_parentheses_mul_div",
    title: "括號優先：乘除括號",
    coreRule: "parentheses_first",
    expressionFamily: "parentheses_mul_div",
    coverageCase: "parentheses_first_mul_div",
    ruleTags: ["parentheses_first", "mul_div_left_to_right"],
    hasParentheses: true,
    hasMulDiv: true,
    requiresLeftToRight: true
  }),
  ps_g4a_u08_mul_before_add_sub: expressionDefinition({
    patternSpecId: "ps_g4a_u08_mul_before_add_sub",
    title: "乘法先於加減",
    coreRule: "mul_div_before_add_sub",
    expressionFamily: "mul_before_add_sub",
    coverageCase: "multiply_before_add_sub",
    ruleTags: ["mul_div_before_add_sub"],
    hasMulDiv: true
  }),
  ps_g4a_u08_div_before_add_sub: expressionDefinition({
    patternSpecId: "ps_g4a_u08_div_before_add_sub",
    title: "除法先於加減",
    coreRule: "mul_div_before_add_sub",
    expressionFamily: "div_before_add_sub",
    coverageCase: "divide_before_add_sub",
    ruleTags: ["mul_div_before_add_sub"],
    hasMulDiv: true
  }),
  ps_g4a_u08_add_sub_left_to_right: expressionDefinition({
    patternSpecId: "ps_g4a_u08_add_sub_left_to_right",
    title: "加減同級由左至右",
    coreRule: "left_to_right_same_level",
    expressionFamily: "add_sub_left_to_right",
    coverageCase: "add_sub_left_to_right",
    ruleTags: ["add_sub_left_to_right"],
    requiresLeftToRight: true
  }),
  ps_g4a_u08_mul_div_left_to_right: expressionDefinition({
    patternSpecId: "ps_g4a_u08_mul_div_left_to_right",
    title: "乘除同級由左至右",
    coreRule: "left_to_right_same_level",
    expressionFamily: "mul_div_left_to_right",
    coverageCase: "mul_div_left_to_right",
    ruleTags: ["mul_div_left_to_right"],
    hasMulDiv: true,
    requiresLeftToRight: true
  }),
  ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses: expressionDefinition({
    patternSpecId: "ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses",
    title: "無括號四則混合",
    coreRule: "comprehensive_order",
    expressionFamily: "mixed_no_parentheses",
    coverageCase: "mixed_no_parentheses",
    ruleTags: ["mul_div_before_add_sub", "mul_div_left_to_right", "add_sub_left_to_right"],
    hasMulDiv: true,
    requiresLeftToRight: true
  }),
  ps_g4a_u08_mixed_with_parentheses: expressionDefinition({
    patternSpecId: "ps_g4a_u08_mixed_with_parentheses",
    title: "有括號四則混合",
    coreRule: "comprehensive_order",
    expressionFamily: "mixed_with_parentheses",
    coverageCase: "mixed_with_parentheses",
    ruleTags: ["parentheses_first", "mul_div_before_add_sub"],
    hasParentheses: true,
    hasMulDiv: true
  }),
  ps_g4a_u08_large_add_sub_overlay_no_parentheses: expressionDefinition({
    patternSpecId: "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
    title: "大數加減包裝：無括號",
    coreRule: "comprehensive_order",
    expressionFamily: "large_no_parentheses",
    coverageCase: "large_add_sub_overlay_no_parentheses",
    ruleTags: ["mul_div_before_add_sub", "large_add_sub_overlay"],
    hasMulDiv: true,
    largeAddSubOverlay: true
  }),
  ps_g4a_u08_large_add_sub_overlay_with_parentheses: expressionDefinition({
    patternSpecId: "ps_g4a_u08_large_add_sub_overlay_with_parentheses",
    title: "大數加減包裝：有括號",
    coreRule: "comprehensive_order",
    expressionFamily: "large_with_parentheses",
    coverageCase: "large_add_sub_overlay_with_parentheses",
    ruleTags: ["parentheses_first", "mul_div_before_add_sub", "large_add_sub_overlay"],
    hasParentheses: true,
    hasMulDiv: true,
    largeAddSubOverlay: true
  })
});

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const baseIds = baseGetPatternIds(sourceId);
  if (sourceId === G4A_U08_SOURCE_ID) return [...baseIds, ...G4A_U08_PATTERN_SPEC_IDS];
  return baseIds;
}
