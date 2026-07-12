import {
  getG5AU08HiddenPatternSpecById,
} from "./source-pattern-g5a-u08-extension.js";
import {
  G5A_U08_S60G_PATTERN_SPEC_IDS,
} from "./g5a-u08-numeric-generator.js";

export const G5A_U08_BLOCKING_CODES = Object.freeze([
  "G5A_U08_SOURCE_ID_MISMATCH",
  "G5A_U08_KNOWLEDGE_POINT_MISMATCH",
  "G5A_U08_PATTERN_GROUP_MISMATCH",
  "G5A_U08_PATTERN_SPEC_MISMATCH",
  "G5A_U08_MODE_MISMATCH",
  "G5A_U08_DEPTH_NOT_ALLOWED",
  "G5A_U08_SEMANTIC_DELTA_COUNT_INVALID",
  "G5A_U08_SEMANTIC_DELTA_NOT_ALLOWED",
  "G5A_U08_N_PLUS_2_FORBIDDEN_IN_CORE",
  "G5A_U08_NUMERIC_ANSWER_INCORRECT",
  "G5A_U08_EXPRESSION_PARSE_FAILED",
  "G5A_U08_EXPRESSION_NOT_EQUIVALENT",
  "G5A_U08_OPERATION_SIGNATURE_MISMATCH",
  "G5A_U08_REQUIRED_FACT_UNUSED",
  "G5A_U08_FACT_USED_MORE_THAN_ONCE",
  "G5A_U08_SINGLE_EXPRESSION_REQUIRED",
  "G5A_U08_ILLEGAL_SUBTRACTION_REGROUP",
  "G5A_U08_ILLEGAL_DIVISION_REGROUP",
  "G5A_U08_DIVISION_BY_ZERO",
  "G5A_U08_NONINTEGER_RESULT_FORBIDDEN",
  "G5A_U08_NONINTEGER_INTERMEDIATE_WITHOUT_REGROUPING",
  "G5A_U08_OPERATOR_SEQUENCE_INCORRECT",
  "G5A_U08_OPERATOR_SEQUENCE_AMBIGUOUS",
  "G5A_U08_EQUALITY_JUDGEMENT_INCORRECT",
  "G5A_U08_ERROR_TYPE_INCORRECT",
  "G5A_U08_AVERAGE_CONTRACT_BROKEN",
  "G5A_U08_AVERAGE_MISSING_VALUE_NOT_UNIQUE",
  "G5A_U08_ALLOCATION_TRANSFER_INCORRECT",
  "G5A_U08_ROLE_BINDING_INVALID",
  "G5A_U08_UNIT_FLOW_INVALID",
  "G5A_U08_NEGATIVE_QUANTITY_FORBIDDEN",
  "G5A_U08_IMPOSSIBLE_ALLOCATION",
  "G5A_U08_PAYMENT_INSUFFICIENT",
  "G5A_U08_SDG_LABEL_ONLY_CONTEXT",
  "G5A_U08_REAL_STATISTIC_SOURCE_REQUIRED",
  "G5A_U08_GENERIC_FALLBACK_FORBIDDEN",
]);

export const G5A_U08_WARNING_CODES = Object.freeze([
  "G5A_U08_NONPREFERRED_BUT_VALID_STRATEGY",
  "G5A_U08_DUPLICATE_SURFACE_CONTEXT",
  "G5A_U08_CHALLENGE_REPRESENTATION_AVAILABLE",
]);

const OPERATORS = Object.freeze(["+", "-", "×", "÷"]);

function issue(code, path, message, stage, severity = "error") {
  return { code, severity, path, message, stage };
}

function add(errors, code, path, message, stage) {
  if (!errors.some((row) => row.code === code && row.path === path)) {
    errors.push(issue(code, path, message, stage));
  }
}

function isInteger(value) {
  return Number.isSafeInteger(value);
}

function isIntegerArray(values, minLength = 1) {
  return Array.isArray(values) && values.length >= minLength && values.every(isInteger);
}

