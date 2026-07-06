import test from "node:test";
import assert from "node:assert/strict";

import { generateG3AU06PartitiveDivisionEqualSharingQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-word-problem-generator.js";

test("G3A U06 equal sharing generator emits valid models", () => {
  const result = generateG3AU06PartitiveDivisionEqualSharingQuestions({ questionCount: 12 });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 12);
  for (const question of result.questions) {
    assert.equal(question.total, question.itemsPerGroup * question.groupCount);
    assert.equal(question.finalAnswer, question.itemsPerGroup);
  }
});
