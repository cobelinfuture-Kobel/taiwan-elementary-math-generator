import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-division-ordering-generator.js";

const SOURCE_ID = "g3a_u06_3a06";
const EXACT_PS_ID = "ps_g3a_u06_exact_division_check";
const DIVISIBILITY_PS_ID = "ps_g3a_u06_divisibility_exact_check";

function mixedSourcePlan(questionCount = 22, seed = "g3a-u06-mixed-random-order-test") {
  return {
    sourceId: SOURCE_ID,
    questionCount,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    printLayout: { columns: 4, rowsPerPage: 5, showAnswerKeyPage: true }
  };
}

test("G3A U06 mixed source random ordering interleaves both division KPs", () => {
  const result = generateBatchABrowserQuestions(mixedSourcePlan(22));
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.questions.length, 22);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), new Set([EXACT_PS_ID, DIVISIBILITY_PS_ID]));

  const firstHalfPatternIds = new Set(result.questions.slice(0, 11).map((question) => question.patternSpecId));
  assert.equal(firstHalfPatternIds.size, 2);

  const transitions = result.questions.slice(1).filter((question, index) => question.patternSpecId !== result.questions[index].patternSpecId).length;
  assert.equal(transitions >= 8, true, `mixed ordering transitions too low: ${transitions}`);
});
