import test from "node:test";
import assert from "node:assert/strict";

import { generateG3AU06QuotativeDivisionPackagingQuestions, G3A_U06_PACKAGING_SPEC_ID, G3A_U06_SOURCE_ID } from "../../site/modules/curriculum/batch-a/g3a-u06-word-problem-generator.js";
import { checkQuotativeDivisionPackagingQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-packaging-check.js";

test("G3A U06 quotative packaging generator emits valid group-count models", () => {
  const result = generateG3AU06QuotativeDivisionPackagingQuestions({ questionCount: 12 });
  assert.equal(result.ok, true);
  assert.equal(result.questions.length, 12);
  const checked = checkQuotativeDivisionPackagingQuestions(result.questions);
  assert.equal(checked.ok, true, JSON.stringify(checked.errors, null, 2));
  for (const question of result.questions) {
    assert.equal(question.patternSpecId, G3A_U06_PACKAGING_SPEC_ID);
    assert.equal(question.sourceId, G3A_U06_SOURCE_ID);
    assert.equal(question.semanticModel, "quotative_division");
    assert.equal(question.total, question.itemsPerGroup * question.groupCount);
    assert.equal(question.finalAnswer, question.groupCount);
  }
});
