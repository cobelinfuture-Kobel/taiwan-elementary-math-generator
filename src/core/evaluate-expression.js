import { createIntegerValue, isIntegerValue } from "./number-value.js";
import { isBinaryNode, isValueNode } from "./expression-model.js";
import { applyIntegerOperator } from "./operators.js";

function createEvaluationIssue(code, path, message) {
  return { code, severity: "error", path, message };
}

function evaluateNode(node, path) {
  if (isValueNode(node)) {
    if (!isIntegerValue(node.value)) {
      return {
        ok: false,
        value: null,
        intermediateResults: [],
        errors: [createEvaluationIssue("expression_value_invalid", `${path}.value`, "Value nodes must contain integer NumberValue objects.")]
      };
    }

    return {
      ok: true,
      value: node.value,
      intermediateResults: [],
      errors: []
    };
  }

  if (!isBinaryNode(node)) {
    return {
      ok: false,
      value: null,
      intermediateResults: [],
      errors: [createEvaluationIssue("expression_node_invalid", path, "Expression node must be a value node or binary node.")]
    };
  }

  const leftResult = evaluateNode(node.left, `${path}.left`);
  const rightResult = evaluateNode(node.right, `${path}.right`);
  const errors = [...leftResult.errors, ...rightResult.errors];

  if (!leftResult.ok || !rightResult.ok || !leftResult.value || !rightResult.value) {
    return {
      ok: false,
      value: null,
      intermediateResults: [
        ...leftResult.intermediateResults,
        ...rightResult.intermediateResults
      ],
      errors
    };
  }

  try {
    const value = applyIntegerOperator(leftResult.value, node.operator, rightResult.value);
    return {
      ok: true,
      value,
      intermediateResults: [
        ...leftResult.intermediateResults,
        ...rightResult.intermediateResults,
        value
      ],
      errors
    };
  } catch (error) {
    return {
      ok: false,
      value: null,
      intermediateResults: [
        ...leftResult.intermediateResults,
        ...rightResult.intermediateResults
      ],
      errors: [
        ...errors,
        createEvaluationIssue(error.code ?? "evaluation_failed", path, error.message)
      ]
    };
  }
}

export function evaluateBinaryNode(binaryNode) {
  return evaluateNode(binaryNode, "expression");
}

export function evaluateExpression(expressionNode) {
  return evaluateNode(expressionNode, "expression");
}

export function collectIntermediateResults(expressionNode) {
  return evaluateExpression(expressionNode).intermediateResults;
}

export function validateIntegerEvaluationResult(evaluationResult) {
  const errors = [];

  if (!evaluationResult || typeof evaluationResult !== "object") {
    errors.push(createEvaluationIssue("evaluation_result_invalid", "evaluationResult", "Evaluation result must be an object."));
  } else {
    if (typeof evaluationResult.ok !== "boolean") {
      errors.push(createEvaluationIssue("evaluation_result_ok_invalid", "evaluationResult.ok", "Evaluation result ok flag must be a boolean."));
    }
    if (evaluationResult.value !== null && !isIntegerValue(evaluationResult.value)) {
      errors.push(createEvaluationIssue("evaluation_result_value_invalid", "evaluationResult.value", "Evaluation result value must be an integer NumberValue or null."));
    }
    if (!Array.isArray(evaluationResult.intermediateResults) || evaluationResult.intermediateResults.some((item) => !isIntegerValue(item))) {
      errors.push(createEvaluationIssue("evaluation_result_intermediates_invalid", "evaluationResult.intermediateResults", "Intermediate results must be an array of integer NumberValue objects."));
    }
    if (!Array.isArray(evaluationResult.errors)) {
      errors.push(createEvaluationIssue("evaluation_result_errors_invalid", "evaluationResult.errors", "Evaluation result errors must be an array."));
    }
  }

  return {
    ok: errors.length === 0,
    value: evaluationResult?.value ?? null,
    intermediateResults: Array.isArray(evaluationResult?.intermediateResults) ? evaluationResult.intermediateResults : [],
    errors
  };
}
