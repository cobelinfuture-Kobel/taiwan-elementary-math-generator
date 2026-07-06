export function auditParityRangeMissingDigitQuestion(question = {}) {
  const expected = [];
  for (let ones = 0; ones <= 9; ones += 1) {
    const value = question.tensDigit * 10 + ones;
    const parityOk = question.parityTarget === "even" ? value % 2 === 0 : value % 2 === 1;
    if (value > question.lowerBound && value < question.upperBound && parityOk) expected.push(value);
  }
  return { ok: JSON.stringify(expected) === JSON.stringify(question.answers), errors: [], warnings: [] };
}
