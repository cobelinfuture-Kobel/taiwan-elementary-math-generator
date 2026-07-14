function validCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function resolveWorksheetQuestionCount(worksheetDocument = {}) {
  const candidates = [
    worksheetDocument.questionCount,
    worksheetDocument.summary?.questionCount,
    Array.isArray(worksheetDocument.generatedQuestions) ? worksheetDocument.generatedQuestions.length : null,
    Array.isArray(worksheetDocument.questionItems) ? worksheetDocument.questionItems.length : null,
  ];
  for (const candidate of candidates) {
    const count = validCount(candidate);
    if (count !== null) return count;
  }
  return 0;
}