function evaluateOperatorSequence(operands, operators) {
  if (!isIntegerArray(operands, 2) || !Array.isArray(operators) || operators.length !== operands.length - 1) {
    return null;
  }
  const values = [...operands];
  const ops = [...operators];
  for (let index = 0; index < ops.length;) {
    if (ops[index] === "×" || ops[index] === "÷") {
      const left = values[index];
      const right = values[index + 1];
      if (ops[index] === "÷" && right === 0) return null;
      const result = ops[index] === "×" ? left * right : left / right;
      if (!Number.isFinite(result)) return null;
      values.splice(index, 2, result);
      ops.splice(index, 1);
    } else if (ops[index] === "+" || ops[index] === "-") {
      index += 1;
    } else {
      return null;
    }
  }
  let result = values[0];
  for (let index = 0; index < ops.length; index += 1) {
    result = ops[index] === "+" ? result + values[index + 1] : result - values[index + 1];
  }
  return result;
}

function countOperatorSolutions(operands, target) {
  let count = 0;
  for (const first of OPERATORS) {
    for (const second of OPERATORS) {
      if (evaluateOperatorSequence(operands, [first, second]) === target) count += 1;
    }
  }
  return count;
}

function validateIdentity(question, errors) {
  const stage = "identity";
  const spec = getG5AU08HiddenPatternSpecById(question?.patternSpecId);
  if (question?.sourceId !== "g5a_u08_5a08" || question?.unitCode !== "5A-U08") {
    add(errors, "G5A_U08_SOURCE_ID_MISMATCH", "sourceId", "題目來源不是 G5A-U08。", stage);
  }
  if (!spec || !G5A_U08_S60G_PATTERN_SPEC_IDS.includes(question?.patternSpecId)) {
    add(errors, "G5A_U08_PATTERN_SPEC_MISMATCH", "patternSpecId", "PatternSpec 不在 S60G 核准範圍。", stage);
    return null;
  }
  if (question.patternGroupId !== spec.patternGroupId) {
    add(errors, "G5A_U08_PATTERN_GROUP_MISMATCH", "patternGroupId", "PatternGroup 與 PatternSpec 不一致。", stage);
  }
  if (question.knowledgePointId !== spec.knowledgePointId) {
    add(errors, "G5A_U08_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "KnowledgePoint 與 PatternSpec 不一致。", stage);
  }
  if (question.mode !== spec.mode) {
    add(errors, "G5A_U08_MODE_MISMATCH", "mode", "題型模式與 PatternGroup 不一致。", stage);
  }
  if (
    question.kind !== "g5aU08IntegerFourOperations" ||
    question.generatorRouting !== "hidden_only_not_canonical" ||
    question.fallbackUsed === true ||
    question.genericFallbackAllowed === true
  ) {
    add(errors, "G5A_U08_GENERIC_FALLBACK_FORBIDDEN", "generatorRouting", "S60G 禁止 generic fallback 或公開 routing。", stage);
  }
  return spec;
}

function validateDepthAndPresentation(question, errors) {
  const stage = "depth_and_semantics";
  if (question.depth !== "N") {
    add(errors, "G5A_U08_DEPTH_NOT_ALLOWED", "depth", "S60G 只允許 Level N 非情境題。", stage);
  }
  if (question.depth === "N_PLUS_2") {
    add(errors, "G5A_U08_N_PLUS_2_FORBIDDEN_IN_CORE", "depth", "核心模式禁止 N+2。", stage);
  }
  if (!Array.isArray(question.semanticDeltaIds) || question.semanticDeltaIds.length !== 0) {
    add(errors, "G5A_U08_SEMANTIC_DELTA_COUNT_INVALID", "semanticDeltaIds", "S60G 題目不得包含 semantic delta。", stage);
  }
  if (question.applicationText !== false || question.mode === "application") {
    add(errors, "G5A_U08_MODE_MISMATCH", "applicationText", "S60G 不產生應用題。", stage);
  }
  if (typeof question.promptText !== "string" || question.promptText.trim() === "") {
    add(errors, "G5A_U08_EXPRESSION_PARSE_FAILED", "promptText", "題目算式不可為空。", stage);
  }
}

function requireNumericAnswer(question, expected, errors) {
  const stage = "arithmetic_and_expression";
  if (
    question.answerModelShape !== "numericAnswer" ||
    !isInteger(expected) ||
    question.finalAnswer !== expected ||
    question.answerText !== String(expected)
  ) {
    add(errors, "G5A_U08_NUMERIC_ANSWER_INCORRECT", "finalAnswer", "數值答案與題目結構不一致。", stage);
  }
  if (expected < 0) {
    add(errors, "G5A_U08_NEGATIVE_QUANTITY_FORBIDDEN", "finalAnswer", "核心整數四則題不得產生負答案。", stage);
  }
}

function validateMixedPrecedence3(question, errors) {
  const q = question.quantities ?? {};
  if (![q.a, q.b, q.c, q.d].every(isInteger) || q.c <= 1) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "三運算混合題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const expected = q.a + q.b * q.c - q.d;
  requireNumericAnswer(question, expected, errors);
  if (question.strategyProof?.multiplicationFirst !== q.b * q.c) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "strategyProof.multiplicationFirst", "先乘除後加減證明錯誤。", "arithmetic_and_expression");
  }
  if (question.strategyProof?.naiveLeftToRightValue === expected) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "strategyProof.naiveLeftToRightValue", "題目未有效區分運算順序。", "arithmetic_and_expression");
  }
}

