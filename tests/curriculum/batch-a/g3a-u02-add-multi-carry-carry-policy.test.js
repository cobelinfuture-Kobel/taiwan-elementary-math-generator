import test from "node:test";
import assert from "node:assert/strict";

import { OPERATORS } from "../../../site/modules/core/constants.js";
import { createBinaryNode, createValueNode } from "../../../site/modules/core/expression-model.js";
import { createIntegerValue } from "../../../site/modules/core/number-value.js";
import {
  BATCH_A_CARRY_POLICY_ISSUE_CODES,
  extractBatchAExpressionOperandValues,
  hasAdditionCarry
} from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { getBatchABrowserPatternDefinition } from "../../../site/modules/curriculum/batch-a/source-pattern-index.js";

function createExpressionQuestion({ patternSpecId, sourceId, left, right, operator = OPERATORS.ADD, answer }) {
  return {
    id: `${patternSpecId}-manual-${left}-${operator}-${right}`,
    expression: createBinaryNode(
      operator,
      createValueNode(createIntegerValue(left), 1),
      createValueNode(createIntegerValue(right), 2),
      { groupingHint: "leftAssociative" }
    ),
    operandCount: 2,
    operatorsUsed: [operator],
    finalAnswer: createIntegerValue(answer),
    intermediateResults: [],
    blankTarget: { type: "finalAnswer" },
    duplicateKey: `(${left}${operator}${right})`,
    metadata: {
      patternId: patternSpecId,
      sourceId,
      patternTags: [],
      skillTags: [],
      difficultyTags: [],
      curriculumNodeIds: [sourceId],
      canonicalSkillIds: []
    }
  };
}

test("hasAdditionCarry returns true for required S43C7 valid fixtures", () => {
  const carryPolicy = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_add_multi_carry").carryPolicy;

  assert.equal(hasAdditionCarry(2358, 1467, 10, carryPolicy), true);
  assert.equal(hasAdditionCarry(4829, 3194, 10, carryPolicy), true);
  assert.equal(hasAdditionCarry(1099, 1001, 10, carryPolicy), true);
});

test("hasAdditionCarry returns false for required S43C7 no-carry fixtures", () => {
  const carryPolicy = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_add_multi_carry").carryPolicy;

  assert.equal(hasAdditionCarry(1234, 1111, 10, carryPolicy), false);
  assert.equal(hasAdditionCarry(2400, 1200, 10, carryPolicy), false);
});

test("target PatternSpec exposes the locked carryPolicy metadata", () => {
  const definition = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_add_multi_carry");

  assert.deepEqual(definition.carryPolicy, {
    kind: "addition_carry",
    mode: "at_least_one_carry",
    operandPositions: [1, 2],
    base: 10,
    scope: "generated_question",
    validatorRequired: true,
    checkedColumns: ["ones", "tens", "hundreds"],
    allowCarryIntoTenThousands: false
  });
});

test("generated target PatternSpec questions all satisfy carryPolicy", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: "g3a_u02_3a02",
    questionCount: 20,
    generationSeed: "s43c8-add-multi-carry"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));

  const definition = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_add_multi_carry");
  const targetQuestions = result.questions.filter((question) => question.metadata.patternId === definition.patternSpecId);
  assert.ok(targetQuestions.length > 0, "Expected generated add multi-carry questions.");

  for (const question of targetQuestions) {
    const operands = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(operands.length, 2);
    assert.equal(hasAdditionCarry(operands[0], operands[1], 10, definition.carryPolicy), true);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("validator rejects no-carry manually constructed target PatternSpec question", () => {
  const question = createExpressionQuestion({
    patternSpecId: "ps_g3a_u02_4digit_add_multi_carry",
    sourceId: "g3a_u02_3a02",
    left: 1234,
    right: 1111,
    answer: 2345
  });

  const result = validateBatchABrowserQuestion(question);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === BATCH_A_CARRY_POLICY_ISSUE_CODES.ADDITION_CARRY_REQUIRED_NOT_SATISFIED));
});

test("validator accepts valid carry manually constructed target PatternSpec question", () => {
  const question = createExpressionQuestion({
    patternSpecId: "ps_g3a_u02_4digit_add_multi_carry",
    sourceId: "g3a_u02_3a02",
    left: 2358,
    right: 1467,
    answer: 3825
  });

  const result = validateBatchABrowserQuestion(question);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});

test("non-target PatternSpecs remain unaffected by add carry policy", () => {
  const definition = getBatchABrowserPatternDefinition("ps_g3a_u02_4digit_sub_multi_borrow");
  assert.equal(definition.carryPolicy, null);

  const question = createExpressionQuestion({
    patternSpecId: "ps_g3a_u02_4digit_sub_multi_borrow",
    sourceId: "g3a_u02_3a02",
    left: 3000,
    right: 1000,
    operator: OPERATORS.SUBTRACT,
    answer: 2000
  });

  const result = validateBatchABrowserQuestion(question);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});
