import { normalizeOperatorToken } from "./operators.js";
import { assertIntegerValue } from "./number-value.js";

function cloneArray(values) {
  return Array.isArray(values) ? [...values] : [];
}

export function createValueNode(numberValue, sourceOperandPosition) {
  assertIntegerValue(numberValue);

  if (!Number.isInteger(sourceOperandPosition) || sourceOperandPosition < 1 || sourceOperandPosition > 4) {
    throw new Error("sourceOperandPosition must be an integer between 1 and 4.");
  }

  return {
    type: "value",
    value: numberValue,
    sourceOperandPosition
  };
}

export function createBinaryNode(operator, left, right, options = {}) {
  const normalizedOperator = normalizeOperatorToken(operator);
  if (!normalizedOperator) {
    throw new Error(`Unsupported operator '${operator}'.`);
  }

  return {
    type: "binary",
    operator: normalizedOperator,
    left,
    right,
    groupingHint: options.groupingHint ?? null,
    evaluated: options.evaluated ?? null
  };
}

export function isValueNode(node) {
  return node?.type === "value" && node.value !== undefined;
}

export function isBinaryNode(node) {
  return node?.type === "binary" && node.left !== undefined && node.right !== undefined;
}

export function collectOperandValues(expressionNode) {
  if (isValueNode(expressionNode)) {
    return [expressionNode.value];
  }

  if (!isBinaryNode(expressionNode)) {
    return [];
  }

  return [
    ...collectOperandValues(expressionNode.left),
    ...collectOperandValues(expressionNode.right)
  ];
}

export function collectOperators(expressionNode) {
  if (!isBinaryNode(expressionNode)) {
    return [];
  }

  return [
    expressionNode.operator,
    ...collectOperators(expressionNode.left),
    ...collectOperators(expressionNode.right)
  ];
}

export function createGeneratedQuestionSkeleton(args) {
  return {
    id: args.id,
    expression: args.expression,
    operandCount: args.operandCount,
    operatorsUsed: cloneArray(args.operatorsUsed),
    finalAnswer: args.finalAnswer,
    intermediateResults: cloneArray(args.intermediateResults),
    blankTarget: args.blankTarget,
    duplicateKey: args.duplicateKey,
    metadata: {
      patternId: args.metadata?.patternId ?? null,
      patternTags: cloneArray(args.metadata?.patternTags),
      skillTags: cloneArray(args.metadata?.skillTags),
      difficultyTags: cloneArray(args.metadata?.difficultyTags),
      curriculumNodeIds: cloneArray(args.metadata?.curriculumNodeIds),
      canonicalSkillIds: cloneArray(args.metadata?.canonicalSkillIds),
      precedenceMode: args.metadata?.precedenceMode ?? null,
      parenthesesMode: args.metadata?.parenthesesMode ?? null
    }
  };
}
