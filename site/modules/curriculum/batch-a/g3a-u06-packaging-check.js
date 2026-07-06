export function checkQuotativeDivisionPackagingQuestion(question = {}) {
  const ok = question.total === question.itemsPerGroup * question.groupCount && question.finalAnswer === question.groupCount;
  return { ok, errors: ok ? [] : [{ code: "g3a_u06_packaging_invalid", severity: "error", path: "question", message: "g3a_u06_packaging_invalid" }], warnings: [] };
}

export function checkQuotativeDivisionPackagingQuestions(questions = []) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const result = checkQuotativeDivisionPackagingQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
