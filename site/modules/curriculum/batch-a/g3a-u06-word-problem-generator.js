export const G3A_U06_SOURCE_ID = "g3a_u06_3a06";
export const G3A_U06_PACKAGING_SPEC_ID = "ps_g3a_u06_quotative_division_packaging";
export const G3A_U06_EQUAL_SHARING_SPEC_ID = "ps_g3a_u06_partitive_division_equal_sharing";

function hashSeed(value) { let acc = 2166136261; for (const char of String(value ?? "default")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; } return acc || 1; }
function shiftedSequence(sequenceNumber, seed, channel) { return sequenceNumber + (hashSeed(String(seed ?? "default") + ":" + channel) % 10000); }

export function makeQuotativeDivisionPackagingQuestion(sequenceNumber = 1, seed = "default") {
  const shifted = shiftedSequence(sequenceNumber, seed, G3A_U06_PACKAGING_SPEC_ID);
  const itemsPerGroup = 2 + ((shifted - 1) % 8);
  const groupCount = 3 + ((shifted * 2) % 9);
  const total = itemsPerGroup * groupCount;
  const promptText = "把 " + total + " 個蘋果，每 " + itemsPerGroup + " 個裝一盤，可以裝成幾盤？";
  return {
    id: G3A_U06_PACKAGING_SPEC_ID + "-" + sequenceNumber,
    patternSpecId: G3A_U06_PACKAGING_SPEC_ID,
    sourceId: G3A_U06_SOURCE_ID,
    kind: "divisionWordProblem",
    semanticModel: "quotative_division",
    total,
    itemsPerGroup,
    groupCount,
    promptText,
    displayText: promptText + String(groupCount),
    blankedDisplayText: promptText + "____",
    answerText: String(groupCount),
    finalAnswer: groupCount,
    metadata: { patternId: G3A_U06_PACKAGING_SPEC_ID, sourceId: G3A_U06_SOURCE_ID }
  };
}

export function makePartitiveDivisionEqualSharingQuestion(sequenceNumber = 1, seed = "default") {
  const shifted = shiftedSequence(sequenceNumber, seed, G3A_U06_EQUAL_SHARING_SPEC_ID);
  const groupCount = 2 + ((shifted - 1) % 8);
  const itemsPerGroup = 3 + ((shifted * 2) % 9);
  const total = itemsPerGroup * groupCount;
  const promptText = "把 " + total + " 個蘋果，平分成 " + groupCount + " 盤，每盤有幾個蘋果？";
  return {
    id: G3A_U06_EQUAL_SHARING_SPEC_ID + "-" + sequenceNumber,
    patternSpecId: G3A_U06_EQUAL_SHARING_SPEC_ID,
    sourceId: G3A_U06_SOURCE_ID,
    kind: "divisionWordProblem",
    semanticModel: "partitive_division",
    total,
    itemsPerGroup,
    groupCount,
    promptText,
    displayText: promptText + String(itemsPerGroup),
    blankedDisplayText: promptText + "____",
    answerText: String(itemsPerGroup),
    finalAnswer: itemsPerGroup,
    metadata: { patternId: G3A_U06_EQUAL_SHARING_SPEC_ID, sourceId: G3A_U06_SOURCE_ID }
  };
}

export function generateG3AU06QuotativeDivisionPackagingQuestions(options = {}) {
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const questions = Array.from({ length: questionCount }, (_, index) => makeQuotativeDivisionPackagingQuestion(index + 1, options.generationSeed));
  return { ok: true, questions, allocation: [{ patternSpecId: G3A_U06_PACKAGING_SPEC_ID, questionCount }], errors: [], warnings: [] };
}

export function generateG3AU06PartitiveDivisionEqualSharingQuestions(options = {}) {
  const questionCount = Number.isInteger(options.questionCount) ? options.questionCount : 20;
  const questions = Array.from({ length: questionCount }, (_, index) => makePartitiveDivisionEqualSharingQuestion(index + 1, options.generationSeed));
  return { ok: true, questions, allocation: [{ patternSpecId: G3A_U06_EQUAL_SHARING_SPEC_ID, questionCount }], errors: [], warnings: [] };
}
