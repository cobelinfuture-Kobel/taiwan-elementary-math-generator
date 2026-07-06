import test from "node:test";
import assert from "node:assert/strict";

import { generateG3AU06DivisionWithRemainderQuestions, G3A_U06_REMAINDER_SPEC_ID, G3A_U06_REMAINDER_SOURCE_ID } from "../../site/modules/curriculum/batch-a/g3a-u06-remainder-generator.js";
import { checkDivisionWithRemainderQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-remainder-check.js";
import { getBatchABrowserPatternDefinition } from "../../site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js";

test("G3A U06 division with remainder PatternSpec is available", () => {
  const definition = getBatchABrowserPatternDefinition(G3A_U06_REMAINDER_SPEC_ID);
  assert.equal(definition.sourceId, G3A_U06_REMAINDER_SOURCE_ID);
  assert.equal(definition.kind, "divisionWithRemainder");
  assert.equal(definition.title, "二位數除以一位數有餘數");
});

test("G3A U06 division with remainder generator emits valid quotient and remainder models", () => {
  const result = generateG3AU06DivisionWithRemainderQuestions({ questionCount: 16 });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 16);
  const checked = checkDivisionWithRemainderQuestions(result.questions);
  assert.equal(checked.ok, true, JSON.stringify(checked.errors, null, 2));
  for (const question of result.questions) {
    assert.equal(question.patternSpecId, G3A_U06_REMAINDER_SPEC_ID);
    assert.equal(question.sourceId, G3A_U06_REMAINDER_SOURCE_ID);
    assert.equal(question.dividend >= 10 && question.dividend <= 99, true);
    assert.equal(question.divisor >= 2 && question.divisor <= 9, true);
    assert.equal(question.remainder > 0 && question.remainder < question.divisor, true);
    assert.equal(question.dividend, question.divisor * question.quotient + question.remainder);
    assert.match(question.blankedDisplayText, /餘 ___/);
  }
});
