export const G3A_U06_REMAINDER_SOURCE_ID = "g3a_u06_3a06";
export const G3A_U06_REMAINDER_SPEC_ID = "ps_g3a_u06_division_with_remainder";

const TWO_DIGIT_REMAINDER_MODELS = Object.freeze(buildTwoDigitRemainderModels());

function buildTwoDigitRemainderModels() {
  const models = [];
  for (let divisor = 2; divisor <= 9; divisor += 1) {
    for (let quotient = 1; quotient <= Math.floor(99 / divisor); quotient += 1) {
      for (let remainder = 1; remainder < divisor; remainder += 1) {
        const dividend = divisor * quotient + remainder;
        if (dividend >= 10 && dividend <= 99) {
          models.push({ dividend, divisor, quotient, remainder });
        }
      }
    }
  }
  return models.sort((left, right) => left.dividend - right.dividend || left.divisor - right.divisor || left.remainder - right.remainder);
}

function hashSeed(value) { let acc = 2166136261; for (const char of String(value ?? "default")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; } return acc || 1; }
function modelFor(sequenceNumber, seed) {
  const index = Math.max(1, Number.isInteger(sequenceNumber) ? sequenceNumber : 1) - 1;
  const offset = hashSeed(String(seed ?? "default") + ":" + G3A_U06_REMAINDER_SPEC_ID) % TWO_DIGIT_REMAINDER_MODELS.length;
  return TWO_DIGIT_REMAINDER_MODELS[(offset + index) % TWO_DIGIT_REMAINDER_MODELS.length];
}

export function makeDivisionWithRemainderQuestion(sequenceNumber = 1, seed = "default") {
  const model = modelFor(sequenceNumber, seed);
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
  const questions = Array.from({ length: questionCount }, (_, index) => makeDivisionWithRemainderQuestion(index + 1, options.generationSeed));
  return { ok: true, plan: { sourceId: G3A_U06_REMAINDER_SOURCE_ID, patternSpecIds: [G3A_U06_REMAINDER_SPEC_ID], questionCount }, questions, allocation: [{ patternSpecId: G3A_U06_REMAINDER_SPEC_ID, questionCount }], errors: [], warnings: [] };
}
