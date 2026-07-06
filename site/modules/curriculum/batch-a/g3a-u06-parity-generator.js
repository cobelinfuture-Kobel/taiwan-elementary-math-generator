export const G3A_U06_PARITY_SOURCE_ID = "g3a_u06_3a06";
export const G3A_U06_PARITY_SPEC_ID = "ps_g3a_u06_parity_range_missing_digit";

function parityName(target) {
  return target === "even" ? "偶數" : "奇數";
}

function buildAnswers(tensDigit, lowerBound, upperBound, target) {
  const answers = [];
  for (let ones = 0; ones <= 9; ones += 1) {
    const value = tensDigit * 10 + ones;
    const parityOk = target === "even" ? value % 2 === 0 : value % 2 === 1;
    if (value > lowerBound && value < upperBound && parityOk) answers.push(value);
  }
  return answers;
}

export function makeParityRangeMissingDigitQuestion(sequenceNumber = 1) {
  const tensDigit = 2 + ((sequenceNumber - 1) % 7);
  const target = sequenceNumber % 2 === 1 ? "even" : "odd";
  const lowerBound = tensDigit * 10;
  const upperBound = tensDigit * 10 + 7;
  const answers = buildAnswers(tensDigit, lowerBound, upperBound, target);
  const answerText = answers.join("、");
  return {
    id: G3A_U06_PARITY_SPEC_ID + "-" + sequenceNumber,
    patternSpecId: G3A_U06_PARITY_SPEC_ID,
    sourceId: G3A_U06_PARITY_SOURCE_ID,
    kind: "parityRangeMissingDigit",
    tensDigit,
    lowerBound,
    upperBound,
    parityTarget: target,
    answers,
    promptText: "有 1 個" + parityName(target) + "：" + tensDigit + "□，只知道 " + tensDigit + "□ < " + upperBound + "，而且 " + tensDigit + "□ > " + lowerBound + "，這個" + parityName(target) + "可能是多少？",
    displayText: answerText,
    blankedDisplayText: "有 1 個" + parityName(target) + "：" + tensDigit + "□，這個" + parityName(target) + "可能是多少？____",
    answerText,
    finalAnswer: answerText,
    metadata: { patternId: G3A_U06_PARITY_SPEC_ID, sourceId: G3A_U06_PARITY_SOURCE_ID }
  };
}

export function generateG3AU06ParityRangeMissingDigitQuestions(options = {}) {
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const questions = Array.from({ length: questionCount }, (_, index) => makeParityRangeMissingDigitQuestion(index + 1));
  return { ok: true, questions, allocation: [{ patternSpecId: G3A_U06_PARITY_SPEC_ID, questionCount }], errors: [], warnings: [] };
}
