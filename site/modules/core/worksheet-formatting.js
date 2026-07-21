import { isBinaryNode, isValueNode } from "./expression-model.js";
import { numberValueToCanonicalText } from "./number-value.js";
import { getOperatorDisplayToken } from "./operators.js";

const FINAL_ANSWER_BLANK = "___";

function cloneArray(values) {
  return Array.isArray(values) ? values.map((value) => deepCopyValue(value)) : [];
}

function deepCopyValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => deepCopyValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, deepCopyValue(nestedValue)])
    );
  }

  return value;
}

function createFormattingError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function formatExpressionNode(node, options = {}) {
  const { wrapBinary = false } = options;

  if (isValueNode(node)) {
    return {
      text: numberValueToCanonicalText(node.value),
      hasGrouping: false
    };
  }

  if (!isBinaryNode(node)) {
    throw createFormattingError("expression_node_invalid", "Expression node must be a value or binary node.");
  }

  const left = formatExpressionNode(node.left, { wrapBinary: true });
  const right = formatExpressionNode(node.right, { wrapBinary: true });
  const text = `${left.text} ${getOperatorDisplayToken(node.operator)} ${right.text}`;
  const groupedText = wrapBinary ? `(${text})` : text;

  return {
    text: groupedText,
    hasGrouping: true
  };
}

export function createMetadataSnapshot(question) {
  return {
    patternId: question?.metadata?.patternId ?? null,
    patternTags: cloneArray(question?.metadata?.patternTags),
    skillTags: cloneArray(question?.metadata?.skillTags),
    difficultyTags: cloneArray(question?.metadata?.difficultyTags),
    curriculumNodeIds: cloneArray(question?.metadata?.curriculumNodeIds),
    canonicalSkillIds: cloneArray(question?.metadata?.canonicalSkillIds),
    precedenceMode: question?.metadata?.precedenceMode ?? null,
    parenthesesMode: question?.metadata?.parenthesesMode ?? null,
    blankTarget: deepCopyValue(question?.blankTarget ?? null),
    duplicateKey: question?.duplicateKey ?? ""
  };
}

export function formatAnswerText(finalAnswer) {
  return numberValueToCanonicalText(finalAnswer);
}

export function formatExpressionPrompt(expression) {
  const result = formatExpressionNode(expression, { wrapBinary: false });
  return {
    expressionText: result.text,
    hasGrouping: result.hasGrouping
  };
}

export function formatQuestionDisplayText(question) {
  const prompt = formatExpressionPrompt(question.expression);
  const answerText = formatAnswerText(question.finalAnswer);

  return {
    displayText: `${prompt.expressionText} = ${answerText}`,
    answerText,
    expressionText: prompt.expressionText,
    hasGrouping: prompt.hasGrouping
  };
}

export function formatBlankedDisplayText(displayText, blankTarget, answerText) {
  const targetType = blankTarget?.type ?? "finalAnswer";

  if (targetType !== "finalAnswer") {
    throw createFormattingError(
      "blank_target_not_supported",
      `Blank target '${targetType}' is not supported in V1 worksheet formatting.`
    );
  }

  return displayText.slice(0, displayText.length - answerText.length) + FINAL_ANSWER_BLANK;
}

export function createQuestionDisplayModel(question, questionNumber, options = {}) {
  if (!Number.isInteger(questionNumber) || questionNumber < 1) {
    throw createFormattingError("question_number_invalid", "Question number must be a positive integer.");
  }

  const formatted = formatQuestionDisplayText(question);
  const blankedDisplayText = formatBlankedDisplayText(
    formatted.displayText,
    question.blankTarget,
    formatted.answerText
  );

  return {
    questionId: question.id,
    questionNumber,
    patternId: question?.metadata?.patternId ?? null,
    displayText: formatted.displayText,
    blankedDisplayText,
    answerText: formatted.answerText,
    questionNumberText: options.showQuestionNumbers === false ? null : `${questionNumber}.`,
    metadataSnapshot: createMetadataSnapshot(question),
    layoutHints: {
      operandCount: question.operandCount,
      operatorCount: Array.isArray(question.operatorsUsed) ? question.operatorsUsed.length : 0,
      estimatedTextLength: formatted.displayText.length,
      hasGrouping: formatted.hasGrouping
    }
  };
}

export function createAnswerKeyItem(question, questionDisplayModel) {
  const explicitAnswerText = typeof question?.answerText === "string" && question.answerText.length > 0
    ? question.answerText
    : null;
  return {
    questionId: question.id,
    questionNumber: questionDisplayModel.questionNumber,
    patternId: questionDisplayModel.patternId,
    promptText: questionDisplayModel.blankedDisplayText,
    answerText: explicitAnswerText ?? formatAnswerText(question.finalAnswer),
    metadataSnapshot: createMetadataSnapshot(question)
  };
}