function validateMixedPrecedence4(question, errors) {
  const q = question.quantities ?? {};
  if (![q.a, q.b, q.c, q.d, q.e].every(isInteger) || q.e === 0) {
    add(errors, q.e === 0 ? "G5A_U08_DIVISION_BY_ZERO" : "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "四則混合題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  if (q.d % q.e !== 0) {
    add(errors, "G5A_U08_NONINTEGER_RESULT_FORBIDDEN", "quantities", "除法部分必須整除。", "arithmetic_and_expression");
  }
  const expected = q.a + q.b * q.c - q.d / q.e;
  requireNumericAnswer(question, expected, errors);
  if (question.strategyProof?.multiplicationFirst !== q.b * q.c || question.strategyProof?.divisionFirst !== q.d / q.e) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "strategyProof", "乘除優先步驟不正確。", "arithmetic_and_expression");
  }
}

function validateSignedRegroup(question, errors) {
  const q = question.quantities ?? {};
  if (![q.a, q.b, q.c, q.d].every(isInteger)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "加減重組題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  requireNumericAnswer(question, q.a - q.b + q.c - q.d, errors);
  const proof = question.strategyProof ?? {};
  const valid =
    Array.isArray(proof.positiveTerms) && proof.positiveTerms[0] === q.a && proof.positiveTerms[1] === q.c &&
    Array.isArray(proof.negativeTerms) && proof.negativeTerms[0] === q.b && proof.negativeTerms[1] === q.d &&
    proof.negativeTermSum === q.b + q.d;
  if (!valid) {
    add(errors, "G5A_U08_ILLEGAL_SUBTRACTION_REGROUP", "strategyProof", "減法必須以帶符號項目重組，不可誤用結合律。", "arithmetic_and_expression");
  }
}

function validateConsecutiveSubtraction(question, errors) {
  const q = question.quantities ?? {};
  if (!isInteger(q.minuend) || !isIntegerArray(q.subtrahends, 2)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "連減題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const combined = q.subtrahends.reduce((sum, value) => sum + value, 0);
  requireNumericAnswer(question, q.minuend - combined, errors);
  if (question.strategyProof?.combinedSubtrahend !== combined) {
    add(errors, "G5A_U08_ILLEGAL_SUBTRACTION_REGROUP", "strategyProof.combinedSubtrahend", "連續減法只能合併所有減數。", "arithmetic_and_expression");
  }
}

function validateMulDivRegroup(question, errors) {
  const q = question.quantities ?? {};
  if (![q.a, q.divisor, q.multiplier, q.extra].every(isInteger)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "乘除重組題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  if (q.divisor === 0) {
    add(errors, "G5A_U08_DIVISION_BY_ZERO", "quantities.divisor", "除數不得為 0。", "arithmetic_and_expression");
    return;
  }
  const expected = q.a * q.multiplier * q.extra / q.divisor;
  if (!isInteger(expected)) {
    add(errors, "G5A_U08_NONINTEGER_RESULT_FORBIDDEN", "finalAnswer", "重組後結果必須是整數。", "arithmetic_and_expression");
  }
  requireNumericAnswer(question, expected, errors);
  const proof = question.strategyProof ?? {};
  if (q.multiplier % q.divisor !== 0 || proof.cancellationFactor !== q.divisor || proof.regroupedMultiplier !== q.multiplier / q.divisor) {
    add(errors, "G5A_U08_ILLEGAL_DIVISION_REGROUP", "strategyProof", "乘除重組必須保留除法方向並合法約分。", "arithmetic_and_expression");
  }
  if (q.a % q.divisor !== 0 && !Number.isInteger(proof.nonIntegerLeftToRightIntermediate)) {
    return;
  }
  if (q.a % q.divisor !== 0 && proof.nonIntegerLeftToRightIntermediate !== q.a / q.divisor) {
    add(errors, "G5A_U08_NONINTEGER_INTERMEDIATE_WITHOUT_REGROUPING", "strategyProof.nonIntegerLeftToRightIntermediate", "非整數中間值必須由合法因數重組說明。", "arithmetic_and_expression");
  }
}

function validateContinuousDivision(question, errors) {
  const q = question.quantities ?? {};
  if (!isInteger(q.dividend) || !isIntegerArray(q.divisors, 2) || q.divisors.some((value) => value === 0)) {
    add(errors, q.divisors?.some?.((value) => value === 0) ? "G5A_U08_DIVISION_BY_ZERO" : "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "連除題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const product = q.divisors.reduce((value, divisor) => value * divisor, 1);
  if (q.dividend % product !== 0) {
    add(errors, "G5A_U08_NONINTEGER_RESULT_FORBIDDEN", "quantities", "連除題必須整除。", "arithmetic_and_expression");
  }
  requireNumericAnswer(question, q.dividend / product, errors);
  if (question.strategyProof?.combinedDivisor !== product) {
    add(errors, "G5A_U08_ILLEGAL_DIVISION_REGROUP", "strategyProof.combinedDivisor", "a÷b÷c 只能正規化為 a÷(b×c)。", "arithmetic_and_expression");
  }
}

function validateDistributive(question, errors, operation) {
  const q = question.quantities ?? {};
  if (![q.a, q.b, q.c].every(isInteger) || (operation === "sub" && q.a <= q.b)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "分配律展開題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const expected = (operation === "add" ? q.a + q.b : q.a - q.b) * q.c;
  requireNumericAnswer(question, expected, errors);
  const expectedTerms = operation === "add" ? [q.a * q.c, q.b * q.c] : [q.a * q.c, -(q.b * q.c)];
  if (JSON.stringify(question.strategyProof?.expandedTerms) !== JSON.stringify(expectedTerms)) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "strategyProof.expandedTerms", "分配律展開結果不等值。", "arithmetic_and_expression");
  }
}

function validateCommonFactor(question, errors, operation) {
  const q = question.quantities ?? {};
  if (![q.a, q.b, q.c].every(isInteger) || (operation === "sub" && q.a <= q.b)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "提取公因數題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const expected = (operation === "add" ? q.a + q.b : q.a - q.b) * q.c;
  requireNumericAnswer(question, expected, errors);
  if (question.strategyProof?.commonFactor !== q.c) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "strategyProof.commonFactor", "公因數辨識錯誤。", "arithmetic_and_expression");
  }
}

function validateNearRoundAdd(question, errors, completionOnly = false) {
  const q = question.quantities ?? {};
  if (!isIntegerArray(q.terms, 3)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities.terms", "連加補償題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  requireNumericAnswer(question, q.terms.reduce((sum, value) => sum + value, 0), errors);
  if (completionOnly) {
    const indices = question.strategyProof?.completionPairIndices;
    if (!Array.isArray(indices) || indices.length !== 2 || q.terms[indices[0]] + q.terms[indices[1]] !== question.strategyProof?.completionPairSum) {
      add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "strategyProof.completionPairIndices", "湊整配對不成立。", "arithmetic_and_expression");
    }
  } else {
    if (!isIntegerArray(q.roundBases, q.terms.length) || q.roundBases.length !== q.terms.length) {
      add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities.roundBases", "補償基準數缺漏。", "arithmetic_and_expression");
    } else {
      const offsets = q.roundBases.map((base, index) => base - q.terms[index]);
      if (offsets.some((offset) => offset < 1 || offset > 9) || JSON.stringify(offsets) !== JSON.stringify(question.strategyProof?.compensationOffsets)) {
        add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "strategyProof.compensationOffsets", "連加補償量錯誤。", "arithmetic_and_expression");
      }
    }
  }
}

function validateNearRoundSub(question, errors, expectedCountRange) {
  const q = question.quantities ?? {};
  if (!isInteger(q.minuend) || !isIntegerArray(q.subtrahends, expectedCountRange[0]) || q.subtrahends.length > expectedCountRange[1]) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "連減補償題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const expected = q.minuend - q.subtrahends.reduce((sum, value) => sum + value, 0);
  requireNumericAnswer(question, expected, errors);
  if (!isIntegerArray(q.roundBases, q.subtrahends.length) || q.roundBases.length !== q.subtrahends.length) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities.roundBases", "連減補償基準數缺漏。", "arithmetic_and_expression");
    return;
  }
  const offsets = q.roundBases.map((base, index) => base - q.subtrahends[index]);
  if (offsets.some((offset) => offset < 1 || offset > 9) || JSON.stringify(offsets) !== JSON.stringify(question.strategyProof?.compensationOffsets)) {
    add(errors, "G5A_U08_ILLEGAL_SUBTRACTION_REGROUP", "strategyProof.compensationOffsets", "減數補償方向或補償量錯誤。", "arithmetic_and_expression");
  }
}

