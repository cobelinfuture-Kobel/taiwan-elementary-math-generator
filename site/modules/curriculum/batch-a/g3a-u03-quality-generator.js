import { OPERATORS } from "../../core/constants.js";
import { buildDuplicateKey, generateBatchABrowserQuestions as unused } from "./batch-a-browser-generator.js";
import { createBinaryNode, createGeneratedQuestionSkeleton, createValueNode } from "../../core/expression-model.js";
import { createIntegerValue } from "../../core/number-value.js";
import { buildBatchABrowserPlan, generateBatchABrowserQuestions as baseGenerateBatchABrowserQuestions } from "./batch-a-browser-generator.js";

const sourceId = "g3a_u03_3a03";
const u03SpecIds = Object.freeze([
  "ps_g3a_u03_2digit_by_1digit_carry",
  "ps_g3a_u03_10_multiple_by_1digit",
  "ps_g3a_u03_3digit_by_1digit",
  "ps_g3a_u03_consecutive_multiplication_two_step"
]);
const twoStepRows = Object.freeze([
  [3, 9, 6], [2, 7, 13], [6, 9, 13], [3, 2, 6], [9, 2, 20],
  [6, 2, 13], [4, 2, 6], [9, 3, 20], [7, 3, 13], [9, 4, 10],
  [6, 5, 3], [4, 5, 17], [9, 5, 10], [7, 6, 3], [4, 6, 17],
  [2, 6, 10], [7, 7, 3], [5, 7, 17], [2, 7, 10], [3, 6, 3]
]);

function isU03Plan(plan) {
  return plan?.sourceId === sourceId && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.some((id) => u03SpecIds.includes(id));
}

function allocateCounts(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  let remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId) => {
    const questionCountForPattern = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return { patternSpecId, questionCount: questionCountForPattern };
  }).filter((entry) => entry.questionCount > 0);
}

function pairFor(specId, sequenceNumber) {
  if (specId === "ps_g3a_u03_2digit_by_1digit_carry") {
    return [10 + ((sequenceNumber * 17) % 90), 2 + ((sequenceNumber * 5) % 8)];
  }
  if (specId === "ps_g3a_u03_10_multiple_by_1digit") {
    return [10 * (1 + ((sequenceNumber - 1) % 9)), 2 + ((sequenceNumber * 3) % 8)];
  }
  if (specId === "ps_g3a_u03_3digit_by_1digit") {
    return [100 + ((sequenceNumber * 137) % 900), 2 + ((sequenceNumber * 5) % 8)];
  }
  return null;
}

function metadata(specId) {
  return {
    sourceId,
    patternId: specId,
    patternTags: ["batch_a", "browser_bridge", sourceId, specId],
    skillTags: ["integer_multiplication"],
    difficultyTags: ["batch_a_browser_bridge", "g3a_u03_quality_locked"],
    curriculumNodeIds: [sourceId],
    canonicalSkillIds: ["integer_multiplication"],
    precedenceMode: "left_to_right",
    parenthesesMode: "none"
  };
}

function expressionFromOperands(operands) {
  let expression = createValueNode(createIntegerValue(operands[0]), 1);
  for (let index = 1; index < operands.length; index += 1) {
    expression = createBinaryNode(
      OPERATORS.MULTIPLY,
      expression,
      createValueNode(createIntegerValue(operands[index]), index + 1),
      { groupingHint: "leftAssociative" }
    );
  }
  return expression;
}

function makeQuestion(specId, operands, sequenceNumber) {
  const expression = expressionFromOperands(operands);
  const answer = operands.reduce((product, value) => product * value, 1);
  const answerValue = createIntegerValue(answer);
  return {
    ...createGeneratedQuestionSkeleton({
      id: `${specId}-${sequenceNumber}`,
      expression,
      operandCount: operands.length,
      operatorsUsed: operands.slice(1).map(() => OPERATORS.MULTIPLY),
      finalAnswer: answerValue,
      intermediateResults: [answerValue],
      blankTarget: { type: "finalAnswer" },
      duplicateKey: buildDuplicateKey(expression),
      metadata: metadata(specId)
    }),
    patternSpecId: specId,
    sourceId
  };
}

function generateU03Question(specId, sequenceNumber) {
  if (specId === "ps_g3a_u03_consecutive_multiplication_two_step") {
    return makeQuestion(specId, twoStepRows[(sequenceNumber - 1) % twoStepRows.length], sequenceNumber);
  }
  return makeQuestion(specId, pairFor(specId, sequenceNumber), sequenceNumber);
}

function shuffleIfNeeded(questions, plan) {
  if (plan.ordering !== "shuffleAcrossPatterns") return questions;
  return [...questions].sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

export function generateBatchABrowserQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!isU03Plan(plan)) return baseGenerateBatchABrowserQuestions(options);

  const allocation = Array.isArray(plan.allocation) && plan.allocation.length > 0 ? plan.allocation : allocateCounts(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  for (const entry of allocation) {
    if (!u03SpecIds.includes(entry.patternSpecId)) return baseGenerateBatchABrowserQuestions(options);
    for (let index = 0; index < entry.questionCount; index += 1) {
      questions.push(generateU03Question(entry.patternSpecId, questions.length + 1));
    }
  }

  return { ok: true, plan, questions: shuffleIfNeeded(questions, plan), allocation, errors: [], warnings: [] };
}
