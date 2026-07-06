import { extractBatchAExpressionOperandValues } from "./carry-policy.js";

function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function digitAt(value, placeValue) {
  return Math.floor(value / (10 ** placeValue)) % 10;
}

function countBox(text) {
  return String(text ?? "").split("□").length - 1;
}

function mask(value, blanks) {
  const chars = String(value).split("");
  for (const blank of blanks) chars[blank.index] = "□";
  return chars.join("");
}

function distinctPlaces(blanks) {
  return new Set(blanks.map((blank) => blank.placeValue)).size === blanks.length;
}

export function validateZeroMiddleMultiplicationPolicy(definition, question) {
  if (definition?.zeroMiddlePolicy?.required !== true) return { ok: true, errors: [], warnings: [] };
  const operands = extractBatchAExpressionOperandValues(question.expression);
  const ok = operands.length === 2 && operands[0] >= 100 && operands[0] <= 999 && digitAt(operands[0], 1) === 0 && operands[1] >= 2 && operands[1] <= 9;
  return { ok, errors: ok ? [] : [issue("batch_a_g3a_u03_zero_middle_invalid", "zeroMiddlePolicy", "zero middle multiplication required")], warnings: [] };
}

export function validateMultiplicationMissingDigitQuestion(definition, question, errors) {
  if (definition?.kind !== "multiplicationMissingDigit") return;
  if (question.operator !== "multiply") errors.push(issue("batch_a_mul_missing_operator_invalid", "operator", "operator"));
  if (![question.left, question.right, question.result].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_mul_missing_value_invalid", "operands", "value"));
    return;
  }
  if (question.left * question.right !== question.result) errors.push(issue("batch_a_mul_missing_result_invalid", "result", "result"));
  if (!Array.isArray(question.blanks) || question.blanks.length !== 2) {
    errors.push(issue("batch_a_mul_missing_blank_count_invalid", "blanks", "blank count"));
    return;
  }
  if (!question.blanks.some((blank) => blank.target === "result")) errors.push(issue("batch_a_mul_missing_result_required", "blanks", "result blank"));
  const targets = question.blanks.map((blank) => blank.target).sort().join("");
  if (!["leftresult", "resultright"].includes(targets)) errors.push(issue("batch_a_mul_missing_shape_invalid", "blanks", "shape"));
  if (!distinctPlaces(question.blanks)) errors.push(issue("batch_a_mul_missing_same_place_invalid", "blanks", "same place"));

  const values = { left: question.left, right: question.right, result: question.result };
  const digits = [];
  for (const [index, blank] of question.blanks.entries()) {
    if (!["left", "right", "result"].includes(blank.target)) {
      errors.push(issue("batch_a_mul_missing_target_invalid", `blanks[${index}].target`, "target"));
      continue;
    }
    const text = String(values[blank.target]);
    if (!Number.isInteger(blank.index) || blank.index < 0 || blank.index >= text.length) {
      errors.push(issue("batch_a_mul_missing_index_invalid", `blanks[${index}].index`, "index"));
      continue;
    }
    const expectedPlace = text.length - 1 - blank.index;
    const expectedDigit = Number(text[blank.index]);
    if (blank.placeValue !== expectedPlace) errors.push(issue("batch_a_mul_missing_place_invalid", `blanks[${index}].placeValue`, "place"));
    if (blank.digit !== expectedDigit) errors.push(issue("batch_a_mul_missing_digit_invalid", `blanks[${index}].digit`, "digit"));
    digits.push(expectedDigit);
  }
  const answerText = digits.join(",");
  if (question.answerText !== answerText) errors.push(issue("batch_a_answer_incorrect", "answerText", "answer"));
  if (question.finalAnswer !== answerText) errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "answer"));
  if (!Array.isArray(question.missingDigits) || question.missingDigits.join(",") !== answerText) errors.push(issue("batch_a_mul_missing_digits_invalid", "missingDigits", "digits"));
  if (countBox(question.blankedDisplayText) !== 2) errors.push(issue("batch_a_mul_missing_placeholder_invalid", "blankedDisplayText", "placeholder"));

  const leftText = mask(question.left, question.blanks.filter((blank) => blank.target === "left"));
  const rightText = mask(question.right, question.blanks.filter((blank) => blank.target === "right"));
  const resultText = mask(question.result, question.blanks.filter((blank) => blank.target === "result"));
  if (question.blankedDisplayText !== `${leftText} × ${rightText} = ${resultText}`) errors.push(issue("batch_a_mul_missing_prompt_invalid", "blankedDisplayText", "prompt"));
}
