export const G3A_U06_SOURCE_ID = "g3a_u06_3a06";
export const G3A_U06_PACKAGING_SPEC_ID = "ps_g3a_u06_quotative_division_packaging";

export function makeQuotativeDivisionPackagingQuestion(sequenceNumber = 1) {
  const itemsPerGroup = 2 + ((sequenceNumber - 1) % 8);
  const groupCount = 3 + ((sequenceNumber * 2) % 9);
  const total = itemsPerGroup * groupCount;
  return {
    id: G3A_U06_PACKAGING_SPEC_ID + "-" + sequenceNumber,
    patternSpecId: G3A_U06_PACKAGING_SPEC_ID,
    sourceId: G3A_U06_SOURCE_ID,
    kind: "divisionWordProblem",
    semanticModel: "quotative_division",
    total,
    itemsPerGroup,
    groupCount,
    answerText: String(groupCount),
    finalAnswer: groupCount,
    metadata: { patternId: G3A_U06_PACKAGING_SPEC_ID, sourceId: G3A_U06_SOURCE_ID }
  };
}

export function generateG3AU06QuotativeDivisionPackagingQuestions(options = {}) {
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const questions = Array.from({ length: questionCount }, (_, index) => makeQuotativeDivisionPackagingQuestion(index + 1));
  return { ok: true, questions, allocation: [{ patternSpecId: G3A_U06_PACKAGING_SPEC_ID, questionCount }], errors: [], warnings: [] };
}
