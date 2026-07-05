function issue(code, path, message) {
  return { code, severity: "error", path, message };
}

function countPlaceholder(text) {
  return String(text ?? "").split("□").length - 1;
}

function placeValueForIndex(value, index) {
  return String(value).length - 1 - index;
}

function maskMultipleDigits(value, blanks) {
  const chars = String(value).split("");
  for (const blank of blanks) chars[blank.index] = "□";
  return chars.join("");
}

export function validateEquationBlankQuestion(definition, question, errors) {
  if (!["add", "subtract"].includes(question.operator) || question.operator !== definition.operator) {
    errors.push(issue("batch_a_equation_blank_operator_invalid", "operator", "Equation blank operator mismatch."));
    return;
  }

  const left = question.left;
  const right = question.right;
  const result = question.result;
  if (![left, right, result].every(Number.isSafeInteger)) {
    errors.push(issue("batch_a_equation_blank_value_invalid", "operands", "Equation blank operands and result must be safe integers."));
    return;
  }

  const expectedResult = question.operator === "add" ? left + right : left - right;
  if (expectedResult !== result) {
    errors.push(issue("batch_a_equation_blank_result_invalid", "result", "Equation blank result mismatch."));
  }

  if (!Array.isArray(question.blanks) || question.blanks.length < 2) {
    errors.push(issue("batch_a_equation_blank_list_invalid", "blanks", "Equation blank requires multiple blanks."));
    return;
  }

  const targets = { left, right, result };
  const placeValues = new Set();
  const digits = [];
  let resultBlankCount = 0;

  for (const [index, blank] of question.blanks.entries()) {
    if (!["left", "right", "result"].includes(blank.target)) {
      errors.push(issue("batch_a_equation_blank_target_invalid", `blanks[${index}].target`, "Equation blank target is invalid."));
      continue;
    }
    const targetText = String(targets[blank.target]);
    if (!Number.isInteger(blank.index) || blank.index < 0 || blank.index >= targetText.length) {
      errors.push(issue("batch_a_equation_blank_index_invalid", `blanks[${index}].index`, "Equation blank index is invalid."));
      continue;
    }
    const expectedDigit = Number(targetText[blank.index]);
    const expectedPlaceValue = placeValueForIndex(targets[blank.target], blank.index);
    if (placeValues.has(expectedPlaceValue)) {
      errors.push(issue("batch_a_equation_blank_place_duplicate", `blanks[${index}].placeValue`, "Two blanks use the same place value."));
    }
    placeValues.add(expectedPlaceValue);
    if (blank.target === "result") resultBlankCount += 1;
    if (blank.digit !== expectedDigit) {
      errors.push(issue("batch_a_equation_blank_digit_invalid", `blanks[${index}].digit`, "Equation blank digit mismatch."));
    }
    if (blank.placeValue !== expectedPlaceValue) {
      errors.push(issue("batch_a_equation_blank_place_invalid", `blanks[${index}].placeValue`, "Equation blank place value mismatch."));
    }
    digits.push(expectedDigit);
  }

  if (resultBlankCount < 1) {
    errors.push(issue("batch_a_equation_blank_result_required", "blanks", "Equation blank must include result C."));
  }

  const answerText = digits.join(",");
  if (question.answerText !== answerText) {
    errors.push(issue("batch_a_answer_incorrect", "answerText", "Equation blank answerText mismatch."));
  }
  if (question.finalAnswer !== answerText) {
    errors.push(issue("batch_a_answer_incorrect", "finalAnswer", "Equation blank finalAnswer mismatch."));
  }
  if (!Array.isArray(question.missingDigits) || question.missingDigits.join(",") !== answerText) {
    errors.push(issue("batch_a_equation_blank_digits_invalid", "missingDigits", "Equation blank digits mismatch."));
  }
  if (countPlaceholder(question.blankedDisplayText) !== question.blanks.length) {
    errors.push(issue("batch_a_equation_blank_placeholder_invalid", "blankedDisplayText", "Equation blank prompt placeholder count mismatch."));
  }

  const leftText = maskMultipleDigits(left, question.blanks.filter((blank) => blank.target === "left"));
  const rightText = maskMultipleDigits(right, question.blanks.filter((blank) => blank.target === "right"));
  const resultText = maskMultipleDigits(result, question.blanks.filter((blank) => blank.target === "result"));
  const symbol = question.operator === "add" ? "+" : "-";
  const expectedBlanked = `${leftText} ${symbol} ${rightText} = ${resultText}`;
  if (question.blankedDisplayText !== expectedBlanked) {
    errors.push(issue("batch_a_equation_blank_prompt_invalid", "blankedDisplayText", "Equation blank prompt does not match masked equation."));
  }
}
