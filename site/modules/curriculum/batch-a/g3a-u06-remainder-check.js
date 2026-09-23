import { G3A_U06_REMAINDER_SPEC_ID, G3A_U06_REMAINDER_SOURCE_ID } from "./g3a-u06-remainder-generator.js";

function issue(code, path) {
  return { code, severity: "error", path, message: code };
}

export function checkDivisionWithRemainderQuestion(question = {}) {
  const errors = [];
  if (question.patternSpecId !== G3A_U06_REMAINDER_SPEC_ID) errors.push(issue("g3a_u06_remainder_pattern_mismatch", "patternSpecId"));
  if (question.sourceId !== G3A_U06_REMAINDER_SOURCE_ID) errors.push(issue("g3a_u06_remainder_source_mismatch", "sourceId"));
  if (![question.dividend, question.divisor, question.quotient, question.remainder].every(Number.isSafeInteger)) {
    errors.push(issue("g3a_u06_remainder_value_invalid", "operands"));
    return { ok: false, errors, warnings: [] };
  }
  if (question.dividend < 10 || question.dividend > 99) errors.push(issue("g3a_u06_remainder_dividend_out_of_range", "dividend"));
  if (question.divisor < 2 || question.divisor > 9) errors.push(issue("g3a_u06_remainder_divisor_out_of_range", "divisor"));
  if (question.quotient < 1) errors.push(issue("g3a_u06_remainder_quotient_invalid", "quotient"));
  if (question.remainder <= 0 || question.remainder >= question.divisor) errors.push(issue("g3a_u06_remainder_invalid", "remainder"));
  if (question.dividend !== question.divisor * question.quotient + question.remainder) errors.push(issue("g3a_u06_remainder_equation_invalid", "dividend"));
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function checkDivisionWithRemainderQuestions(questions = []) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const result = checkDivisionWithRemainderQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
