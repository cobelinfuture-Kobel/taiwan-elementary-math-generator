import test from "node:test";
import assert from "node:assert/strict";

import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/g3a-u06-division-ordering-generator.js";

const SOURCE_ID = "g3a_u06_3a06";
const EXPECTED_SPEC_IDS = new Set([
  "ps_g3a_u06_exact_division_check",
  "ps_g3a_u06_divisibility_exact_check",
  "ps_g3a_u06_division_with_remainder",
  "ps_g3a_u06_quotative_division_packaging",
  "ps_g3a_u06_partitive_division_equal_sharing",
  "ps_g3a_u06_parity_range_missing_digit"
]);

function mixedSourcePlan(questionCount = 24, seed = "g3a-u06-mixed-random-order-test") {
  return {
    sourceId: SOURCE_ID,
    questionCount,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: seed,
    printLayout: { columns: 4, rowsPerPage: 5, showAnswerKeyPage: true }
  };
}

test("G3A U06 mixed source random ordering interleaves all visible division KPs", () => {
  const result = generateBatchABrowserQuestions(mixedSourcePlan(24));
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.questions.length, 24);
  assert.deepEqual(new Set(result.questions.map((question) => question.patternSpecId)), EXPECTED_SPEC_IDS);

  const firstTwelvePatternIds = new Set(result.questions.slice(0, 12).map((question) => question.patternSpecId));
  assert.equal(firstTwelvePatternIds.size >= 4, true);

  const transitions = result.questions.slice(1).filter((question, index) => question.patternSpecId !== result.questions[index].patternSpecId).length;
  assert.equal(transitions >= 12, true, `mixed ordering transitions too low: ${transitions}`);
});
