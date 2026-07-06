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

function buildIntervalCandidates(tensDigit, target) {
  const intervals = [];
  for (let lowerOnes = 0; lowerOnes <= 8; lowerOnes += 1) {
    for (let upperOnes = lowerOnes + 2; upperOnes <= 10; upperOnes += 1) {
      const lowerBound = tensDigit * 10 + lowerOnes;
      const upperBound = tensDigit * 10 + upperOnes;
      const answers = buildAnswers(tensDigit, lowerBound, upperBound, target);
      if (answers.length > 0) intervals.push({ lowerBound, upperBound, answers });
    }
  }
  return intervals;
}

function selectInterval(intervalCandidates, index) {
  const multiAnswer = intervalCandidates.filter((interval) => interval.answers.length >= 2);
  const singleAnswer = intervalCandidates.filter((interval) => interval.answers.length === 1);
  const bucketIndex = Math.floor(index / 18);
  if (index % 5 === 4 && singleAnswer.length > 0) {
    return singleAnswer[bucketIndex % singleAnswer.length];
  }
  return multiAnswer[bucketIndex % multiAnswer.length] ?? intervalCandidates[bucketIndex % intervalCandidates.length];
}

function buildParityModel(sequenceNumber) {
  const index = Math.max(1, Number.isInteger(sequenceNumber) ? sequenceNumber : 1) - 1;
  const tensDigit = 1 + (index % 9);
  const target = Math.floor(index / 9) % 2 === 0 ? "even" : "odd";
  const intervalCandidates = buildIntervalCandidates(tensDigit, target);
  const interval = selectInterval(intervalCandidates, index);
  return { tensDigit, target, lowerBound: interval.lowerBound, upperBound: interval.upperBound, answers: interval.answers };
}

export function makeParityRangeMissingDigitQuestion(sequenceNumber = 1) {
  const model = buildParityModel(sequenceNumber);
  const answerText = model.answers.join("、");
  const promptText = "有 1 個" + parityName(model.target) + "：" + model.tensDigit + "□，只知道 " + model.tensDigit + "□ < " + model.upperBound + "，而且 " + model.tensDigit + "□ > " + model.lowerBound + "，這個" + parityName(model.target) + "可能是多少？";
  return {
    id: G3A_U06_PARITY_SPEC_ID + "-" + sequenceNumber,
    patternSpecId: G3A_U06_PARITY_SPEC_ID,
    sourceId: G3A_U06_PARITY_SOURCE_ID,
    kind: "parityRangeMissingDigit",
    tensDigit: model.tensDigit,
    lowerBound: model.lowerBound,
    upperBound: model.upperBound,
    parityTarget: model.target,
    answers: model.answers,
    promptText,
    displayText: promptText + answerText,
    blankedDisplayText: promptText + "____",
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
