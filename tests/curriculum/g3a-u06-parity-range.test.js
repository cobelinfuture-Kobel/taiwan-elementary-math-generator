import test from "node:test";
import assert from "node:assert/strict";

import { generateG3AU06ParityRangeMissingDigitQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-parity-generator.js";
import { auditParityRangeMissingDigitQuestion } from "../../site/modules/curriculum/batch-a/g3a-u06-parity-audit.js";

function key(question) {
  return `${question.tensDigit}:${question.parityTarget}:${question.lowerBound}:${question.upperBound}:${question.answerText}`;
}

test("G3A U06 parity range generator enumerates all valid answers", () => {
  const result = generateG3AU06ParityRangeMissingDigitQuestions({ questionCount: 10 });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 10);
  for (const question of result.questions) {
    const audited = auditParityRangeMissingDigitQuestion(question);
    assert.equal(audited.ok, true);
    assert.equal(question.answers.length > 0, true);
    assert.match(question.blankedDisplayText, /只知道/);
  }
});

test("G3A U06 parity range generator has enough unique printable prompts for a full 40-question page", () => {
  const result = generateG3AU06ParityRangeMissingDigitQuestions({ questionCount: 40 });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 40);
  assert.equal(new Set(result.questions.map(key)).size, 40);
  assert.equal(new Set(result.questions.map((question) => question.blankedDisplayText)).size, 40);
});
