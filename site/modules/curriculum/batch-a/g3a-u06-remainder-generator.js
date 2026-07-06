export const G3A_U06_REMAINDER_SOURCE_ID = "g3a_u06_3a06";
export const G3A_U06_REMAINDER_SPEC_ID = "ps_g3a_u06_division_with_remainder";

function modelFor(sequenceNumber) {
  const divisor = 2 + ((sequenceNumber - 1) % 8);
  const quotient = 3 + ((sequenceNumber * 2) % 10);
  const remainder = 1 + (sequenceNumber % (divisor - 1));
  return { dividend: divisor * quotient + remainder, divisor, quotient, remainder };
}

export function makeDivisionWithRemainderQuestion(sequenceNumber = 1) {
  const model = modelFor(sequenceNumber);
  const answerText = `${model.quotient} 餘 ${model.remainder}`;
  return {
    id: `${G3A_U06_REMAINDER_SPEC_ID}-${sequenceNumber}`,
    patternSpecId: G3A_U06_REMAINDER_SPEC_ID,
    sourceId: G3A_U06_REMAINDER_SOURCE_ID,
    kind: "divisionWithRemainder",
    dividend: model.dividend,
    divisor: model.divisor,
    quotient: model.quotient,
    remainder: model.remainder,
    promptText: `${model.dividend} ÷ ${model.divisor} 的商和餘數是多少？`,
    displayText: `${model.dividend} ÷ ${model.divisor} = ${answerText}`,
    blankedDisplayText: `${model.dividend} ÷ ${model.divisor} = ___ 餘 ___`,
    answerText,
    finalAnswer: model.quotient,
    metadata: {
      patternId: G3A_U06_REMAINDER_SPEC_ID,
      sourceId: G3A_U06_REMAINDER_SOURCE_ID,
      patternTags: ["batch_a", "browser_bridge", G3A_U06_REMAINDER_SOURCE_ID, G3A_U06_REMAINDER_SPEC_ID],
      skillTags: ["integer_division_remainder", "two_digit", "one_digit", "remainder", "division"],
      difficultyTags: ["batch_a_browser_bridge", "two_digit_division_remainder"],
      curriculumNodeIds: [G3A_U06_REMAINDER_SOURCE_ID],
      canonicalSkillIds: ["integer_division_remainder"]
    }
  };
}

export function generateG3AU06DivisionWithRemainderQuestions(options = {}) {
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const questions = Array.from({ length: questionCount }, (_, index) => makeDivisionWithRemainderQuestion(index + 1));
  return { ok: true, plan: { sourceId: G3A_U06_REMAINDER_SOURCE_ID, patternSpecIds: [G3A_U06_REMAINDER_SPEC_ID], questionCount }, questions, allocation: [{ patternSpecId: G3A_U06_REMAINDER_SPEC_ID, questionCount }], errors: [], warnings: [] };
}