function validateNearRoundMultiply(question, errors, direction) {
  const q = question.quantities ?? {};
  if (![q.factor, q.multiplier, q.roundBase, q.offset].every(isInteger) || q.direction !== direction) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "接近整數乘法題數量結構錯誤。", "arithmetic_and_expression");
    return;
  }
  const expectedFactor = direction === "below" ? q.roundBase - q.offset : q.roundBase + q.offset;
  if (q.factor !== expectedFactor || q.offset < 1 || q.offset > 9) {
    add(errors, "G5A_U08_EXPRESSION_NOT_EQUIVALENT", "quantities.factor", "接近整數補償結構錯誤。", "arithmetic_and_expression");
  }
  requireNumericAnswer(question, q.factor * q.multiplier, errors);
}

function validateMissingOperator(question, errors) {
  const stage = "structured_reasoning";
  const q = question.quantities ?? {};
  const operators = question.structuredAnswer?.operators;
  if (!isIntegerArray(q.operands, 3) || q.operands.length !== 3 || !isInteger(q.target) || !Array.isArray(operators) || operators.length !== 2) {
    add(errors, "G5A_U08_OPERATOR_SEQUENCE_INCORRECT", "structuredAnswer", "缺運算符號答案結構錯誤。", stage);
    return;
  }
  const value = evaluateOperatorSequence(q.operands, operators);
  if (value !== q.target || question.finalAnswer !== q.target || question.answerText !== operators.join("、")) {
    add(errors, "G5A_U08_OPERATOR_SEQUENCE_INCORRECT", "structuredAnswer.operators", "運算符號序列不能得到目標值。", stage);
  }
  const solutionCount = countOperatorSolutions(q.operands, q.target);
  if (solutionCount !== 1 || question.strategyProof?.solutionCount !== 1) {
    add(errors, "G5A_U08_OPERATOR_SEQUENCE_AMBIGUOUS", "strategyProof.solutionCount", "缺運算符號題必須只有一組答案。", stage);
  }
  if (question.answerModelShape !== "operatorSequenceAnswer") {
    add(errors, "G5A_U08_OPERATOR_SEQUENCE_INCORRECT", "answerModelShape", "答案模型必須是 operatorSequenceAnswer。", stage);
  }
}

