import test from "node:test";
import assert from "node:assert/strict";

import {
  classifyAdditionCarryProfile,
  classifyDivisionPlaceCaseProfile,
  classifyMultiplicationCarryProfile,
  classifySubtractionBorrowProfile
} from "../../src/curriculum/generator/algorithmic-complexity-samplers.js";
import {
  generateBatchASemanticQuestionFromPatternSpec,
  generateBatchASemanticQuestionSet,
  getBatchASemanticSamplerPatternSpecIds
} from "../../src/curriculum/generator/batch-a-semantic-generator.js";
import { collectOperandValues } from "../../src/core/expression-model.js";
import { getIntegerRawValue } from "../../src/core/number-value.js";

function rawOperands(question) {
  return collectOperandValues(question.expression).map(getIntegerRawValue);
}

test("S36B classifiers identify required semantic profiles", () => {
  assert.equal(classifyAdditionCarryProfile(4876, 3987).multiCarry, true);
  assert.equal(classifySubtractionBorrowProfile(5000, 1234).zeroBorrowChain, true);
  assert.equal(classifyMultiplicationCarryProfile(327, 8).multiplicationWithCarry, true);
  assert.equal(classifyDivisionPlaceCaseProfile(1008, 7).highPlaceInsufficient, true);
});

test("S36B semantic generator hardens addition row", () => {
  const result = generateBatchASemanticQuestionFromPatternSpec("ps_g3a_u02_4digit_add_multi_carry", { seed: "s36b-add" });
  assert.equal(result.ok, true);
  const [left, right] = rawOperands(result.question);
  assert.equal(classifyAdditionCarryProfile(left, right).multiCarry, true);
});

test("S36B semantic generator hardens subtraction row", () => {
  const result = generateBatchASemanticQuestionFromPatternSpec("ps_g3a_u02_4digit_sub_zero_borrow_chain", { seed: "s36b-sub" });
  assert.equal(result.ok, true);
  const [left, right] = rawOperands(result.question);
  assert.equal(classifySubtractionBorrowProfile(left, right).zeroBorrowChain, true);
});

test("S36B semantic generator hardens division row", () => {
  const result = generateBatchASemanticQuestionFromPatternSpec("ps_g4a_u04_4digit_by_1digit_high_place_insufficient", { seed: "s36b-div" });
  assert.equal(result.ok, true);
  const [dividend, divisor] = rawOperands(result.question);
  assert.equal(classifyDivisionPlaceCaseProfile(dividend, divisor).highPlaceInsufficient, true);
});

test("S36B semantic generator covers all immediate semantic rows", () => {
  assert.equal(getBatchASemanticSamplerPatternSpecIds().length, 20);
  const result = generateBatchASemanticQuestionSet({ seed: "s36b-set" });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 20);
});
