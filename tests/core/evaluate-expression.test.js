import test from "node:test";
import assert from "node:assert/strict";

import {
  createBinaryNode,
  createValueNode
} from "../../src/core/expression-model.js";
import {
  collectIntermediateResults,
  evaluateExpression
} from "../../src/core/evaluate-expression.js";
import { createIntegerValue, getIntegerRawValue } from "../../src/core/number-value.js";
import {
  getOperatorDisplayToken,
  normalizeOperatorToken
} from "../../src/core/operators.js";

test("addition evaluation works", () => {
  const expression = createBinaryNode(
    "+",
    createValueNode(createIntegerValue(8), 1),
    createValueNode(createIntegerValue(5), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 13);
});

test("subtraction evaluation works", () => {
  const expression = createBinaryNode(
    "-",
    createValueNode(createIntegerValue(8), 1),
    createValueNode(createIntegerValue(5), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 3);
});

test("expression evaluation with canonical multiplication token works", () => {
  const expression = createBinaryNode(
    "×",
    createValueNode(createIntegerValue(3), 1),
    createValueNode(createIntegerValue(2), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 6);
});

test("expression evaluation with canonical division token works", () => {
  const expression = createBinaryNode(
    "÷",
    createValueNode(createIntegerValue(6), 1),
    createValueNode(createIntegerValue(2), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 3);
});

test("expression evaluation with ASCII multiplication alias works", () => {
  const expression = createBinaryNode(
    "*",
    createValueNode(createIntegerValue(3), 1),
    createValueNode(createIntegerValue(2), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 6);
  assert.equal(expression.operator, "×");
});

test("expression evaluation with ASCII division alias works", () => {
  const expression = createBinaryNode(
    "/",
    createValueNode(createIntegerValue(6), 1),
    createValueNode(createIntegerValue(2), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 3);
  assert.equal(expression.operator, "÷");
});

test("division by zero is rejected", () => {
  const expression = createBinaryNode(
    "÷",
    createValueNode(createIntegerValue(12), 1),
    createValueNode(createIntegerValue(0), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((error) => error.code).join(","), /division_by_zero/);
});

test("non-exact division is rejected", () => {
  const expression = createBinaryNode(
    "÷",
    createValueNode(createIntegerValue(10), 1),
    createValueNode(createIntegerValue(3), 2)
  );

  const result = evaluateExpression(expression);
  assert.equal(result.ok, false);
  assert.match(result.errors.map((error) => error.code).join(","), /division_not_exact_integer/);
});

test("intermediate result collection preserves evaluation order", () => {
  const expression = createBinaryNode(
    "-",
    createBinaryNode(
      "+",
      createValueNode(createIntegerValue(8), 1),
      createValueNode(createIntegerValue(5), 2)
    ),
    createValueNode(createIntegerValue(4), 3)
  );

  const intermediateValues = collectIntermediateResults(expression).map((value) => getIntegerRawValue(value));
  assert.deepEqual(intermediateValues, [13, 9]);
});

test("tree evaluation uses node structure instead of display text assumptions", () => {
  const expression = createBinaryNode(
    "+",
    createValueNode(createIntegerValue(20), 1),
    createValueNode(createIntegerValue(1), 2)
  );
  expression.displayText = "999 ÷ 0";

  const result = evaluateExpression(expression);
  assert.equal(result.ok, true);
  assert.equal(getIntegerRawValue(result.value), 21);
});

test("normalizeOperatorToken keeps canonical multiplication token", () => {
  assert.equal(normalizeOperatorToken("×"), "×");
});

test("normalizeOperatorToken maps ASCII multiplication alias to canonical token", () => {
  assert.equal(normalizeOperatorToken("*"), "×");
});

test("normalizeOperatorToken keeps canonical division token", () => {
  assert.equal(normalizeOperatorToken("÷"), "÷");
});

test("normalizeOperatorToken maps ASCII division alias to canonical token", () => {
  assert.equal(normalizeOperatorToken("/"), "÷");
});

test("getOperatorDisplayToken returns canonical multiplication display token", () => {
  assert.equal(getOperatorDisplayToken("×"), "×");
});

test("getOperatorDisplayToken returns canonical division display token", () => {
  assert.equal(getOperatorDisplayToken("÷"), "÷");
});

test("unsupported operator token is rejected", () => {
  assert.throws(
    () => createBinaryNode("^", createValueNode(createIntegerValue(1), 1), createValueNode(createIntegerValue(2), 2)),
    /Unsupported operator/
  );
});