function validateEquality(question, errors, expectedEqual) {
  const stage = "structured_reasoning";
  const q = question.quantities ?? {};
  const answer = question.structuredAnswer ?? {};
  if (![q.a, q.b, q.c].every(isInteger)) {
    add(errors, "G5A_U08_OPERATION_SIGNATURE_MISMATCH", "quantities", "等值判斷題數量結構錯誤。", stage);
    return;
  }
  const leftValue = expectedEqual ? q.a * q.c + q.b * q.c : q.a * q.c - q.b * q.c;
  const rightValue = expectedEqual ? (q.a + q.b) * q.c : (q.a - q.b) * q.c * q.c;
  if (
    answer.isEqual !== expectedEqual ||
    answer.leftValue !== leftValue ||
    answer.rightValue !== rightValue ||
    question.finalAnswer !== (expectedEqual ? 1 : 0)
  ) {
    add(errors, "G5A_U08_EQUALITY_JUDGEMENT_INCORRECT", "structuredAnswer", "兩式等值判斷或計算值錯誤。", stage);
  }
  const expectedErrorType = expectedEqual ? null : "duplicated_common_factor";
  if (answer.errorType !== expectedErrorType) {
    add(errors, "G5A_U08_ERROR_TYPE_INCORRECT", "structuredAnswer.errorType", "錯誤類型辨識不正確。", stage);
  }
  if (question.answerModelShape !== "equalityJudgementAnswer") {
    add(errors, "G5A_U08_EQUALITY_JUDGEMENT_INCORRECT", "answerModelShape", "答案模型必須是 equalityJudgementAnswer。", stage);
  }
}

