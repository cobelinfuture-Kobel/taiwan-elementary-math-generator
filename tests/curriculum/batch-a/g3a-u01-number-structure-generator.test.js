import test from "node:test";
import assert from "node:assert/strict";

import {
  G3A_U01_NUMBER_STRUCTURE_PATTERN_IDS as P,
  arrangeDigitsMax,
  arrangeDigitsMin,
  chineseToNumber4Digit,
  generateG3AU01NumberStructureQuestion,
  numberToChinese4Digit,
  validateG3AU01NumberStructureQuestion
} from "../../../site/modules/curriculum/batch-a/g3a-u01-number-structure-generator.js";

test("S44I converts four-digit Arabic numbers and Chinese numerals", () => {
  assert.equal(numberToChinese4Digit(2798), "二千七百九十八");
  assert.equal(numberToChinese4Digit(4006), "四千零六");
  assert.equal(numberToChinese4Digit(5080), "五千零八十");
  assert.equal(chineseToNumber4Digit("二千七百九十八"), 2798);
  assert.equal(chineseToNumber4Digit("四千零六"), 4006);
  assert.equal(chineseToNumber4Digit("五千零八十"), 5080);
});

test("S44I generates and validates representation questions", () => {
  for (const patternSpecId of [P.numberToChineseBasic, P.numberToChineseZero, P.chineseToNumberBasic, P.chineseToNumberZero]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44i-representation", index: 1 });
    const result = validateG3AU01NumberStructureQuestion(question);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(question.sourceId, "g3a_u01_3a01");
    assert.equal(question.blankedDisplayText.includes("{"), false);
    assert.equal(question.answerText.length > 0, true);
  }
});

test("S44I generates and validates place-value decomposition questions", () => {
  for (const patternSpecId of [P.fullDecomposition, P.digitValue, P.sameDigit]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44i-decomposition", index: 2 });
    const result = validateG3AU01NumberStructureQuestion(question);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(question.sourceId, "g3a_u01_3a01");
    assert.equal(question.answerText.length > 0, true);
  }
});

test("S44I generates and validates place-value composition questions", () => {
  for (const patternSpecId of [P.standardComposition, P.nonstandardComposition, P.partialComposition]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44i-composition", index: 3 });
    const result = validateG3AU01NumberStructureQuestion(question);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(question.sourceId, "g3a_u01_3a01");
    assert.match(question.blankedDisplayText, /合起來是多少/);
  }
});

test("S44J generates and validates place-value unit conversion questions", () => {
  for (const patternSpecId of [P.tensToHundredsConversion, P.hundredsToThousandsConversion, P.moneyPlaceValueExchange]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44j-conversion", index: 4 });
    const result = validateG3AU01NumberStructureQuestion(question);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(question.sourceId, "g3a_u01_3a01");
    assert.equal(question.answer.quotient, Math.floor(question.sourceCount / 10));
    assert.equal(question.answer.remainder, question.sourceCount % 10);
  }
});

test("S44M1-1 unit conversion prompts ask quotient and remainder explicitly", () => {
  for (const patternSpecId of [P.tensToHundredsConversion, P.hundredsToThousandsConversion, P.moneyPlaceValueExchange]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44m1-unit-conversion", index: 10 });
    assert.match(question.blankedDisplayText, /還剩幾/);
    assert.equal(question.answerModel.shape, "quotient_remainder");
    assert.equal(question.answerText, `${question.answer.quotient}${question.targetUnit}又${question.answer.remainder}${question.sourceUnit}`);
    assert.equal(validateG3AU01NumberStructureQuestion(question).ok, true);
  }
});

test("S44J arranges digits into valid max and min four-digit numbers", () => {
  assert.equal(arrangeDigitsMax([0, 1, 6, 9]), 9610);
  assert.equal(arrangeDigitsMin([0, 1, 6, 9]), 1069);
  assert.equal(arrangeDigitsMax([2, 4, 7, 8]), 8742);
  assert.equal(arrangeDigitsMin([2, 4, 7, 8]), 2478);
});

test("S44J generates and validates digit arrangement questions", () => {
  for (const patternSpecId of [P.digitArrangementMax, P.digitArrangementMin, P.digitArrangementPair]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44j-arrangement", index: 5 });
    const result = validateG3AU01NumberStructureQuestion(question);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(question.sourceId, "g3a_u01_3a01");
    assert.equal(question.digits.length, 4);
    assert.equal(new Set(question.digits).size, 4);
  }
});

test("S44K generates and validates deterministic range reasoning questions", () => {
  for (const patternSpecId of [P.rangeCompareReasoning, P.serialNumberRange, P.priceRangeReasoning]) {
    const question = generateG3AU01NumberStructureQuestion({ patternSpecId, seed: "s44k-range", index: 6 });
    const result = validateG3AU01NumberStructureQuestion(question);
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(question.sourceId, "g3a_u01_3a01");
    assert.equal(question.blankedDisplayText.includes("{"), false);
    assert.equal(question.answerText.length > 0, true);
  }
});
