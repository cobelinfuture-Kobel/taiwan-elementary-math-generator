export function checkPartitiveDivisionEqualSharingQuestion(question = {}) {
  const ok = question.total === question.itemsPerGroup * question.groupCount && question.finalAnswer === question.itemsPerGroup;
  return { ok, errors: ok ? [] : [{ code: "g3a_u06_equal_sharing_invalid", severity: "error", path: "question", message: "g3a_u06_equal_sharing_invalid" }], warnings: [] };
}

export function checkPartitiveDivisionEqualSharingQuestions(questions = []) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const result = checkPartitiveDivisionEqualSharingQuestion(question);
    errors.push(...result.errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}
