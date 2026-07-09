import * as base from "./batch-a-browser-validator-g4a-extension.js";
import {
  getBatchABrowserPatternDefinition,
  isG4AU08Phase2APatternSpecId
} from "./source-pattern-g4a-u08-phase2a-extension.js";
import {
  hasAllowedConversionRule,
  isConversionEligibleDomain,
  isUnitDomainAllowed,
  isUnitLabelAllowed
} from "./g4a-u08-application-units.js";

const G4A_U08_PATTERN_SPEC_IDS = new Set([
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
const G4A_U08_OVERLAY_SPEC_IDS = new Set([
  "ps_g4a_u08_large_add_sub_overlay_no_parentheses",
  "ps_g4a_u08_large_add_sub_overlay_with_parentheses"
]);
const OPERATORS = new Set(["+", "-", "×", "÷"]);
const PRECEDENCE = Object.freeze({ "+": 1, "-": 1, "×": 2, "÷": 2 });

function issue(code, path, message = code, severity = "error") {
  return { code, severity, path, message };
}

function toRpn(tokens) {
  const output = [];
  const ops = [];
  for (const token of tokens) {
    if (Number.isInteger(token)) output.push(token);
    else if (token === "(") ops.push(token);
    else if (token === ")") {
      while (ops.length > 0 && ops[ops.length - 1] !== "(") output.push(ops.pop());
      if (ops.pop() !== "(") throw new Error("unmatched_parentheses");
    } else if (OPERATORS.has(token)) {
      while (ops.length > 0 && OPERATORS.has(ops[ops.length - 1]) && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) output.push(ops.pop());
      ops.push(token);
    } else throw new Error("invalid_token");
  }
  while (ops.length > 0) {
    const op = ops.pop();
    if (op === "(" || op === ")") throw new Error("unmatched_parentheses");
    output.push(op);
  }
  return output;
}

function evaluateExpressionTokens(tokens) {
  const stack = [];
  const operations = [];
  for (const token of toRpn(tokens)) {
    if (Number.isInteger(token)) {
      stack.push(token);
      continue;
    }
    const right = stack.pop();
    const left = stack.pop();
    if (!Number.isFinite(left) || !Number.isFinite(right)) throw new Error("operand_missing");
    let result;
    if (token === "+") result = left + right;
    else if (token === "-") result = left - right;
    else if (token === "×") result = left * right;
    else if (token === "÷") {
      if (right === 0 || left % right !== 0) throw new Error("division_not_exact");
      result = left / right;
    }
    operations.push({ op: token, left, right, result });
    stack.push(result);
  }
  if (stack.length !== 1) throw new Error("expression_invalid");
  return { finalAnswer: stack[0], operations, intermediateResults: operations.map((operation) => operation.result) };
}

function tokensToExpression(tokens) {
  return tokens.join(" ").replaceAll("( ", "(").replaceAll(" )", ")");
}

function validateG4AU08Expression(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  if (!G4A_U08_PATTERN_SPEC_IDS.has(patternSpecId)) return null;
  const errors = [];
  if (question.metadata?.sourceId !== "g4a_u08_4a08") errors.push(issue("batch_a_question_source_mismatch", "metadata.sourceId"));
  if (question.kind !== "g4aU08OrderOfOperationsExpression") errors.push(issue("batch_a_g4a_u08_kind_invalid", "kind"));
  if (!Array.isArray(question.expressionTokens) || question.expressionTokens.length < 3) {
    errors.push(issue("batch_a_g4a_u08_expression_tokens_invalid", "expressionTokens"));
    return { ok: false, errors, warnings: [] };
  }
  let evaluated;
  try {
    evaluated = evaluateExpressionTokens(question.expressionTokens);
  } catch (error) {
    errors.push(issue("batch_a_g4a_u08_expression_invalid", "expressionTokens", error.message));
    return { ok: false, errors, warnings: [] };
  }
  const expectedExpression = tokensToExpression(question.expressionTokens);
  if (question.expression !== expectedExpression) errors.push(issue("batch_a_g4a_u08_expression_text_invalid", "expression"));
  if (question.blankedDisplayText !== `${expectedExpression} = ______`) errors.push(issue("batch_a_g4a_u08_prompt_invalid", "blankedDisplayText"));
  for (const forbidden of ["括號", "乘除", "加減", "同級", "四則"]) if (String(question.blankedDisplayText ?? "").includes(forbidden)) errors.push(issue("batch_a_g4a_u08_prompt_label_leak", "blankedDisplayText"));
  if (question.finalAnswer !== evaluated.finalAnswer) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (question.answerText !== String(evaluated.finalAnswer)) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (evaluated.finalAnswer < 0 || evaluated.finalAnswer > 9999) errors.push(issue("batch_a_g4a_u08_final_range_invalid", "finalAnswer"));
  for (const [index, value] of evaluated.intermediateResults.entries()) if (!Number.isInteger(value) || value < 0 || value > 9999) errors.push(issue("batch_a_g4a_u08_intermediate_range_invalid", `intermediateResults[${index}]`));
  for (const [index, operation] of evaluated.operations.entries()) {
    if (operation.op === "×" && operation.result > 500) errors.push(issue("batch_a_g4a_u08_multiplication_too_large", `operationOrderTrace[${index}]`));
    if (operation.op === "÷" && operation.result > 100) errors.push(issue("batch_a_g4a_u08_division_quotient_too_large", `operationOrderTrace[${index}]`));
  }
  if (question.largeAddSubOverlay !== G4A_U08_OVERLAY_SPEC_IDS.has(patternSpecId)) errors.push(issue("batch_a_g4a_u08_overlay_flag_invalid", "largeAddSubOverlay"));
  if (!Array.isArray(question.operationOrderTrace) || question.operationOrderTrace.length !== evaluated.operations.length) errors.push(issue("batch_a_g4a_u08_trace_invalid", "operationOrderTrace"));
  if (Array.isArray(question.operationOrderTrace)) for (let index = 0; index < Math.min(question.operationOrderTrace.length, evaluated.operations.length); index += 1) {
    const expected = evaluated.operations[index];
    const actual = question.operationOrderTrace[index];
    for (const key of ["op", "left", "right", "result"]) if (actual?.[key] !== expected[key]) errors.push(issue("batch_a_g4a_u08_trace_invalid", `operationOrderTrace[${index}].${key}`));
  }
  if (!Array.isArray(question.ruleTags) || question.ruleTags.length === 0) errors.push(issue("batch_a_g4a_u08_rule_tags_missing", "ruleTags"));
  if (question.hasParentheses !== question.expressionTokens.includes("(")) errors.push(issue("batch_a_g4a_u08_parentheses_flag_invalid", "hasParentheses"));
  if (question.hasMulDiv !== question.expressionTokens.some((token) => token === "×" || token === "÷")) errors.push(issue("batch_a_g4a_u08_mul_div_flag_invalid", "hasMulDiv"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

function canUseUnitLabel(question, definition) {
  if (definition.storyTemplateId === "tpl_app_divide_by_group_product" && question.unitLabel === "份") return true;
  return isUnitLabelAllowed(question.unitDomain, question.unitLabel);
}

function canUseFinalUnitLabel(question, definition) {
  if (definition.storyTemplateId === "tpl_app_divide_by_group_product" && question.finalUnitLabel === "份") return true;
  return isUnitLabelAllowed(question.unitDomain, question.finalUnitLabel);
}

function hasInternalIdLeak(text) {
  return /(?:kp_|pg_|ps_|tpl_)/.test(String(text ?? ""));
}

function validateG4AU08Application(question = {}) {
  const patternSpecId = question.patternSpecId ?? question.metadata?.patternId;
  if (!isG4AU08Phase2APatternSpecId(patternSpecId)) return null;
  const errors = [];
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  if (!definition) errors.push(issue("batch_a_g4a_u08_app_definition_missing", "patternSpecId"));
  if (question.sourceId !== "g4a_u08_4a08" || question.metadata?.sourceId !== "g4a_u08_4a08") errors.push(issue("batch_a_question_source_mismatch", "sourceId"));
  if (question.phase !== "Phase2A") errors.push(issue("batch_a_g4a_u08_app_phase_invalid", "phase"));
  if (question.kind !== "g4aU08ApplicationWordProblem") errors.push(issue("batch_a_g4a_u08_app_kind_invalid", "kind"));
  if (definition && question.knowledgePointId !== definition.knowledgePointId) errors.push(issue("batch_a_g4a_u08_app_kp_mismatch", "knowledgePointId"));
  if (definition && question.storyTemplateId !== definition.storyTemplateId) errors.push(issue("batch_a_g4a_u08_app_template_mismatch", "storyTemplateId"));
  if (!isUnitDomainAllowed(question.unitDomain)) errors.push(issue("batch_a_g4a_u08_app_unit_domain_invalid", "unitDomain"));
  if (definition && !definition.allowedUnitDomains.includes(question.unitDomain)) errors.push(issue("batch_a_g4a_u08_app_unit_domain_not_allowed", "unitDomain"));
  if (definition && !canUseUnitLabel(question, definition)) errors.push(issue("batch_a_g4a_u08_app_unit_label_invalid", "unitLabel"));
  if (definition && !canUseFinalUnitLabel(question, definition)) errors.push(issue("batch_a_g4a_u08_app_final_unit_invalid", "finalUnitLabel"));
  if (!Array.isArray(question.equationTokens) || question.equationTokens.length < 3) {
    errors.push(issue("batch_a_g4a_u08_app_equation_tokens_invalid", "equationTokens"));
    return { ok: false, errors, warnings: [] };
  }
  let evaluated;
  try {
    evaluated = evaluateExpressionTokens(question.equationTokens);
  } catch (error) {
    errors.push(issue("batch_a_g4a_u08_app_equation_invalid", "equationTokens", error.message));
    return { ok: false, errors, warnings: [] };
  }
  const expectedEquation = tokensToExpression(question.equationTokens);
  if (question.equationModel !== expectedEquation) errors.push(issue("batch_a_g4a_u08_app_equation_text_invalid", "equationModel"));
  if (question.finalAnswer !== evaluated.finalAnswer) errors.push(issue("batch_a_answer_incorrect", "finalAnswer"));
  if (!Number.isInteger(question.finalAnswer) || question.finalAnswer < 0) errors.push(issue("batch_a_g4a_u08_app_final_answer_invalid", "finalAnswer"));
  for (const [index, value] of evaluated.intermediateResults.entries()) if (!Number.isInteger(value) || value < 0) errors.push(issue("batch_a_g4a_u08_app_intermediate_invalid", `intermediateResults[${index}]`));
  const expectedAnswerWithUnit = `${evaluated.finalAnswer} ${question.finalUnitLabel}`;
  if (question.finalAnswerWithUnit !== expectedAnswerWithUnit) errors.push(issue("batch_a_g4a_u08_app_final_answer_with_unit_invalid", "finalAnswerWithUnit"));
  if (question.answerText !== expectedAnswerWithUnit) errors.push(issue("batch_a_answer_incorrect", "answerText"));
  if (typeof question.promptText !== "string" || question.promptText.length === 0 || question.blankedDisplayText !== question.promptText) errors.push(issue("batch_a_g4a_u08_app_prompt_invalid", "promptText"));
  if (hasInternalIdLeak(question.promptText) || hasInternalIdLeak(question.blankedDisplayText)) errors.push(issue("batch_a_g4a_u08_app_prompt_id_leak", "promptText"));
  if (!Array.isArray(question.operationOrderTags) || question.operationOrderTags.length === 0) errors.push(issue("batch_a_g4a_u08_app_operation_tags_missing", "operationOrderTags"));
  if (!question.quantities || typeof question.quantities !== "object") errors.push(issue("batch_a_g4a_u08_app_quantities_missing", "quantities"));
  if (question.metadata?.patternId !== patternSpecId) errors.push(issue("batch_a_g4a_u08_app_metadata_pattern_mismatch", "metadata.patternId"));

  if (question.conversionRequired === true) {
    const ruleId = question.conversionRule?.ruleId;
    if (!isConversionEligibleDomain(question.unitDomain)) errors.push(issue("batch_a_g4a_u08_app_conversion_domain_not_eligible", "unitDomain"));
    if (!ruleId || !hasAllowedConversionRule(question.unitDomain, ruleId)) errors.push(issue("batch_a_g4a_u08_app_conversion_rule_invalid", "conversionRule"));
    if (!Number.isInteger(question.conversionRule?.factor) || question.conversionRule.factor <= 1) errors.push(issue("batch_a_g4a_u08_app_conversion_factor_invalid", "conversionRule.factor"));
    if (!question.convertedQuantities || typeof question.convertedQuantities !== "object") errors.push(issue("batch_a_g4a_u08_app_converted_quantities_missing", "convertedQuantities"));
    if (typeof question.conversionLine !== "string" || question.conversionLine.length === 0) errors.push(issue("batch_a_g4a_u08_app_conversion_line_missing", "conversionLine"));
    if (question.conversionRule?.fromUnit && question.unitLabel !== question.conversionRule.fromUnit) errors.push(issue("batch_a_g4a_u08_app_conversion_from_unit_mismatch", "unitLabel"));
    if (question.conversionRule?.toUnit && definition?.storyTemplateId !== "tpl_app_divide_by_group_product" && question.finalUnitLabel !== question.conversionRule.toUnit) errors.push(issue("batch_a_g4a_u08_app_conversion_to_unit_mismatch", "finalUnitLabel"));
  } else {
    if (question.conversionRequired !== false) errors.push(issue("batch_a_g4a_u08_app_conversion_required_invalid", "conversionRequired"));
    if (question.conversionRule != null) errors.push(issue("batch_a_g4a_u08_app_unexpected_conversion_rule", "conversionRule"));
    if (question.convertedQuantities != null) errors.push(issue("batch_a_g4a_u08_app_unexpected_converted_quantities", "convertedQuantities"));
    if (question.conversionLine != null) errors.push(issue("batch_a_g4a_u08_app_unexpected_conversion_line", "conversionLine"));
    if (definition?.storyTemplateId !== "tpl_app_divide_by_group_product" && question.unitLabel !== question.finalUnitLabel) errors.push(issue("batch_a_g4a_u08_app_same_unit_mismatch", "finalUnitLabel"));
  }

  return { ok: errors.length === 0, errors, warnings: [] };
}

export function validateBatchABrowserPlan(plan = {}) {
  return base.validateBatchABrowserPlan(plan);
}

export function validateBatchABrowserQuestion(question = {}) {
  const g4aU08Application = validateG4AU08Application(question);
  if (g4aU08Application) return g4aU08Application;
  const g4aU08Expression = validateG4AU08Expression(question);
  if (g4aU08Expression) return g4aU08Expression;
  return base.validateBatchABrowserQuestion(question);
}

export function validateBatchABrowserQuestions(questions = []) {
  const errors = [];
  const warnings = [];
  for (const [index, question] of questions.entries()) {
    const result = validateBatchABrowserQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
    warnings.push(...result.warnings);
  }
  return { ok: errors.length === 0, errors, warnings, infos: [], validatorVersion: "s56g2r-g4a-u08-phase2a-application-v1", validatedAt: null };
}