function validatePattern(question, errors) {
  switch (question.patternSpecId) {
    case "ps_g5a_u08_mixed_precedence_3op": return validateMixedPrecedence3(question, errors);
    case "ps_g5a_u08_mixed_precedence_4op": return validateMixedPrecedence4(question, errors);
    case "ps_g5a_u08_add_sub_signed_regroup": return validateSignedRegroup(question, errors);
    case "ps_g5a_u08_consecutive_subtraction": return validateConsecutiveSubtraction(question, errors);
    case "ps_g5a_u08_mul_div_factor_regroup": return validateMulDivRegroup(question, errors);
    case "ps_g5a_u08_continuous_division": return validateContinuousDivision(question, errors);
    case "ps_g5a_u08_distributive_expand_add": return validateDistributive(question, errors, "add");
    case "ps_g5a_u08_distributive_expand_sub": return validateDistributive(question, errors, "sub");
    case "ps_g5a_u08_common_factor_add": return validateCommonFactor(question, errors, "add");
    case "ps_g5a_u08_common_factor_sub": return validateCommonFactor(question, errors, "sub");
    case "ps_g5a_u08_near_round_add_multi": return validateNearRoundAdd(question, errors, false);
    case "ps_g5a_u08_round_completion_add": return validateNearRoundAdd(question, errors, true);
    case "ps_g5a_u08_near_round_sub_two": return validateNearRoundSub(question, errors, [2, 2]);
    case "ps_g5a_u08_near_round_sub_multi": return validateNearRoundSub(question, errors, [3, 4]);
    case "ps_g5a_u08_near_round_multiply_below": return validateNearRoundMultiply(question, errors, "below");
    case "ps_g5a_u08_near_round_multiply_above": return validateNearRoundMultiply(question, errors, "above");
    case "ps_g5a_u08_missing_operator_sequence": return validateMissingOperator(question, errors);
    case "ps_g5a_u08_equivalence_valid": return validateEquality(question, errors, true);
    case "ps_g5a_u08_equivalence_invalid_duplicate_factor": return validateEquality(question, errors, false);
    default:
      add(errors, "G5A_U08_PATTERN_SPEC_MISMATCH", "patternSpecId", "PatternSpec 未實作。", "identity");
  }
}

export function validateG5AU08HiddenQuestion(question) {
  const errors = [];
  const warnings = [];
  const spec = validateIdentity(question, errors);
  validateDepthAndPresentation(question ?? {}, errors);
  if (spec) validatePattern(question, errors);
  const valid = errors.length === 0;
  return Object.freeze({
    valid,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    output: valid ? question : null,
  });
}

export function validateG5AU08HiddenBatch(batch) {
  const errors = [];
  const warnings = [];
  const questions = Array.isArray(batch?.questions) ? batch.questions : [];
  if (
    batch?.sourceId !== "g5a_u08_5a08" ||
    batch?.unitCode !== "5A-U08" ||
    batch?.kind !== "g5aU08IntegerFourOperationsBatch"
  ) {
    add(errors, "G5A_U08_SOURCE_ID_MISMATCH", "batch.sourceId", "批次來源不是 G5A-U08。", "identity");
  }
  if (
    batch?.generatorRouting !== "hidden_only_not_canonical" ||
    batch?.fallbackUsed === true ||
    questions.length !== batch?.questionCount
  ) {
    add(errors, "G5A_U08_GENERIC_FALLBACK_FORBIDDEN", "batch.generatorRouting", "批次 routing、fallback 或題數契約錯誤。", "production_gate");
  }
  questions.forEach((question, index) => {
    const result = validateG5AU08HiddenQuestion(question);
    for (const entry of result.errors) {
      errors.push({ ...entry, path: `questions[${index}].${entry.path}` });
    }
  });

  const promptCounts = new Map();
  for (const question of questions) {
    promptCounts.set(question.promptText, (promptCounts.get(question.promptText) ?? 0) + 1);
  }
  const duplicateCount = [...promptCounts.values()].filter((count) => count > 1).length;
  if (duplicateCount > 0) {
    warnings.push(issue(
      "G5A_U08_DUPLICATE_SURFACE_CONTEXT",
      "questions",
      `批次中有 ${duplicateCount} 組重複題面。`,
      "production_gate",
      "warning",
    ));
  }

  const valid = errors.length === 0;
  return Object.freeze({
    valid,
    errors: Object.freeze(errors),
    warnings: Object.freeze(warnings),
    output: valid ? batch : null,
    acceptedQuestions: valid ? questions : Object.freeze([]),
  });
}
