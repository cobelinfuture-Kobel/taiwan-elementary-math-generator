import { isBinaryNode, isValueNode } from "./expression-model.js";
import { numberValueToCanonicalText } from "./number-value.js";
import { getOperatorDisplayToken } from "./operators.js";

const FINAL_ANSWER_BLANK = "___";

const G3A_U03_TENS_DIVERSITY_FAMILY_BY_PATTERN_ID = Object.freeze({
  ps_g3a_u03_10_multiple_base_fact_scale: "C1_BASE_FACT_SCALE",
  ps_g3a_u03_10_multiple_number_of_tens: "C2_NUMBER_OF_TENS",
  ps_g3a_u03_10_multiple_decomposition: "C3_DECOMPOSITION",
  ps_g3a_u03_10_multiple_missing_digit: "C4_PARTIAL_PRODUCT_MISSING_DIGIT",
  ps_g3a_u03_10_multiple_misconception_diagnosis: "C5_MISCONCEPTION_DIAGNOSIS",
});

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

function integerFromValueNode(node) {
  if (!isValueNode(node)) return null;
  const text = numberValueToCanonicalText(node.value);
  return /^\d+$/.test(text) ? Number(text) : null;
}

function tensMultiplicationOperands(question) {
  const patternId = question?.metadata?.patternId ?? null;
  const family = G3A_U03_TENS_DIVERSITY_FAMILY_BY_PATTERN_ID[patternId] ?? null;
  if (!family || !isBinaryNode(question?.expression)) return null;
  const left = integerFromValueNode(question.expression.left);
  const right = integerFromValueNode(question.expression.right);
  const product = Number(numberValueToCanonicalText(question.finalAnswer));
  if (!Number.isSafeInteger(left) || !Number.isSafeInteger(right) || !Number.isSafeInteger(product)) return null;
  if (left < 10 || left > 90 || left % 10 !== 0 || right < 2 || right > 9 || product !== left * right) return null;
  const baseDigit = left / 10;
  const baseProduct = baseDigit * right;
  return { patternId, family, left, right, product, baseDigit, baseProduct };
}

function misconceptionWrongAnswer(model) {
  const variant = (model.baseDigit + model.right) % 3;
  if (variant === 0) return model.baseProduct;
  if (variant === 1) return model.product * 10;
  return (model.baseProduct + 1) * 10;
}

function formatG3AU03TensDiversity(question) {
  const model = tensMultiplicationOperands(question);
  if (!model) return null;

  if (model.family === "C1_BASE_FACT_SCALE") {
    const expressionText = `${model.baseDigit} × ${model.right} = ${model.baseProduct}，所以 ${model.left} × ${model.right}`;
    return {
      displayText: `${expressionText} = ${model.product}`,
      blankedDisplayText: `${expressionText} = ${FINAL_ANSWER_BLANK}`,
      answerText: String(model.product),
      expressionText,
      hasGrouping: false,
    };
  }

  if (model.family === "C2_NUMBER_OF_TENS") {
    const expressionText = `${model.baseDigit} 個十 × ${model.right}`;
    return {
      displayText: `${expressionText} = ${model.baseProduct} 個十 = ${model.product}`,
      blankedDisplayText: `${expressionText} = ___ 個十 = ___`,
      answerText: `${model.baseProduct} 個十 = ${model.product}`,
      expressionText,
      hasGrouping: false,
    };
  }

  if (model.family === "C3_DECOMPOSITION") {
    const expressionText = `${model.left} × ${model.right} = (${model.baseDigit} × ${model.right}) × 10`;
    return {
      displayText: `${expressionText} = ${model.product}`,
      blankedDisplayText: `${expressionText} = ${FINAL_ANSWER_BLANK}`,
      answerText: String(model.product),
      expressionText,
      hasGrouping: true,
    };
  }

  if (model.family === "C4_PARTIAL_PRODUCT_MISSING_DIGIT") {
    const productText = String(model.product);
    const missingIndex = productText.length - 2;
    const missingDigit = productText[missingIndex];
    const maskedProduct = `${productText.slice(0, missingIndex)}□${productText.slice(missingIndex + 1)}`;
    const expressionText = `${model.left} × ${model.right}`;
    return {
      displayText: `${expressionText} = ${model.product}`,
      blankedDisplayText: `${expressionText} = ${maskedProduct}`,
      answerText: missingDigit,
      expressionText,
      hasGrouping: false,
    };
  }

  if (model.family === "C5_MISCONCEPTION_DIAGNOSIS") {
    const wrongAnswer = misconceptionWrongAnswer(model);
    const statement = `有人說「${model.left} × ${model.right} = ${wrongAnswer}」`;
    return {
      displayText: `${statement}。這個答案不正確，正確答案是 ${model.product}`,
      blankedDisplayText: `${statement}。這個答案正確嗎？請寫出正確答案：___`,
      answerText: `錯，正確答案是 ${model.product}`,
      expressionText: `${model.left} × ${model.right}`,
      hasGrouping: false,
    };
  }

  return null;
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
  const diversityProjection = formatG3AU03TensDiversity(question);
  if (diversityProjection) return diversityProjection;

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
  const blankedDisplayText = formatted.blankedDisplayText ?? formatBlankedDisplayText(
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
  const projectedAnswerText = G3A_U03_TENS_DIVERSITY_FAMILY_BY_PATTERN_ID[questionDisplayModel?.patternId]
    ? questionDisplayModel.answerText
    : null;
  return {
    questionId: question.id,
    questionNumber: questionDisplayModel.questionNumber,
    patternId: questionDisplayModel.patternId,
    promptText: questionDisplayModel.blankedDisplayText,
    answerText: explicitAnswerText ?? projectedAnswerText ?? formatAnswerText(question.finalAnswer),
    metadataSnapshot: createMetadataSnapshot(question)
  };
}
