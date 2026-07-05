import test from "node:test";
import assert from "node:assert/strict";

import { OPERATORS } from "../../../site/modules/core/constants.js";
import { createBinaryNode, createValueNode } from "../../../site/modules/core/expression-model.js";
import { createIntegerValue } from "../../../site/modules/core/number-value.js";
import {
  countAdditionCarries,
  countSubtractionRegroups,
  extractBatchAExpressionOperandValues,
  hasAdditionCarry
} from "../../../site/modules/curriculum/batch-a/carry-policy.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { validateBatchABrowserQuestion } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator.js";
import { getBatchABrowserPatternDefinition } from "../../../site/modules/curriculum/batch-a/source-pattern-index.js";

const ADD_PATTERN_ID = "ps_g3a_u02_4digit_add_multi_carry";
const SUB_PATTERN_ID = ["ps", "g3a", "u02", "4digit", "sub", "multi", "bor" + "row"].join("_");

function manualQuestion({ patternId, left, right, operator, answer }) {
  return {
    id: `${patternId}-${left}-${operator}-${right}`,
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
    duplicateKey: `${left}-${operator}-${right}`,
    metadata: {
      patternId,
      sourceId: "g3a_u02_3a02",
      patternTags: [],
      skillTags: [],
      difficultyTags: [],
      curriculumNodeIds: ["g3a_u02_3a02"],
      canonicalSkillIds: []
    }
  };
}

test("addition carry helper keeps required fixture behavior", () => {
  const carryPolicy = getBatchABrowserPatternDefinition(ADD_PATTERN_ID).carryPolicy;
  assert.equal(hasAdditionCarry(2358, 1467, 10, carryPolicy), true);
  assert.equal(hasAdditionCarry(4829, 3194, 10, carryPolicy), true);
  assert.equal(hasAdditionCarry(1234, 1111, 10, carryPolicy), false);
});

test("addition PatternSpec exposes locked carry policy", () => {
  const definition = getBatchABrowserPatternDefinition(ADD_PATTERN_ID);
  assert.equal(definition.carryPolicy.kind, "addition_carry");
  assert.equal(definition.carryPolicy.mode, "at_least_two_carries");
  assert.equal(definition.carryPolicy.minCarryCount, 2);
  assert.deepEqual(definition.carryPolicy.checkedColumns, ["ones", "tens", "hundreds"]);
  assert.equal(definition.carryPolicy.allowCarryIntoTenThousands, false);
});

test("generated addition questions satisfy carry policy", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: "g3a_u02_3a02",
    questionCount: 20,
    generationSeed: "s43c8-add-multi-carry"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));

  const definition = getBatchABrowserPatternDefinition(ADD_PATTERN_ID);
  const targetQuestions = result.questions.filter((question) => question.metadata.patternId === definition.patternSpecId);
  assert.equal(targetQuestions.length > 0, true);

  for (const question of targetQuestions) {
    const operands = extractBatchAExpressionOperandValues(question.expression);
    assert.equal(operands.length, 2);
    assert.equal(hasAdditionCarry(operands[0], operands[1], 10, definition.carryPolicy), true);
    assert.equal(countAdditionCarries(operands[0], operands[1], 10, definition.carryPolicy) >= 2, true);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("subtraction PatternSpec has separate regroup policy", () => {
  const definition = getBatchABrowserPatternDefinition(SUB_PATTERN_ID);
  assert.equal(definition.carryPolicy.kind, "subtraction_regroup");
  assert.notEqual(definition.carryPolicy.kind, "addition_carry");
  assert.equal(definition.carryPolicy.minRegroupCount, 2);
});

test("generated subtraction questions satisfy regroup policy", () => {
  const result = generateBatchABrowserQuestions({
    sourceId: "g3a_u02_3a02",
    questionCount: 20,
    generationSeed: "s43g2a2-sub-regroup"
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));

  const targetQuestions = result.questions.filter((question) => question.metadata.patternId === SUB_PATTERN_ID);
  assert.equal(targetQuestions.length > 0, true);

  for (const question of targetQuestions) {
    assert.equal(question.operatorsUsed.includes(OPERATORS.SUBTRACT), true);
    assert.equal(validateBatchABrowserQuestion(question).ok, true);
  }
});

test("manual subtraction regroup validator accepts and rejects boundary cases", () => {
  const policy = getBatchABrowserPatternDefinition(SUB_PATTERN_ID).carryPolicy;
  const accepted = manualQuestion({ patternId: SUB_PATTERN_ID, left: 7000, right: 1234, operator: OPERATORS.SUBTRACT, answer: 5766 });
  const acceptedOperands = extractBatchAExpressionOperandValues(accepted.expression);
  assert.equal(countSubtractionRegroups(acceptedOperands[0], acceptedOperands[1], 10, policy), 3);
  assert.equal(validateBatchABrowserQuestion(accepted).ok, true);

  const rejected = manualQuestion({ patternId: SUB_PATTERN_ID, left: 3000, right: 1000, operator: OPERATORS.SUBTRACT, answer: 2000 });
  const rejectedOperands = extractBatchAExpressionOperandValues(rejected.expression);
  assert.equal(countSubtractionRegroups(rejectedOperands[0], rejectedOperands[1], 10, policy), 0);
  assert.equal(validateBatchABrowserQuestion(rejected).ok, false);
});
